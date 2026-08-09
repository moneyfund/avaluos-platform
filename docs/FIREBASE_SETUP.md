# Firebase setup — Avalúos Platform

## Objective
Create a Firebase project dedicated exclusively to Avalúos Platform. Do not reuse the Firebase project from the Norvin personal website or Diamantes Realty Group.

## Manual console setup
1. Create a new Firebase project with display name `Avalúos Platform`.
2. Google Analytics is not required for the current phase.
3. Register one Web app, suggested nickname: `avaluos-platform-web`.
4. Copy the Firebase Web configuration object. The application expects these values through Vite environment variables documented in `.env.example`.
5. Enable Firebase Authentication and the Google sign-in provider.
6. Create the default Cloud Firestore database in Production mode. Recommended initial location for this Nicaragua-focused deployment: `us-central1`.
7. Enable Cloud Storage for Firebase. Current Firebase requirements may require the Blaze billing plan for Storage. Recommended bucket location: `us-central1`.
8. Do not create collections or manually migrate historical appraisals yet.
9. Do not weaken Firestore or Storage rules to public access. Tenant-aware rules will be deployed from this repository after the membership model is implemented.

## Values needed by the application

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Next engineering phase
After the Firebase project exists:
- connect Firebase Auth;
- implement Google login;
- implement tenants and memberships;
- add tenant-aware Firestore and Storage rules;
- save new appraisals with `tenantId` and `createdBy`;
- upload images under tenant-scoped paths;
- migrate Norvin historical appraisals only after the new model is verified.
