# Release checklist

Work top-to-bottom. Nothing ships until every box is ticked.

## 0. Prerequisites

- [ ] `npm install` in `mobile-app/` succeeds on a clean checkout.
- [ ] `eas whoami` confirms you are signed in to the `shahworks` team.
- [ ] All EAS secrets below are set:
  - `EXPO_APPLE_ID`
  - `EXPO_ASC_APP_ID`
  - `EXPO_APPLE_TEAM_ID`
  - (optional) `EXPO_PUBLIC_SENTRY_DSN`
  - (optional) `EXPO_PUBLIC_SUPPORT_WHATSAPP`
- [ ] `google-service-account.json` exists in `mobile-app/` for the
      Android submit profile (already git-ignored).

## 1. Code hygiene

- [ ] `npx tsc --noEmit` passes.
- [ ] No `console.log` / `TODO` left in user-facing paths.
- [ ] App version bumped in `app.json` (e.g. `1.0.1`).
- [ ] Privacy / Terms / Account-deletion pages deployed on
      grandhr.in and respond 200.
- [ ] Privacy Policy date in `docs/PRIVACY_POLICY.md` updated.

## 2. Assets

- [ ] `npm run assets:generate` executed; inspect:
  - `assets/icon.png` — 1024×1024, opaque, no alpha in final iOS build.
  - `assets/adaptive-icon.png` — foreground only, 66% safe zone, transparent bg.
  - `assets/splash.png` — logo centered on `#4F46E5`.
  - `assets/favicon.png` — 48×48.

## 3. Device sanity (side-loaded preview build)

- [ ] `npm run build:preview:android` installs and launches.
- [ ] `npm run build:preview:ios` installs and launches (TestFlight
      internal testers).
- [ ] First-launch **consent screen** appears and blocks until accepted.
- [ ] Login with demo credentials works.
- [ ] Register / Company Onboarding is hidden (production feature flag).
- [ ] "Register your company" route is unreachable via deep link.
- [ ] Clock-in toast appears, not an alert.
- [ ] Enable biometric lock, background the app for 5s, foreground — prompted.
- [ ] Leave the app idle for 15 min — auto sign-out.
- [ ] Delete account flow signs you out and wipes SecureStore.
- [ ] Error boundary: temporarily throw in a screen; "Something went wrong"
      appears with Restart and Share diagnostics buttons.

## 4. Compliance

### Google Play

- [ ] Target SDK / API level ≥ 35.
- [ ] 64-bit .aab uploaded.
- [ ] Data safety form completed per `docs/DATA_SAFETY.md`.
- [ ] App content → Account deletion URL set to
      `https://grandhr.in/account-deletion`.
- [ ] Ads declaration: **No ads**.
- [ ] Target audience: adults only.
- [ ] No sensitive permissions requested; blocked permissions list in
      `app.json` still enforced.
- [ ] Content rating questionnaire matches `docs/STORE_LISTING.md`.

### Apple App Store

- [ ] Privacy manifest in `app.json` matches actual app behaviour.
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption = false`.
- [ ] Sign-in required screenshot shows the demo account credentials
      in App Review Notes (`docs/IOS_REVIEW_NOTES.md`).
- [ ] In-app Delete account verified by reviewer path.
- [ ] Minimum iOS version matches `app.json`.

## 5. Submit

- [ ] Production build: `npm run build:production`.
- [ ] Android submit: `npm run submit:android` (internal track first).
- [ ] iOS submit: `npm run submit:ios` (TestFlight internal review first).
- [ ] Promote to production after 24 h in internal testing with no
      crash-free dip.
