# Crash Reporting Strategy

For Multiplication Dojo v1, we have intentionally omitted a third-party crash reporting SDK. This keeps the app lightweight, avoids unnecessary network requests, and ensures we don't need a complex privacy policy for our first release. 

This document outlines how we track crashes in v1 and recommends a strategy for future apps in the Daruma Dojo portfolio.

## 1. How We Track Crashes in v1 (Free & Zero-Setup)

For this initial release, we will rely entirely on the **Google Play Console**.

**Android Vitals:**
- Navigate to **Quality > Android vitals > Crashes and ANRs** in the Play Console.
- This dashboard automatically captures stack traces and device information whenever the app crashes on a user's device (provided they have opted into sharing usage and diagnostics with Google).
- **Pros:** Zero setup, zero impact on bundle size, completely free.
- **Cons:** Traces can sometimes be obfuscated, and not all users opt in to sharing this data.

**User Reviews:**
- Users will often mention crashes in their reviews. While not ideal, it's a valuable signal for a v1 app with a small user base.

## 2. Crash Reporting Comparison for Future Apps

When building larger apps, or apps that generate revenue (where a crash directly impacts the bottom line), you should integrate a dedicated crash reporting tool.

| Tool | Free Tier | React Native / Expo Support | Recommendation |
|------|-----------|-----------------------------|----------------|
| **Sentry** | Generous Developer Tier | Excellent (official Expo plugin) | **Default choice** for future apps. |
| **Bugsnag** | Limited Free Tier | Good | Solid alternative, but stricter limits. |
| **Raygun** | Paid (Free Trial only) | Good | Best for enterprise teams with budget. |

## 3. Recommended Future Strategy: Sentry

For future monetized or complex apps, **Sentry** is the recommended default.

**When to add Sentry:**
- Before spending any money on marketing/user acquisition.
- Before adding in-app purchases or subscriptions.
- When the app logic becomes complex enough that Android Vitals stack traces are insufficient for debugging.

**High-Level Setup Outline (For Future Reference):**
1. Create a free Sentry developer account.
2. Install the package: `npx expo install @sentry/react-native`
3. Add the `@sentry/react-native/expo` plugin to your `app.json`.
4. Initialize Sentry in your `app/_layout.tsx` file using your DSN.
5. Create a `sentry-build-plugin` configuration if you need to upload source maps automatically during EAS builds.

*Note: Enabling Sentry means your app will collect device information (OS version, device model) and potentially IP addresses. You must update your app's Privacy Policy to disclose this data collection before releasing an update with Sentry included.*
