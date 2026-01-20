# TIPIT - Project Overview for App Store/Google Play Review

## Executive Summary

**App Name:** TIPIT  
**Type:** Travel tips sharing social application  
**Platforms:** iOS (App Store), Android (Google Play), Web (PWA)  
**Technology:** React + Capacitor hybrid app  
**Version:** 1.0.0

---

## 1. Application Description

TIPIT is a social travel tips application that allows users to:
- Share and discover travel tips on an interactive globe map
- Organize tips by country and category (Food, Attractions, Activities, Accommodation, General, Other)
- Connect with friends and share tips privately or publicly
- Chat with friends and share tips via messages
- Upload images to accompany travel tips
- Search and filter tips by location and category

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | - | Type-safe development |
| Vite | - | Build tool & dev server |
| Tailwind CSS | - | Utility-first styling |
| shadcn/ui | - | UI component library |
| React Router DOM | 6.30.1 | Client-side routing |
| TanStack React Query | 5.83.0 | Server state management |
| Zod | 3.25.76 | Schema validation |

### Mobile (Native Wrapper)
| Technology | Version | Purpose |
|------------|---------|---------|
| Capacitor Core | 8.0.0 | Native bridge |
| Capacitor iOS | 8.0.0 | iOS platform |
| Capacitor Android | 8.0.0 | Android platform |
| Capacitor Splash Screen | 8.0.0 | Native splash screen |
| Capacitor Status Bar | 8.0.0 | Status bar control |
| Capacitor App | 8.0.0 | App lifecycle |

### Backend (Supabase/Lovable Cloud)
| Service | Purpose |
|---------|---------|
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Edge Functions | Serverless backend logic |
| Row-Level Security | Data access control |
| Realtime | Live data sync (chat) |

### Mapping
| Technology | Purpose |
|------------|---------|
| Mapbox GL JS | 2.15.0 | Interactive globe/map |
| Supercluster | 8.0.1 | Marker clustering |

---

## 3. Project Structure

```
TIPIT/
├── src/
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles & design tokens
│   │
│   ├── components/
│   │   ├── chat/                  # Chat functionality
│   │   │   ├── ChatList.tsx       # List of conversations
│   │   │   ├── ChatView.tsx       # Chat message view
│   │   │   ├── ChatWindow.tsx     # Chat container
│   │   │   └── NewChatDialog.tsx  # Start new conversation
│   │   │
│   │   ├── friends/               # Friend system
│   │   │   ├── AddFriendDialog.tsx
│   │   │   └── FriendRequestList.tsx
│   │   │
│   │   ├── gdpr/                  # GDPR compliance
│   │   │   └── CookieConsent.tsx
│   │   │
│   │   ├── layout/                # App structure
│   │   │   ├── AppShell.tsx       # Main layout wrapper
│   │   │   ├── Header.tsx         # Top navigation
│   │   │   ├── MainNav.tsx        # Bottom/side navigation
│   │   │   └── SafeAreaLayout.tsx # iOS safe area handling
│   │   │
│   │   ├── map/                   # Map components
│   │   │   ├── MapProvider.tsx    # Map context
│   │   │   └── MapboxGlobe.tsx    # Globe visualization
│   │   │
│   │   ├── theme/                 # Theming
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── SystemChromeSync.tsx  # Native status bar sync
│   │   │
│   │   ├── tips/                  # Tip management
│   │   │   ├── AddressAutocomplete.tsx
│   │   │   ├── BulkTipImport.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── CreateTipDialog.tsx
│   │   │   ├── EditTipDialog.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── TipCard.tsx
│   │   │   └── TipDetail.tsx
│   │   │
│   │   ├── ui/                    # shadcn/ui components
│   │   │   └── [50+ UI components]
│   │   │
│   │   ├── views/                 # Main view components
│   │   │   ├── FriendsView.tsx
│   │   │   ├── ListView.tsx
│   │   │   ├── MapView.tsx
│   │   │   └── ProfileView.tsx
│   │   │
│   │   └── NavLink.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.tsx            # Authentication state
│   │   ├── useChat.tsx            # Chat functionality
│   │   ├── useFriendships.tsx     # Friend management
│   │   ├── useImageUpload.tsx     # Image upload logic
│   │   ├── useTips.tsx            # Tips CRUD operations
│   │   ├── useAdmin.tsx           # Admin/moderator checks
│   │   ├── useNativeApp.ts        # Native app detection
│   │   ├── use-mobile.tsx         # Mobile detection
│   │   └── use-toast.ts           # Toast notifications
│   │
│   ├── pages/                     # Route pages
│   │   ├── Auth.tsx               # Login/Signup
│   │   ├── Map.tsx                # Map view
│   │   ├── List.tsx               # List view
│   │   ├── Friends.tsx            # Friends page
│   │   ├── Profile.tsx            # User profile
│   │   ├── Privacy.tsx            # Privacy policy
│   │   ├── Terms.tsx              # Terms of service
│   │   └── NotFound.tsx           # 404 page
│   │
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   │
│   ├── lib/                       # Utility functions
│   │   ├── utils.ts
│   │   └── capacitor.ts
│   │
│   └── integrations/
│       └── supabase/
│           ├── client.ts          # Supabase client
│           └── types.ts           # Database types
│
├── supabase/
│   ├── config.toml                # Supabase configuration
│   └── functions/                 # Edge Functions
│       ├── get-mapbox-key/        # Secure Mapbox key retrieval
│       ├── parse-tips/            # AI-powered tip parsing
│       ├── search-address/        # Address geocoding
│       └── translate-text/        # Translation service
│
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── robots.txt                 # SEO robots file
│   ├── favicon.ico
│   └── icons/                     # App icons
│
├── android-config/                # Android native config
├── ios-config/                    # iOS native config
│
├── capacitor.config.ts            # Capacitor configuration
├── tailwind.config.ts             # Tailwind configuration
├── vite.config.ts                 # Vite configuration
└── index.html                     # HTML entry point
```

---

## 4. Database Schema

### Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profile data | ✅ User can only read/update own |
| `profiles_public` | Public user view (no email) | ✅ Public read |
| `tips` | Travel tips | ✅ Public read, user CRUD own |
| `countries` | Country reference data | ✅ Public read only |
| `friendships` | Friend relationships | ✅ Only participants |
| `chats` | Chat rooms | ✅ Only participants |
| `messages` | Chat messages | ✅ Only chat participants |
| `notifications` | User notifications | ✅ Only owner |
| `user_roles` | Admin/moderator roles | ✅ Admin only |

### Enums
- `tip_category`: general, food, attractions, activities, accommodation, other
- `app_role`: admin, moderator, user

---

## 5. Authentication & Security

### Authentication Flow
1. Email/password signup with username
2. Auto-confirm enabled (no email verification)
3. JWT tokens managed by Supabase Auth
4. Session persistence via local storage

### Security Measures
- **Row-Level Security (RLS)** on all tables
- **API keys secured** in Edge Functions (not in client code)
- **Input validation** with Zod schemas
- **HTTPS only** communication
- **No sensitive data in client** - all private keys server-side

---

## 6. Compliance Features

### GDPR/Privacy
- ✅ Cookie consent banner
- ✅ Privacy policy page (`/privacy`)
- ✅ Terms of service page (`/terms`)
- ✅ Explicit consent checkbox at signup
- ✅ User data stored in EU/EEA
- ✅ Profile data can be viewed (export pending full implementation)
- ✅ Account deletion available

### App Store Requirements
- ✅ Privacy policy URL
- ✅ Terms of service URL
- ✅ Age rating: 4+ (no objectionable content)
- ✅ No user-generated adult content
- ✅ Location data optional (for tips)

---

## 7. Native App Configuration

### iOS (capacitor.config.ts)
```typescript
ios: {
  contentInset: 'automatic',
  preferredContentMode: 'mobile',
  scheme: 'TIPIT'
}
```

### Android (capacitor.config.ts)
```typescript
android: {
  allowMixedContent: true,
  captureInput: true,
  webContentsDebuggingEnabled: false
}
```

### App Identifiers
- **Bundle ID (iOS):** `app.lovable.8119531570f64ad1b5f9255d17b94d5e`
- **Package Name (Android):** `app.lovable.8119531570f64ad1b5f9255d17b94d5e`

---

## 8. Features Checklist

### Core Features
- [x] User registration & login
- [x] Profile management
- [x] Create/edit/delete tips
- [x] Interactive globe map
- [x] Country-based browsing
- [x] Category filtering
- [x] Image upload
- [x] Friend system
- [x] Private messaging
- [x] Dark/light theme

### Mobile-Specific
- [x] Safe area handling (notch)
- [x] Status bar theming
- [x] Splash screen
- [x] PWA manifest
- [x] Touch-optimized UI
- [x] Responsive design

### Compliance
- [x] Privacy policy
- [x] Terms of service
- [x] Cookie consent
- [x] Signup consent checkbox

---

## 9. API Dependencies

| Service | Purpose | Key Location |
|---------|---------|--------------|
| Mapbox | Maps & geocoding | Edge Function (secure) |
| Supabase | Backend services | Environment variables |

---

## 10. Build Configuration

### Production Build
```bash
npm run build          # Build web assets
npx cap sync           # Sync to native projects
npx cap open ios       # Open Xcode
npx cap open android   # Open Android Studio
```

### Environment Variables (Vite)
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

---

## 11. Known Limitations

1. **No offline mode** - Requires internet connection
2. **Image storage** - Uses external URLs (Supabase storage)
3. **Push notifications** - Not yet implemented
4. **Localization** - Currently English UI only

---

## 12. Review Checklist for AI

When reviewing this codebase for App Store/Google Play compliance, check:

### Security
- [ ] No hardcoded API keys in client code
- [ ] All database tables have RLS policies
- [ ] Input validation on all user inputs
- [ ] Secure authentication flow
- [ ] HTTPS only communications

### Privacy
- [ ] Privacy policy is complete and accessible
- [ ] Terms of service is complete and accessible
- [ ] Cookie consent is implemented
- [ ] User consent required before signup
- [ ] Data collection is transparent

### User Experience
- [ ] App handles network errors gracefully
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly
- [ ] App works on various screen sizes
- [ ] Touch targets are appropriately sized (44pt minimum)

### Platform Guidelines
- [ ] No private API usage
- [ ] App provides real value (not a "template app")
- [ ] Content is appropriate for all ages
- [ ] No misleading functionality
- [ ] App completes its stated purpose

### Technical
- [ ] No memory leaks
- [ ] No excessive battery/data usage
- [ ] App launches quickly
- [ ] No crashes on common user flows
- [ ] Proper error handling throughout
