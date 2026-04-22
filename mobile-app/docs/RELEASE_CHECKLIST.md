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
  - `assets/icon.png` — 1024×1024, opaque white, colorful logomark ~85% of tile.
  - `assets/adaptive-icon.png` — foreground only, logomark in 66% safe zone,
    transparent bg (Android composites it over `adaptiveIcon.backgroundColor`
    which is white).
  - `assets/splash.png` — full logo centered on white.
  - `assets/favicon.png` — 48×48, white tile with logomark.
- [ ] Source logo committed at `assets/source.jpeg` (full brand lockup) so any
      contributor can rebuild the asset set deterministically.

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

---

## Appendix A. First Google Play release — runbook

Use this when you are filing **the first** Play Store submission for
GrandHR. Follow top-to-bottom. All commands run from `mobile-app/`.

### A.1 One-time Play Console setup

1. Create the app in Google Play Console → **Create app**. Package
   name **must be** `com.grandhr.mobile` (matches `app.json`).
2. Pick the default language, confirm it is a free app, confirm it
   targets adults and complies with Play policies.
3. Play Console → **Setup → App access**: provide the review
   credentials from `docs/IOS_REVIEW_NOTES.md` (same demo account
   works for Google reviewers).
4. Play Console → **Setup → App content**: complete every card
   (ads, content rating, target audience, data safety, account
   deletion URL → `https://grandhr.in/account-deletion`, news,
   government, privacy policy URL → `https://grandhr.in/privacy-policy`).
5. Play Console → **Release → Setup → App signing**: let Google
   generate the upload key (Play App Signing). EAS will hold the
   upload key it creates on our side; Play holds the final signing
   key. Never commit either.

### A.2 EAS build credentials

1. `npx eas login` and confirm `eas whoami` shows `shahworks`.
2. `npx eas credentials` → Android → production →
   **Set up a new Keystore** (let EAS generate it, stored on EAS
   servers — never downloaded). This is the upload key.
3. In Play Console → **Setup → API access**, create a service
   account with `Release manager` role, download the JSON key, and
   save it as `mobile-app/google-service-account.json`
   (git-ignored). This is required by `eas submit`.

### A.3 Cut the production AAB

```
npm run assets:generate
npx tsc --noEmit
npx expo-doctor
npm run build:production:android
```

When EAS prompts, accept automatic versionCode increment. The build
runs on Expo servers; the AAB link will appear in the terminal and
at https://expo.dev/accounts/shahworks/projects/grandhr-mobile/builds.

### A.4 Internal testing track first

1. Download the AAB from the build page, or let EAS Submit upload
   it directly: `npm run submit:android:internal`.
2. In Play Console → **Testing → Internal testing**, add your own
   Google account to the tester list, open the provided opt-in URL
   on the device, install from Play Store, and run through
   Section 3 (Device sanity) of this checklist on the Play build.
3. Keep the build on internal testing for at least 24 hours.

### A.5 Promote to production

1. In Play Console → **Testing → Internal testing → Promote release
   → Production**. Reuse the same AAB (no rebuild required).
2. Fill the release notes. Template:

   ```
   Initial release of GrandHR — HR management for small and
   mid-sized businesses. Time tracking, attendance, leave,
   payslips, and announcements.
   ```

3. Start rollout at 20% and monitor crash-free sessions. Ramp to
   100% once Android Vitals shows no regressions.

### A.6 Before clicking "Send for review"

- [ ] Data safety answers match `docs/DATA_SAFETY.md` exactly.
- [ ] Store listing text + screenshots match `docs/STORE_LISTING.md`.
- [ ] Feature graphic (1024×500 PNG/JPEG) uploaded.
- [ ] Privacy policy URL returns 200 and contains the full text
      from `docs/PRIVACY_POLICY.md`.
- [ ] Account deletion URL returns 200 and describes the in-app +
      web deletion flow from `docs/ACCOUNT_DELETION.md`.
- [ ] No leftover `console.log`s in source that expose API
      payloads or tokens (grep before building).
- [ ] `versionCode` in the build is greater than any previously
      uploaded AAB.

### A.7 After approval

- [ ] Tag the commit: `git tag v1.0.0 && git push --tags`.
- [ ] Enable Sentry (set `EXPO_PUBLIC_SENTRY_DSN` as an EAS secret
      and re-build) to capture post-launch crashes.
- [ ] Schedule the iOS submission as a follow-up (see
      `docs/IOS_REVIEW_NOTES.md`).
