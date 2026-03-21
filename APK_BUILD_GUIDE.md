# APK Build Guide — SL Real Estate & Construction Marketplace

## Overview

This guide walks you through building a production Android APK (or AAB) for the app using **Expo Application Services (EAS Build)**. Your API server is already hosted on Render, so the APK will talk directly to it.

---

## Prerequisites

| Requirement | Details |
|---|---|
| Node.js | v18 or later |
| pnpm | v8 or later |
| Expo account | Free at [expo.dev](https://expo.dev) |
| EAS CLI | Installed globally (step below) |
| Git | Any recent version |

---

## Step 1 — Install EAS CLI

Run this once on your machine:

```bash
npm install -g eas-cli
```

Verify it installed:

```bash
eas --version
```

---

## Step 2 — Log In to Your Expo Account

```bash
eas login
```

Enter your Expo username and password. If you don't have an account, create one free at [expo.dev/signup](https://expo.dev/signup).

---

## Step 3 — Set the Android Package Name in `app.json`

Open `artifacts/sl-marketplace/app.json` and update the `android` section to add a unique package name:

```json
"android": {
  "package": "com.yourname.slmarketplace",
  "versionCode": 1
}
```

> Replace `com.yourname.slmarketplace` with a package name that follows reverse-domain format (e.g. `com.slnepal.marketplace`). This cannot be changed after publishing to the Play Store.

Also update the `expo-router` origin to match your production domain or just use `https://expo.dev`:

```json
"plugins": [
  [
    "expo-router",
    {
      "origin": "https://expo.dev"
    }
  ],
  ...
]
```

---

## Step 4 — Set the Production API URL

The app reads the API base URL from the `EXPO_PUBLIC_DOMAIN` environment variable at **build time**. For the APK to point to your Render server, you need to set this when building.

Create a file at `artifacts/sl-marketplace/.env.production`:

```env
EXPO_PUBLIC_DOMAIN=replit-sample-app-draft.onrender.com
```

> The app will then use `https://replit-sample-app-draft.onrender.com/api` for all requests. Do **not** include `https://` in this variable — only the domain.

---

## Step 5 — Create the EAS Build Configuration

Inside the `artifacts/sl-marketplace/` folder, create `eas.json`:

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_DOMAIN": "replit-sample-app-draft.onrender.com"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_DOMAIN": "replit-sample-app-draft.onrender.com"
      }
    }
  }
}
```

> Setting `buildType` to `"apk"` produces a directly installable `.apk` file. Change it to `"app-bundle"` if you want an `.aab` for Google Play Store submission.

---

## Step 6 — Link the Project to Your Expo Account

Navigate into the app folder and initialize EAS:

```bash
cd artifacts/sl-marketplace
eas build:configure
```

This will:
- Ask if you want to use an existing project or create a new one — choose **create new**
- Write a project ID into your `app.json` automatically

---

## Step 7 — Build the APK

From inside `artifacts/sl-marketplace/`, run:

```bash
eas build --platform android --profile production
```

EAS will:
1. Upload your project source to Expo's cloud build servers
2. Compile the Android APK remotely (no Android Studio or SDK needed on your machine)
3. Give you a download link when done (usually takes 5–15 minutes)

You can monitor the build at [expo.dev/builds](https://expo.dev/builds).

---

## Step 8 — Download and Install the APK

Once the build finishes:

1. Open the link shown in your terminal, or go to [expo.dev/builds](https://expo.dev/builds)
2. Click **Download** to get the `.apk` file
3. Transfer it to an Android device
4. Enable **Install from unknown sources** in Android Settings → Security
5. Open the `.apk` file on the device to install

---

## Updating the App

To release an updated APK:

1. Increment `version` (e.g. `"1.1.0"`) and `versionCode` (e.g. `2`) in `app.json`
2. Run `eas build --platform android --profile production` again
3. Share the new download link with users

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `eas: command not found` | Run `npm install -g eas-cli` again |
| Build fails with "package name missing" | Add `"package"` inside `"android"` in `app.json` (Step 3) |
| App can't connect to API | Make sure `EXPO_PUBLIC_DOMAIN` in `eas.json` matches your Render domain exactly — no `https://`, no trailing slash |
| API returns errors | Check your Render service is awake (free tier sleeps after inactivity — open the URL in a browser first) |
| `expo-router` origin warning | Set `"origin"` to `"https://expo.dev"` in the plugin config (Step 3) |

---

## Summary of Files to Edit

| File | What to change |
|---|---|
| `artifacts/sl-marketplace/app.json` | Add `android.package`, update `versionCode`, fix `expo-router` origin |
| `artifacts/sl-marketplace/eas.json` | Create this file with the config from Step 5 |

Your API server: **https://replit-sample-app-draft.onrender.com**

