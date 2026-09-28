# Kmeet GitHub + Firebase starter

This version implements the requested flow:

1. Welcome
2. Create Account -> Interests
3. Interests -> Signup
4. Firebase account is created
5. Firebase automatically signs in the new account, then the code signs it out
6. Login page
7. Successful login -> user's own profile
8. Discover is public
9. Other profiles are public
10. Chat is available to guests and registered users after payment
11. Chat uses Firestore
12. M-Pesa/Daraja is left as a payment integration point for now

## Firebase setup

In Firebase Console:

### Authentication
Enable:
- Email/Password
- Anonymous

Add your GitHub Pages domain to Authentication -> Settings -> Authorized domains.

Example:
`yourusername.github.io`

### Firestore
Create a Firestore database and publish `firestore.rules`.

## GitHub Pages

Put all files in the same repository/folder:

- index.html
- interests.html
- signup.html
- login.html
- discover.html
- profile.html
- chat.html
- payment.html
- firebase-config.js
- styles.css
- firestore.rules

Set GitHub Pages to deploy from the branch/folder containing these files.

## Important payment note

`payment.html` currently has a DEMO button. It writes:

`localStorage.kmeet_demo_paid = true`

That is only for testing the application flow.

Do NOT treat localStorage as real payment authorization in production because a user can change it.

When your M-Pesa Daraja account is ready, replace the demo payment step with:

1. Your backend sends the Daraja STK Push.
2. M-Pesa sends the callback to your backend.
3. Your backend verifies the transaction.
4. Your backend stores a trusted paid/chat-access record.
5. `chat.html` checks that trusted record before allowing messages.

Do not put Daraja consumer secret, passkey, or other private credentials in GitHub client-side JavaScript.

## Testing

Open the site through GitHub Pages or another HTTP server.

Do not rely on `file:///...` for Firebase.

Test:

Welcome -> Create Account -> Interests -> Signup -> Login -> Profile

Then:

Profile -> Discover -> another profile -> Chat -> temporary payment -> chat.

For guest testing, open Discover without logging in, open a profile, select Chat, complete the temporary payment, and chat anonymously.

## Before launch

- Connect M-Pesa Daraja securely.
- Replace demo payment with verified payment status.
- Tighten Firestore rules so chat access is tied to trusted paid records.
- Add profile editing/photo upload if needed.
- Add abuse/report/block controls before public launch.
