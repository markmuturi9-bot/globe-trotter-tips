# TIPIT - Komplett Publiceringsguide

## Översikt

Denna guide visar hur du arbetar med TIPIT från redigering i Lovable till publicering i App Store och Google Play.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Lovable   │ ──▶ │   GitHub    │ ──▶ │ Lokal Build │ ──▶ │  App Store  │
│  (Redigera) │     │   (Sync)    │     │  (Capacitor)│     │ / Play Store│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Fas 1: Förberedelser (Gör detta EN gång)

### Steg 1.1: Koppla Lovable till GitHub

1. Öppna ditt projekt i Lovable
2. Klicka på **GitHub** i menyn (övre högra hörnet)
3. Klicka **Connect to GitHub**
4. Godkänn Lovable GitHub App
5. Välj ditt GitHub-konto/organisation
6. Klicka **Create Repository**

✅ Nu synkas alla ändringar automatiskt mellan Lovable och GitHub!

### Steg 1.2: Skapa utvecklarkonton

**Apple Developer Account (för iOS)**
- Gå till: https://developer.apple.com
- Kostnad: $99/år
- Krävs: Apple-ID, betalning, identitetsverifiering
- Tid: 24-48 timmar för godkännande

**Google Play Developer Account (för Android)**
- Gå till: https://play.google.com/console
- Kostnad: $25 (engångsavgift)
- Krävs: Google-konto, betalning
- Tid: Några minuter

### Steg 1.3: Installera utvecklingsverktyg

**På Mac (för både iOS och Android):**
```bash
# Installera Homebrew (om inte redan installerat)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installera Node.js
brew install node

# Installera Xcode från App Store
# Öppna sedan Xcode och acceptera licensen

# Installera Android Studio
brew install --cask android-studio
```

**På Windows (endast Android):**
1. Ladda ner Node.js: https://nodejs.org
2. Ladda ner Android Studio: https://developer.android.com/studio

### Steg 1.4: Klona projektet lokalt

```bash
# Klona från GitHub
git clone https://github.com/DITT_ANVÄNDARNAMN/DITT_REPO.git
cd DITT_REPO

# Installera dependencies
npm install

# Lägg till native plattformar
npx cap add ios      # Endast på Mac
npx cap add android
```

---

## Fas 2: Dagligt arbetsflöde

### Steg 2.1: Redigera i Lovable

1. Gör dina ändringar i Lovable
2. Testa i preview-fönstret
3. Ändringar pushas automatiskt till GitHub

### Steg 2.2: Synka och testa lokalt

```bash
# Hämta senaste ändringar från GitHub
git pull

# Bygg projektet
npm run build

# Synka till native projekt
npx cap sync
```

### Steg 2.3: Testa på emulator/enhet

**iOS (endast Mac):**
```bash
# Öppna i Xcode
npx cap open ios

# Eller kör direkt på simulator
npx cap run ios
```

**Android:**
```bash
# Öppna i Android Studio
npx cap open android

# Eller kör direkt på emulator
npx cap run android
```

---

## Fas 3: Bygga för produktion

### Steg 3.1: Förbered för release

**VIKTIGT:** Innan du bygger för App Store/Play Store:

1. **Ta bort live reload** - Redigera `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.8119531570f64ad1b5f9255d17b94d5e',
  appName: 'TIPIT',
  webDir: 'dist',
  // KOMMENTERA UT ELLER TA BORT DESSA RADER:
  // server: {
  //   url: '...',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: { /* ... */ },
    StatusBar: { /* ... */ }
  }
};
```

2. **Uppdatera versionsnummer** i `capacitor.config.ts`:
```typescript
// Exempel: version 1.0.1
```

3. **Bygg och synka:**
```bash
npm run build
npx cap sync
```

### Steg 3.2: Bygga iOS-app

```bash
# Öppna i Xcode
npx cap open ios
```

**I Xcode:**
1. Välj ditt Team under **Signing & Capabilities**
2. Kontrollera Bundle Identifier
3. Gå till **Product → Archive**
4. När archive är klar, klicka **Distribute App**
5. Välj **App Store Connect**
6. Följ guiden för att ladda upp

### Steg 3.3: Bygga Android-app

```bash
# Öppna i Android Studio
npx cap open android
```

**I Android Studio:**
1. Gå till **Build → Generate Signed Bundle / APK**
2. Välj **Android App Bundle**
3. Skapa eller välj en signing key
4. Välj **Release** som build variant
5. Klicka **Finish**

AAB-filen skapas i: `android/app/release/app-release.aab`

---

## Fas 4: Publicera i butikerna

### Steg 4.1: Apple App Store

**I App Store Connect (https://appstoreconnect.apple.com):**

1. **Skapa ny app:**
   - Klicka **+** → **New App**
   - Plattform: iOS
   - Namn: TIPIT
   - Bundle ID: Välj den du konfigurerat
   - SKU: tipit-ios

2. **Fyll i appinformation:**
   - Beskrivning (max 4000 tecken)
   - Nyckelord: travel, tips, explore, social
   - Support-URL
   - Privacy Policy URL: din-app.lovable.app/privacy

3. **Ladda upp skärmbilder:**
   - iPhone 6.7" (1290×2796)
   - iPhone 6.5" (1284×2778)
   - iPad Pro 12.9" (2048×2732)

4. **Skicka in för granskning:**
   - Klicka **Submit for Review**
   - Väntetid: 24-48 timmar (första gången kan ta längre)

### Steg 4.2: Google Play Store

**I Google Play Console (https://play.google.com/console):**

1. **Skapa ny app:**
   - Klicka **Create app**
   - Appnamn: TIPIT
   - Standardspråk: Svenska/Engelska
   - Apptyp: App
   - Gratis/Betald

2. **Fyll i butiksregistrering:**
   - Kort beskrivning (80 tecken)
   - Fullständig beskrivning (4000 tecken)
   - App-ikon (512×512)
   - Funktionsbild (1024×500)
   - Skärmbilder (minst 2)

3. **Ladda upp AAB:**
   - Gå till **Release → Production**
   - Klicka **Create new release**
   - Ladda upp din AAB-fil

4. **Fyll i policykrav:**
   - Content rating (IARC-frågeformulär)
   - Data safety (vilken data samlas in)
   - Target audience

5. **Skicka in för granskning:**
   - Klicka **Start rollout to Production**
   - Väntetid: Några timmar till några dagar

---

## Fas 5: Uppdatera appen (Iterera)

### Snabbguide för uppdateringar

```bash
# 1. Gör ändringar i Lovable

# 2. Hämta ändringar lokalt
git pull

# 3. Uppdatera version (i capacitor.config.ts eller native projekt)

# 4. Bygg och synka
npm run build
npx cap sync

# 5. Skapa ny release
npx cap open ios    # Arkivera i Xcode
npx cap open android # Generera ny AAB
```

### Versionshantering

**Semantisk versioning:** `MAJOR.MINOR.PATCH`
- **MAJOR** (1.0.0 → 2.0.0): Stora ändringar, inte bakåtkompatibelt
- **MINOR** (1.0.0 → 1.1.0): Nya funktioner, bakåtkompatibelt
- **PATCH** (1.0.0 → 1.0.1): Buggfixar

**Var du uppdaterar version:**

| Plattform | Fil | Fält |
|-----------|-----|------|
| iOS | ios/App/App/Info.plist | CFBundleShortVersionString, CFBundleVersion |
| Android | android/app/build.gradle | versionName, versionCode |

---

## Checklista innan varje release

### Innan du bygger
- [ ] Alla ändringar testade i Lovable
- [ ] `git pull` körd
- [ ] Live reload borttagen från capacitor.config.ts
- [ ] Versionsnummer uppdaterat
- [ ] `npm run build` lyckas utan fel
- [ ] `npx cap sync` körd

### iOS-specifikt
- [ ] Signing certifikat giltigt
- [ ] App-ikoner i alla storlekar
- [ ] Launch screen konfigurerad
- [ ] Privacy policy-text uppdaterad

### Android-specifikt
- [ ] Signing key säkert lagrad (TAPPA INTE BORT!)
- [ ] Permissions justifierade
- [ ] Target SDK = senaste stabila
- [ ] AAB-format (inte APK) för Play Store

### App Store/Play Store
- [ ] Skärmbilder uppdaterade (om UI ändrats)
- [ ] "What's New" text skriven
- [ ] Contact email giltig

---

## Vanliga problem och lösningar

### "Signing error" i Xcode
```bash
# Rensa derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
# Öppna igen
npx cap open ios
```

### "SDK version mismatch" i Android Studio
1. Öppna Android SDK Manager
2. Installera saknade SDK-versioner
3. File → Sync Project with Gradle Files

### Ändringar syns inte i appen
```bash
# Fullständig ombyggnad
rm -rf dist
npm run build
npx cap sync
```

### App Store avvisar appen
- Läs noggrant feedback från Apple
- Vanliga orsaker:
  - Krascher vid granskning
  - Saknad privacy policy
  - Otillräcklig funktionalitet
  - Vilseledande metadata

---

## Resurser

- **Capacitor Docs:** https://capacitorjs.com/docs
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policy:** https://play.google.com/about/developer-content-policy/
- **Lovable Docs:** https://docs.lovable.dev

---

## Support

Om du fastnar, kontrollera:
1. Lovable Discord för community-hjälp
2. Capacitor GitHub issues
3. Apple/Google developer forums