# App Metrics & Success Tracking

This guide explains how to measure the success of Multiplication Dojo using free, built-in tools. For v1, we rely solely on the Google Play Console without adding any third-party SDKs that require network permissions or privacy policy updates.

## 1. What to Measure (Play Console)

The Google Play Console provides powerful out-of-the-box metrics without any extra code:

- **Installs & Uninstalls:** Track how many people are downloading the app and how many are keeping it.
- **Active Devices:** A measure of your actual active user base over time.
- **Store Listing Conversion Rate:** Of the people who see your store page, how many actually install the app? This tells you if your ASO (title, description, screenshots) is working.
- **Ratings & Reviews:** The most direct feedback from your players.
- **Android Vitals:** Tracks crash rates, ANRs (Application Not Responding), and excessive wakeups.

## 2. Defining Success for v1 (Solo Developer)

Setting realistic expectations is key. Here is what success looks like for the first few months of a new solo app:

### Week 1 Goals
- Get your first 10-20 installs (usually friends, family, and your own test devices).
- Achieve a 0% crash rate in Android Vitals.
- Get 1-2 honest reviews to kickstart the store algorithm.

### Month 1 Goals
- Establish a steady organic install trend (e.g., 1-2 new organic installs per day).
- Maintain a 4.0+ star average rating.
- Reach 50+ total active devices.

### Month 3 Goals
- See your app appearing in Play Console acquisition reports for organic search terms like "times tables game" or "math dojo".
- Reach 200+ active devices.

## 3. Weekly 5-Minute Checklist

Make it a habit to check the Play Console once a week:

1. **Dashboard:** Look at the main graph. Are active devices trending up?
2. **Quality > Android vitals:** Check the Crash rate and ANR rate. Are they staying below Google's bad behavior thresholds (usually ~1.09%)?
3. **Grow > Store performance:** Look at your conversion rate. If it's below 15-20%, consider updating your screenshots or short description.
4. **Quality > Ratings and reviews:** Read new reviews and reply to them. Replying to reviews builds loyalty and can often turn a 3-star review into a 5-star review.

## 4. What We CANNOT Measure in v1

Because we intentionally did not include an analytics SDK (like Firebase), we cannot currently measure:
- Session length (how long users play per sitting).
- Rank completion funnels (e.g., how many users give up at the Katana rank).
- Which difficulty preset is most popular.

## 5. Future Analytics (Post-v1)

If the app grows and you want to understand in-app behavior, you can consider adding:
- **Firebase Analytics (Free):** Good for tracking custom events (e.g., `challenge_passed`, `rank_unlocked`). Note: adding this requires updating your privacy policy to disclose data collection.
- **EAS Observe (Expo):** Good for tracking startup times and JS performance, though less focused on user behavior.
