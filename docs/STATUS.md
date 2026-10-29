# TIPIT — nuläge

Senast uppdaterad: 2026-10-29. Backend-bytet (Supabase) är klart och
mergat. iOS/TestFlight-byggkedjan är **klar och bekräftat fungerande**
— ett nytt bygge laddades upp till TestFlight framgångsrikt efter
bundle-ID-fixen. Kvarstår: granska och mergea PR:en för iOS-kedjan, och
fullständig test av appen mot den nya databasen.

## iOS-status

- `ios/App` är genererat och incheckat (via workflowet **"Bootstrap iOS
  project"**, körs manuellt på macOS i Actions — behövs normalt bara en
  gång, projektet är redan committat).
- **Bundle-ID rättat 2026-10-29**: koden använde hela tiden
  `app.lovable.8119531570f64ad1b5f9255d17b94d5e` (det gamla
  Lovable-genererade värdet), men appen i App Store Connect ("Tipit
  travel") är registrerad med `com.tipit.app`. Det var hela orsaken till
  att TestFlight-uppladdningen inte kunde hitta appen — inte
  nyckelbehörighet, inte team-ID. Ändrat till `com.tipit.app` i
  `capacitor.config.ts`, `ios/App/App.xcodeproj/project.pbxproj` och
  `ios/App/fastlane/Appfile`, plus i de kvarvarande dokumenten som
  nämnde det gamla värdet. `com.tipit.app` klarar Capacitors egen
  appId-validering rakt av, så platshållar-logiken som bootstrap-workflowet
  behövde för det gamla (ogiltiga) ID:t är borttagen — `cap add ios`
  körs nu direkt.
- Behörighetstexter: appen har ingen platsfunktion i koden (ingen
  GPS/geolocation), bara bilduppladdning via vanlig filväljare
  (tips-bilder + profilbild). Bootstrap-workflowet lägger därför in
  kamera- och bibliotek-texter (svenska + engelska i samma sträng),
  inte platsbehörighet.
- **Om appen senare får fler native-funktioner**: lägg till motsvarande
  `NSxxxUsageDescription`-nyckel i bootstrap-workflowets
  PlistBuddy-steg och kör om det (med "force").
- **Export compliance (krypteringsfrågan i App Store Connect)**:
  `Info.plist` deklarerar nu `ITSAppUsesNonExemptEncryption = false`
  (appen använder bara vanlig HTTPS, ingen egen krypteringskod), så
  "Manage Compliance"-frågan ska inte dyka upp längre för nya byggen.
  Deklarationen ligger både i det redan genererade `Info.plist` och i
  bootstrap-workflowets PlistBuddy-steg, så den överlever även en
  ommkörning med "force".
- TestFlight-bygget (`.github/workflows/testflight-deploy.yml`) hämtar
  byggnumret automatiskt från TestFlight och räknar upp.
- Signering sker automatiskt via App Store Connect-nyckeln
  (Admin-rollen, `-authenticationKeyPath`/`-authenticationKeyID`/
  `-authenticationKeyIssuerID` i `ios/App/fastlane/Fastfile`).
- **Bekräftat fungerande end-to-end 2026-10-29**: "Deploy to TestFlight"
  kördes efter bundle-ID-fixen och laddade upp ett bygge till TestFlight
  utan fel. Hela kedjan (bootstrap → bygge → signering → export →
  uppladdning) är nu verifierad.

## Vad som gjorts (Supabase-bytet)

- **Ny databas**: appen pekar nu på det nya Supabase-projektet
  (`psecehkkyghiugbizbse`). Den gamla databasen (Lovable Cloud) är
  övergiven — ingen data flyttades, eftersom den nya databasen är tom.
- **En ren grundmigrering**: de gamla 14 migreringarna är ersatta med en
  enda (`supabase/migrations/20260924000000_baseline_schema.sql`) som
  beskriver databasen i sitt slutgiltiga skick, plus explicita
  `GRANT`-rader för varje tabell/vy/funktion appen använder.
- **Två buggar fixade under städningen**:
  - Radering av konto (Profil → radera konto) försökte ta bort
    användarens meddelanden och notiser, men saknade rättigheter
    (RLS-policy) för det — det gick tyst fel. Nu finns policyer så det
    faktiskt fungerar.
  - Gäster som bläddrar på kartan utan att vara inloggade kunde inte läsa
    listan över länder (bara tips), vilket troligen gjorde
    kart-vyn ofullständig för dem. Nu kan gäster läsa länder också.
- **AI-funktioner** (`parse-tips`, `translate-text`) använder nu Googles
  Gemini API (gratisnivå, `gemini-2.5-flash`) istället för Lovables
  AI-gateway.
- **CORS** i edge-funktionerna är uppdaterat: Lovable-adresserna är
  borta, ersatta med de origins Capacitor-appen faktiskt använder
  (`tipit://localhost` m.fl. — se `supabase/functions/_shared/cors.ts`).
  Det finns en kommentar där en webbförhandsvisning kan läggas till
  senare.
- **Automatisk driftsättning**: `.github/workflows/supabase-deploy.yml`
  kör migreringar, sätter Edge Function-secrets och driftsätter alla
  funktioner när något i `supabase/` mergas till main (eller körs
  manuellt).
- **Lovable-städning**: `lovable-tagger`, dev-server-URL:en i
  `capacitor.config.ts`, den föråldrade README-texten och en
  config.toml-post för en funktion som inte längre finns
  (`get-tomtom-key`) är borttagna. `.env` är borttagen ur repot — de
  publika Supabase-värdena ligger direkt i
  `src/integrations/supabase/client.ts` istället.

## Kända problem / begränsningar

- **Kontoradering är inte komplett**: den tar bort tips, vänskapsrelationer,
  meddelanden och notiser, men själva inloggningskontot (`auth.users`) och
  profilraden lever kvar, eftersom en riktig radering kräver
  service-role-behörighet (en edge function). Bör byggas som en egen
  uppgift om det är viktigt.
- **Notiser skapas aldrig**: `notifications`-tabellen och dess policyer
  finns, men inget i appen skriver dit några rader idag. Funktionen är
  förberedd men inte kopplad.
- **Android är inte i fokus**: `android-config/` finns, men det är
  iOS/TestFlight som är den aktiva plattformen just nu.
- **`translate-text` och `get-mapbox-key`/`search-address` kräver ingen
  JWT-verifiering på gatewaynivå** (`verify_jwt = false` i
  `supabase/config.toml`) men gör sin egen auth-koll i koden — fungerar,
  men är lite inkonsekvent jämfört med `parse-tips`. Inte akut.
- **`.lovable/plan.md`** ligger kvar i repot (anteckningar från en
  tidigare designuppgift). Påverkar inte appen, kan städas bort vid
  tillfälle.
- Övriga dokument (`DEPLOYMENT.md`, `PUBLISHING_GUIDE.md`,
  `APP_STORE_CHECKLIST.md`, `docs/PROJECT_OVERVIEW.md`,
  `docs/METADATA.md`, `docs/FULL_CODEBASE.md`) nämner fortfarande Lovable
  på flera ställen (bundle-ID:t i dem är nu rättat till `com.tipit.app`,
  men övrig Lovable-text är inte städad) — kandidater för nästa
  städomgång.

## Nästa steg (prioritetsordning)

1. Mark: kolla i TestFlight-appen (eller App Store Connect) att det nya
   bygget dykt upp, och installera/testa det på din telefon.
2. Granska och mergea PR:en för iOS-byggkedjan.
3. Testa hela flödet i appen mot den nya databasen: registrera konto,
   skapa tips, vänförfrågan, chatt, rapportera/blockera, admin-panelen.
4. Bestäm om kontoradering ska göras komplett (kräver en ny edge
   function med service-role).
5. Bestäm om notiser ska kopplas ihop (skrivs t.ex. vid ny vänförfrågan,
   nytt meddelande) eller om tabellen ska tas bort om den inte behövs.
