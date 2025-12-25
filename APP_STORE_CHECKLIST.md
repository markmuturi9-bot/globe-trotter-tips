# TipTip App Store & Play Store Submission Checklist

## App Store (iOS) Requirements

### Before Submission
- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] App Store Connect access
- [ ] Xcode installed on Mac
- [ ] Distribution certificate and provisioning profile

### Required Assets
- [ ] App Icon: 1024x1024px (no transparency, no rounded corners - Apple adds them)
- [ ] Screenshots for each device size:
  - iPhone 6.7" (1290x2796 or 2796x1290)
  - iPhone 6.5" (1284x2778 or 2778x1284)
  - iPhone 5.5" (1242x2208 or 2208x1242)
  - iPad Pro 12.9" (2048x2732 or 2732x2048)
- [ ] App Preview videos (optional, max 30 seconds)

### App Store Listing
- [ ] App Name: TipTip (max 30 characters)
- [ ] Subtitle: Share Travel Tips (max 30 characters)
- [ ] Description: (max 4000 characters)
- [ ] Keywords: travel, tips, explore, social, map, vacation, tourism
- [ ] Categories: Travel, Social Networking
- [ ] Age Rating: 4+ (no objectionable content)
- [ ] Privacy Policy URL: /privacy
- [ ] Support URL
- [ ] Marketing URL (optional)

### Privacy & Compliance
- [ ] Data collection disclosure (IDFA, location, etc.)
- [ ] Privacy nutrition labels
- [ ] Export compliance (encryption)
- [ ] Content rights documentation (if using third-party content)

---

## Google Play Store (Android) Requirements

### Before Submission
- [ ] Google Play Developer Account ($25 one-time) - https://play.google.com/console
- [ ] Android Studio installed
- [ ] Signing key (AAB format required)

### Required Assets
- [ ] App Icon: 512x512px (with some padding for safe area)
- [ ] Feature Graphic: 1024x500px
- [ ] Screenshots (2-8 per device type):
  - Phone: min 320px, max 3840px (16:9 or 9:16)
  - 7" Tablet
  - 10" Tablet
- [ ] Promo Video (YouTube link, optional)

### Play Store Listing
- [ ] Title: TipTip - Share Travel Tips (max 50 characters)
- [ ] Short description: (max 80 characters)
- [ ] Full description: (max 4000 characters)
- [ ] Categories: Travel & Local
- [ ] Tags: travel, tips, social, map
- [ ] Contact email
- [ ] Privacy Policy URL

### Content Rating
- [ ] Complete IARC questionnaire
- [ ] Declare app permissions usage
- [ ] Data safety section (similar to iOS privacy labels)

### Policy Compliance
- [ ] Target API level (Android 14+ for new apps)
- [ ] 64-bit support
- [ ] Permissions justification
- [ ] Data safety form

---

## Technical Checklist

### Security
- [x] No hardcoded API keys in client code
- [x] All sensitive keys in Edge Functions
- [x] HTTPS only
- [x] Secure authentication flow
- [ ] Enable leaked password protection (Supabase setting)
- [x] RLS policies on all tables
- [x] Input validation (zod)

### Performance
- [ ] App size optimization (< 200MB recommended)
- [ ] Lazy loading for images
- [ ] Code splitting
- [ ] Caching strategies

### Legal
- [x] Privacy Policy page (/privacy)
- [x] Terms of Service page (/terms)
- [x] Cookie consent (GDPR)
- [ ] Age verification if needed
- [ ] COPPA compliance (if targeting children - N/A for TipTip)

### Accessibility
- [ ] VoiceOver/TalkBack support
- [ ] Color contrast ratios (WCAG 2.1)
- [ ] Touch target sizes (min 44x44pt iOS, 48dp Android)
- [ ] Dynamic type support

---

## Build & Deploy Commands

### Development Build
```bash
npm run build
npx cap sync
```

### iOS
```bash
npx cap add ios
npx cap open ios
# Build in Xcode -> Product -> Archive
```

### Android
```bash
npx cap add android
npx cap open android
# Build in Android Studio -> Build -> Generate Signed Bundle
```

---

## Bundle IDs

- **iOS Bundle ID**: app.lovable.8119531570f64ad1b5f9255d17b94d5e
- **Android Package Name**: app.lovable.8119531570f64ad1b5f9255d17b94d5e

## Version Info
- **Version Name**: 1.0.0
- **Build Number**: 1

---

## Post-Launch

- [ ] Set up crash reporting (Sentry/Firebase Crashlytics)
- [ ] Analytics (optional)
- [ ] Push notifications setup (if needed)
- [ ] App Store Optimization (ASO) monitoring
- [ ] User review monitoring
