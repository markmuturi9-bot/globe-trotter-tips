# TIPIT - Production Deployment Guide

## Prerequisites

1. **GitHub Repository**: Export project via Lovable's "Export to GitHub" button
2. **Node.js**: Version 18+ installed locally
3. **Platform Tools**:
   - **iOS**: Mac with Xcode 15+ installed
   - **Android**: Android Studio with SDK 34+

## Initial Setup

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Build the web app
npm run build

# Initialize Capacitor (if not already done)
npx cap init
```

## iOS Setup

```bash
# Add iOS platform
npx cap add ios

# Update iOS dependencies
npx cap update ios

# Sync web assets to native project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Xcode Configuration
1. Select your Team in Signing & Capabilities
2. Update Bundle Identifier if needed
3. Set minimum iOS version to 14.0
4. Configure App Icons in Assets.xcassets
5. Add required device capabilities in Info.plist

### Build for App Store
1. Product → Archive
2. Distribute App → App Store Connect
3. Upload to App Store Connect

## Android Setup

```bash
# Add Android platform
npx cap add android

# Update Android dependencies
npx cap update android

# Sync web assets to native project
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Android Studio Configuration
1. Update `android/app/build.gradle`:
   - Set `minSdkVersion` to 24
   - Set `targetSdkVersion` to 34
   - Update `versionCode` and `versionName`
2. Configure signing in `android/app/build.gradle`
3. Add app icons to `android/app/src/main/res`

### Build for Play Store
1. Build → Generate Signed Bundle / APK
2. Select Android App Bundle (AAB)
3. Create/select signing key
4. Build Release variant

## Environment Variables

For production builds, ensure these are set:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Live Reload for Development

The Capacitor config is set up for live reload during development:

```bash
# Run the dev server
npm run dev

# Then sync and run on device
npx cap sync
npx cap run ios --livereload
# or
npx cap run android --livereload
```

## Production Build (Remove Live Reload)

Before submitting to app stores, update `capacitor.config.ts`:

```typescript
// Remove or comment out the server block for production
const config: CapacitorConfig = {
  appId: 'app.lovable.8119531570f64ad1b5f9255d17b94d5e',
  appName: 'TIPIT',
  webDir: 'dist',
  // Comment out for production:
  // server: {
  //   url: '...',
  //   cleartext: true
  // },
  plugins: {
    // ...
  }
};
```

Then rebuild:
```bash
npm run build
npx cap sync
```

## Troubleshooting

### iOS Issues
- **Signing errors**: Ensure you have a valid Apple Developer account and certificates
- **Build failures**: Run `pod install` in the `ios/App` directory
- **Capacitor plugin issues**: Run `npx cap update ios`

### Android Issues
- **SDK version errors**: Update SDK in Android Studio SDK Manager
- **Gradle sync failures**: Try File → Invalidate Caches and Restart
- **Build failures**: Check `android/app/build.gradle` for correct SDK versions

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)