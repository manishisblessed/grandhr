# GrandHR — Privacy Policy

_Last updated: April 2026_

This Privacy Policy describes how **GrandHR** ("we", "us") processes
personal data in the GrandHR mobile application and related services.
GrandHR is a business-to-business ("B2B") HR platform: your employer
(the "Company") is the data controller, and GrandHR is the data
processor acting under the Company's instructions.

If you have questions about this policy, email
**privacy@grandhr.in**.

---

## 1. What personal data we process

| Category | Examples | Source |
|---|---|---|
| Identity | Full name, email, phone (optional), employee ID | Your Company / you |
| Workplace | Attendance clock-ins, leave requests, leave balance, pay slips, uploaded documents, support tickets, in-app chats with HR assistant | You / your Company |
| Authentication | Salted password hash, secure session tokens, device-local app-lock preference | You / device |
| Diagnostics | App version, OS version, anonymised crash reports | Device |

We do **not** process location data, contacts, microphone, camera,
photo library, calendar, SMS, call logs, biometrics, health, financial
account data, or any advertising identifiers.

## 2. Why we process it (legal bases)

- **Performance of contract / legitimate interest** — to provide HR
  services your Company has configured.
- **Legal obligation** — where your Company is required to retain
  employment records.
- **Consent** — for optional features (e.g. analytics when offered);
  can be withdrawn at any time.

## 3. Who sees it

- Your Company's authorised HR administrators.
- GrandHR personnel on a strict need-to-know basis, bound by
  confidentiality.
- Sub-processors we use to operate the service (listed below), under
  written data-processing agreements.

### Sub-processors

- **Hosting:** Amazon Web Services (EU / in-country region).
- **Email delivery:** transactional-email provider (e.g. Amazon SES).
- **Error monitoring:** Sentry (only when the Company opts in).
- **App distribution:** Apple App Store, Google Play, Expo Application
  Services.

## 4. Storage & security

- TLS 1.2+ for all network traffic.
- Session tokens stored in the OS secure keystore (Keychain / Keystore)
  via `expo-secure-store`.
- Passwords stored as salted bcrypt/argon2 hashes server-side.
- Role-based access controls on every API endpoint.
- Optional biometric app-lock on device.
- Idle auto-logout after 15 minutes by default.

## 5. International transfers

Data may be transferred outside your country of residence. Transfers
are protected by Standard Contractual Clauses and equivalent safeguards.

## 6. Retention

- Account data: retained while your employer keeps you active + any
  period they are required to retain.
- Crash reports: 90 days, then deleted or de-identified.
- Support tickets: 24 months after resolution.

## 7. Your rights

Subject to your local data-protection laws, you have the right to:

- Access, correct, port, or delete your personal data.
- Object to or restrict certain processing.
- Withdraw consent at any time.
- Lodge a complaint with a supervisory authority.

Most rights can be exercised in-app:

- **Access / correct:** your profile in the app.
- **Delete:** Settings → Danger zone → Delete my account. See
  [`ACCOUNT_DELETION.md`](./ACCOUNT_DELETION.md).
- **Export:** email **privacy@grandhr.in** with subject "Data export".

## 8. Children

GrandHR is not directed at children under 18. Do not use the service
if you are under 18.

## 9. Changes

Material changes will be notified via the app or by your Company. The
"last updated" date at the top always reflects the current version.

## 10. Contact

GrandHR — privacy@grandhr.in
Data Protection Officer — dpo@grandhr.in
