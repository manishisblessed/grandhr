# Google Play — Data safety answers

Use these answers verbatim in the Google Play Console → "Data safety"
form. Keep them in sync with the Privacy Policy. When a new data type
is added, update both.

## App info

- **App functions offline?** No (requires a network connection).
- **Advertising or marketing identifiers?** Never.
- **Uses GPS location?** Never.
- **Intended for families programme?** No.

## Data collection and security

| Item | Answer |
|---|---|
| Is all user data encrypted in transit? | **Yes** (TLS 1.2+). |
| Do you provide a way for users to request data deletion? | **Yes.** In-app: Settings → Danger zone → Delete my account. Web: https://grandhr.in/account-deletion. |
| Have you committed to follow the Play Families Policy? | N/A — not a Families app. |

## Data types collected

Answer **"Yes — collected"** for each of the following. Answer
"No — not collected" for everything else.

### Personal info

- **Name** — Linked to the user identity. Collected. Required. Purpose:
  *App functionality, Account management*. Shared with employer.
- **Email address** — Linked. Required. *App functionality, Account
  management*. Shared with employer.
- **User IDs** — Linked. Required. *App functionality*. Internal.
- **Phone number** — Linked. Optional. *App functionality*. Shared
  with employer.
- **Other info** (Employee ID, PAN/GST where provided) — Linked.
  Optional. *App functionality*. Shared with employer.

### Messages

- **Other in-app messages** (support tickets, HR chats) — Linked.
  Optional. *App functionality, Customer support*. Shared with
  employer.

### App activity

- **App interactions / in-app search** — Linked. Optional. *App
  functionality, Analytics*. Only when the customer opts in to
  analytics. Default off.
- **Other actions** (attendance clock-in/out, leave requests) —
  Linked. Required. *App functionality*. Shared with employer.

### App info and performance

- **Crash logs** — Not linked to identity. Optional. *App
  functionality, Analytics*. Only when the customer opts in to
  Sentry. Default off.
- **Diagnostics** — Not linked. Optional. *App functionality*.
  Default on.

### Device or other IDs

- **Device or other IDs** — Not collected.

### Not collected

All of the following data types are **not** collected by GrandHR:

- Financial info
- Health and fitness
- Photos and videos
- Audio files
- Files and docs (other than those the user explicitly uploads as
  part of the HR service)
- Calendar / Contacts / Location
- Web browsing
- Advertising data

## Data sharing

- We share the user's identity and workplace data with the user's
  **employer** (Company), because that is the core service.
- We use **sub-processors** listed in the Privacy Policy. Each is
  contractually bound by a DPA and is not an advertiser.
- We do **not** sell data. We do **not** share data for
  advertising.

## Account deletion URL

`https://grandhr.in/account-deletion` — public page deployed by the
web team. See [`ACCOUNT_DELETION.md`](./ACCOUNT_DELETION.md) for the
copy to put on that page.
