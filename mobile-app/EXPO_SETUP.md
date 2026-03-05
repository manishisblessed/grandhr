# GrandHR Mobile – Expo account & testing from anywhere

## Option 1: Tunnel (fastest – no Expo account for testers)

Anyone can test using **Expo Go** and a single link, from any network.

### You (on your machine)

1. Install tunnel support once (if needed):
   ```bash
   npm install -g @expo/ngrok@^4.1.0
   ```
2. From the project root:
   ```bash
   cd mobile-app
   npm run start:tunnel
   ```
3. Wait until you see the **QR code** and a URL like:
   ```text
   exp://xxxx.ngrok-free.app:80
   ```
4. Share that **URL** (or QR code screenshot) with testers.

### Testers (anywhere)

1. Install **Expo Go** from App Store / Play Store.
2. Open the link you sent (or scan the QR code).
3. App loads over the internet (no need to be on your WiFi).

---

## Option 2: Connect your Expo account (recommended)

Use your Expo account so the project is linked and you can use EAS Build for installable builds.

### One-time setup

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```
   Use the same email/password as on [expo.dev](https://expo.dev).

3. Link the project and create it on Expo:
   ```bash
   cd mobile-app
   eas init
   ```
   - This adds your account and a **project ID** to the project.
   - If asked, confirm creating the project on Expo.

4. (Optional) Configure EAS for your team:
   ```bash
   eas build:configure
   ```
   You can accept defaults; your `eas.json` is already set up.

### Share with testers (after linking)

**A) Keep using tunnel (same as Option 1)**  
- Run `npm run start:tunnel` and share the tunnel URL/QR.  
- Testers still use **Expo Go** and the link. No account needed for them.

**B) Build an installable app (no Expo Go needed)**  
- Build a **preview** APK/IPA and share the build link.  
- Testers install the app once and open it like a normal app (good for “test from anywhere” without Expo Go).

Commands:

```bash
# Build for Android (APK – easy to share)
npm run build:preview:android

# Build for iOS (requires Apple Developer account)
npm run build:preview:ios

# Build for both
npm run build:preview
```

After the build finishes, EAS gives you a **link**. Send that link to testers; they download and install the app. No Expo Go required.

---

## Summary

| Goal                         | What to do |
|-----------------------------|------------|
| Test from anywhere quickly  | Use **Option 1** (`npm run start:tunnel`) and share the URL. |
| Link app to your Expo account | Use **Option 2** (eas login + eas init). |
| Let testers install an app (no Expo Go) | After Option 2, run `npm run build:preview:android` (or ios) and share the build link. |

---

## Notes

- **API URL**: The app uses `https://api.grandhr.in/api` from `app.json` when built. For tunnel/dev, ensure your backend is reachable (e.g. deployed) or testers will get network errors.
- **Tunnel**: First connection can take 30–60 seconds. If tunnel fails, try again or check firewall/VPN.
- **EAS Build**: First build can take 10–20 minutes. Later builds are faster. Free tier has monthly limits.
