# Play Store Deployment Guide

This document outlines the end-to-end process for deploying Multiplication Dojo to the Google Play Store, starting with a 1-week private Internal Testing phase, followed by a public Production release.

## 1. Local Setup & EAS Configuration

Your `eas.json` and `app.json` are already configured for production builds.

1. Ensure you have the Expo App Services CLI installed and you are logged in.
   From `apps/multiplication-dojo/`, run:
   ```powershell
   npx eas-cli login
   npx eas-cli init
   ```
   *Note: Commit `extra.eas.projectId` in `app.json` if it gets generated.*

2. (Optional) Build a preview APK to test locally before sending to Google:
   ```powershell
   npx eas-cli build --platform android --profile preview
   ```
   Download the APK and install it on your physical Android device.

3. Build the production App Bundle (AAB):
   ```powershell
   npx eas-cli build --platform android --profile production
   ```
   When the build finishes, download the `.aab` file. This is the file you will upload to Google Play.

## 2. Google Play Console Setup

1. Create a Google Play Developer account ($25 one-time fee) if you haven't already.
2. In the Play Console, click **Create app**.
   - App name: **Multiplication Dojo**
   - Default language: **English**
   - App or game: **Game**
   - Free or paid: **Free**
3. Complete the required declarations (Developer Program Policies, US export laws).

## 3. Store Listing & Content Rating

Before you can release, you must complete the app setup tasks in the dashboard:
- **Set up your app:** Answer questions about app access, ads (none), content rating (fill out the questionnaire for an educational game), target audience (Kids and adults), news apps, COVID-19 apps, and data safety.
- **Data Safety & Privacy Policy:** Multiplication Dojo collects **zero** user data and operates entirely offline. You still need a Privacy Policy URL. Create a simple static page on your website (e.g., `daruma.nz/privacy`) stating that the app collects no data.
- **Store Listing:** Copy the text from `docs/play-store-listing.md` and upload your screenshots and the 1024x500 feature graphic.
- **Screenshot Specs:** Phone screenshots (min 2, recommend 4-8), 16:9 or 9:16 aspect ratio.

## 4. Phase 1: Private Internal Testing (1 Week)

As requested, we will keep the app private for 1 week before going public. We will use the **Internal Testing** track.

1. In the Play Console menu, go to **Testing > Internal testing**.
2. Click **Create new release**.
3. Upload the `.aab` file you built via EAS.
4. Add release notes (from `play-store-listing.md`).
5. Go to the **Testers** tab. Create an email list with your email address (and any friends/family you want to invite).
6. Copy the **opt-in link** provided in the Testers tab and open it on your Android device to join the test.
7. Download the app directly from the Play Store!
8. Spend the next week testing the app, unlocking ranks, and making sure the game logic and UI feel right.

## 5. Phase 2: Public Production Release

After your 1-week private testing period is complete:

1. In the Play Console, go to **Testing > Internal testing**.
2. Click **Promote release** and choose **Production**.
3. Review the release details and click **Save**.
4. Click **Send for review**.
5. Google will review the app (usually takes 1-3 days for new accounts). Once approved, your app will be live and public on the Play Store!

## 6. Version Bump Checklist (For Future Updates)

When releasing a new update (e.g., v1.0.1):
1. In `app.json`, increment `android.versionCode` by 1 (e.g., from `1` to `2`).
2. Update the `version` string if necessary (e.g., `"1.0.1"`).
3. Run `npx eas-cli build --platform android --profile production` to get a new AAB.
4. Upload the new AAB to the Production track in Play Console and add new release notes.
