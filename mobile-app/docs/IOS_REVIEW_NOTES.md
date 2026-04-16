# Notes for the Apple App Review team

_Paste the contents of this file into "App Review Information → Notes"
in App Store Connect before every submission._

---

## What GrandHR is

GrandHR is a **B2B workplace HR app**. Employers buy licences for
their workforce outside the App Store; employees are provisioned by
their HR team and sign in with those credentials. The app has **no
in-app purchases, no subscriptions, no ads, and no user-facing
pricing**.

## Demo account

> Please rotate these credentials every release. Ensure the demo
> account sees representative data (at least 5 employees, payslips,
> leave balances) so reviewers can exercise the flows.

- **Environment:** production API (`https://api.grandhr.in`).
- **Role — Employee:**
  - Email: `demo-employee@grandhr.test`
  - Password: `<set before each submission>`
- **Role — HR Admin:**
  - Email: `demo-admin@grandhr.test`
  - Password: `<set before each submission>`

## What the reviewer can do

1. Launch the app → accept the **first-launch consent** screen.
2. Sign in as `demo-employee`.
3. From the dashboard, **clock in** then **clock out** — toasts
   confirm success.
4. **Apply for leave**, then view it in Leave Status.
5. Open **Settings → Security → Biometric app lock**. Toggle on
   (device must have Face ID/Touch ID enrolled).
6. Open **Settings → Danger zone → Delete my account** to see the
   in-app deletion flow. Do **not** submit unless you want the demo
   account removed — re-creation takes ~5 minutes.
7. Sign out, sign in as `demo-admin` and approve the leave you just
   created.

## Permissions

The app declares no sensitive permissions (no camera, microphone,
location, contacts, photo library, calendar, tracking). All of those
usage-description keys in `Info.plist` are populated with
"GrandHR does not use the …" for clarity if the OS ever requests them.

## Encryption

- `ITSAppUsesNonExemptEncryption = false` — we only use
  standard-cryptography TLS from the OS for network calls, and the
  OS Keychain for token storage via `expo-secure-store`.

## Privacy

- Full policy: https://grandhr.in/privacy-policy
- Data collection summary: `docs/DATA_SAFETY.md` in this repo.
- Account deletion: in-app (Settings → Danger zone) and
  https://grandhr.in/account-deletion.
- We do not use the IDFA. We do not track users. We do not integrate
  any advertising or analytics SDK by default.

## Known-good build environment

- Expo SDK 54 / React Native 0.81.
- Minimum iOS version: 15.1.
- iPad: supported in portrait + landscape.

## Contact

- App Review contact: `app-review@grandhr.in`
- Privacy contact: `privacy@grandhr.in`
