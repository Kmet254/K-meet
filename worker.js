
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---------------------------------------------------------
    // KMEET API
    // ---------------------------------------------------------

    // Simple health check
    if (url.pathname === "/api/health") {
      return json({
        success: true,
        service: "Kmeet M-Pesa Worker",
        environment: "sandbox"
      });
    }

    // M-Pesa STK Push
    if (url.pathname === "/api/mpesa/stkpush") {
      if (request.method !== "POST") {
        return json(
          { success: false, error: "Method not allowed" },
          405
        );
      }

      return handleStkPush(request, env);
    }

    // M-Pesa callback
    if (url.pathname === "/api/mpesa/callback") {
      if (request.method !== "POST") {
        return json(
          { success: false, error: "Method not allowed" },
          405
        );
      }

      return handleMpesaCallback(request);
    }

    // ---------------------------------------------------------
    // EVERYTHING ELSE
    // ---------------------------------------------------------
    // Let Cloudflare serve your existing Kmeet HTML/CSS/images.
    return env.ASSETS.fetch(request);
  }
};


// ============================================================
// STK PUSH
// ============================================================

async function handleStkPush(request, env) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);
    const phone = normalizePhone(body.phone);

    const role = body.role || "";
    const packageSize = body.package || "";
    const targetId = body.targetId || "";

    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------

    if (!phone) {
      return json({
        success: false,
        error: "Enter a valid Kenyan M-Pesa phone number."
      }, 400);
    }

    // Only Kmeet's current prices are allowed.
    const allowedAmounts = [11, 49, 100];

    if (!allowedAmounts.includes(amount)) {
      return json({
        success: false,
        error: "Invalid Kmeet payment amount."
      }, 400);
    }

    if (!["sender", "receiver"].includes(role)) {
      return json({
        success: false,
        error: "Invalid payment role."
      }, 400);
    }

    // Sender packages must match the amount.
    if (role === "sender") {
      if (packageSize === "3" && amount !== 49) {
        return json({
          success: false,
          error: "Invalid 3-chat package amount."
        }, 400);
      }

      if (packageSize === "8" && amount !== 100) {
        return json({
          success: false,
          error: "Invalid 8-chat package amount."
        }, 400);
      }

      if (!["3", "8"].includes(packageSize)) {
        return json({
          success: false,
          error: "Invalid sender package."
        }, 400);
      }
    }

    if (role === "receiver" && amount !== 11) {
      return json({
        success: false,
        error: "Receiver continuation payment must be KSh 11."
      }, 400);
    }

    // --------------------------------------------------------
    // Required Cloudflare secrets
    // --------------------------------------------------------

    if (
      !env.MPESA_CONSUMER_KEY ||
      !env.MPESA_CONSUMER_SECRET ||
      !env.MPESA_SHORTCODE ||
      !env.MPESA_PASSKEY
    ) {
      return json({
        success: false,
        error: "M-Pesa Worker secrets are not configured yet."
      }, 500);
    }

    // --------------------------------------------------------
    // Get OAuth access token
    // --------------------------------------------------------

    const credentials = btoa(
      `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`
    );

    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`
        }
      }
    );

    const tokenText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      return json({
        success: false,
        error: "Unable to obtain M-Pesa access token.",
        details: tokenText
      }, 502);
    }

    let tokenData;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return json({
        success: false,
        error: "Invalid response from M-Pesa OAuth service."
      }, 502);
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return json({
        success: false,
        error: "M-Pesa access token was not returned.",
        details: tokenData
      }, 502);
    }

    // --------------------------------------------------------
    // Timestamp
    // --------------------------------------------------------

    const timestamp = getTimestamp();

    // Password = Base64(Shortcode + Passkey + Timestamp)
    const password = btoa(
      `${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp}`
    );

    // --------------------------------------------------------
    // Callback URL
    // --------------------------------------------------------

    const callbackUrl =
      `${new URL(request.url).origin}/api/mpesa/callback`;

    // --------------------------------------------------------
    // Account reference
    // --------------------------------------------------------

    let accountReference = "KMEET";

    if (role === "sender") {
      accountReference =
        packageSize === "8"
          ? "KMEET8"
          : "KMEET3";
    }

    if (role === "receiver") {
      accountReference = "KMEET11";
    }

    // --------------------------------------------------------
    // STK Push request
    // --------------------------------------------------------

    const stkPayload = {
      BusinessShortCode: Number(env.MPESA_SHORTCODE),
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",

      Amount: amount,

      PartyA: phone,
      PartyB: Number(env.MPESA_SHORTCODE),

      PhoneNumber: phone,

      CallBackURL: callbackUrl,

      AccountReference: accountReference,

      TransactionDesc:
        role === "receiver"
          ? "Kmeet chat continuation"
          : `Kmeet ${packageSize}-chat package`
    };

    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      }
    );

    const stkText = await stkResponse.text();

    let stkData;

    try {
      stkData = JSON.parse(stkText);
    } catch {
      stkData = {
        raw: stkText
      };
    }

    if (!stkResponse.ok) {
      return json({
        success: false,
        error: "M-Pesa STK Push request failed.",
        details: stkData
      }, 502);
    }

    // --------------------------------------------------------
    // Return Safaricom response to payment.html
    // --------------------------------------------------------

    return json({
      success: true,
      message: "STK Push request submitted.",
      amount,
      role,
      package: packageSize,
      targetId,
      checkoutRequestId:
        stkData.CheckoutRequestID || null,
      merchantRequestId:
        stkData.MerchantRequestID || null,
      responseCode:
        stkData.ResponseCode ?? null,
      responseDescription:
        stkData.ResponseDescription ?? null
    });

  } catch (error) {
    return json({
      success: false,
      error: "Unexpected Worker error.",
      details: error.message
    }, 500);
  }
}


// ============================================================
// M-PESA CALLBACK
// ============================================================

async function handleMpesaCallback(request) {
  try {
    const data = await request.json();

    // For now we only acknowledge the callback.
    // Later we will use this callback to verify the payment
    // and add Kmeet chat credits securely.

    console.log(
      "Kmeet M-Pesa callback:",
      JSON.stringify(data)
    );

    return json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });

  } catch (error) {
    console.log(
      "Kmeet callback error:",
      error.message
    );

    return json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });
  }
}


// ============================================================
// PHONE NUMBER NORMALIZATION
// ============================================================

function normalizePhone(phone) {
  if (!phone) return null;

  let value = String(phone)
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  // 0712345678 -> 254712345678
  if (/^0\d{9}$/.test(value)) {
    return `254${value.substring(1)}`;
  }

  // +254712345678 -> 254712345678
  if (/^\+254\d{9}$/.test(value)) {
    return value.substring(1);
  }

  // 254712345678
  if (/^254\d{9}$/.test(value)) {
    return value;
  }

  return null;
}


// ============================================================
// TIMESTAMP
// ============================================================

function getTimestamp() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  const hours = String(now.getUTCHours() + 3).padStart(2, "0");

  // Handle the rare UTC+3 date rollover correctly.
  const kenyaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Africa/Nairobi"
    })
  );

  const kenyaYear = kenyaTime.getFullYear();
  const kenyaMonth = String(
    kenyaTime.getMonth() + 1
  ).padStart(2, "0");
  const kenyaDay = String(
    kenyaTime.getDate()
  ).padStart(2, "0");
  const kenyaHours = String(
    kenyaTime.getHours()
  ).padStart(2, "0");
  const kenyaMinutes = String(
    kenyaTime.getMinutes()
  ).padStart(2, "0");
  const kenyaSeconds = String(
    kenyaTime.getSeconds()
  ).padStart(2, "0");

  return (
    `${kenyaYear}` +
    `${kenyaMonth}` +
    `${kenyaDay}` +
    `${kenyaHours}` +
    `${kenyaMinutes}` +
    `${kenyaSeconds}`
  );
}


// ============================================================
// JSON RESPONSE
// ============================================================

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
