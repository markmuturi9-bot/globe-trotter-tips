# TIPIT — nuläge

Senast uppdaterad: 2026-09-30. Backend-bytet (Supabase) är klart och
mergat. Just nu pågår uppsättning av automatisk iOS-byggkedja till
TestFlight.

## iOS-status (pågående)

- `ios/App` finns **inte** i repot ännu. Det ska genereras av workflowet
  **"Bootstrap iOS project"** (`.github/workflows/ios-bootstrap.yml`,
  körs manuellt på macOS i Actions) — inte checkas in från en Mac, och
  inte genereras i den här (Linux-baserade) sessionen, eftersom
  `npx cap add ios` kräver macOS/CocoaPods.
- **Kör bootstrap-workflowet på den här PR-grenen innan den mergas**, så
  det genererade projektet kan granskas som en del av samma PR, istället
  för att pusha direkt mot main efteråt.
- Appens riktiga `appId` (`app.lovable.8119531570f64ad1b5f9255d17b94d5e`)
  klarar inte Capacitors egen validering (ett segment börjar med en
  siffra) — bootstrap-workflowet genererar därför projektet under ett
  tillfälligt platshållar-id och byter tillbaka det riktiga innan commit.
  `capacitor.config.ts` lämnas aldrig ändrat i slutresultatet.
- Behörighetstexter: appen har idag ingen platsfunktion i koden (ingen
  GPS/geolocation någonstans), bara bilduppladdning via vanlig filväljare
  (tips-bilder + profilbild). Bootstrap-workflowet lägger därför bara in
  kamera- och bibliotek-texter (svenska + engelska i samma sträng, inte
  separata `.lproj`-filer — se motivering nedan), inte platsbehörighet.
- **Om appen senare får fler native-funktioner** (kamera direkt via
  Capacitor, platsdata, push-notiser osv.): lägg till motsvarande
  `NSxxxUsageDescription`-nyckel i bootstrap-workflowets
  PlistBuddy-steg och kör om det (med "force").
- TestFlight-bygget (`.github/workflows/testflight-deploy.yml`) hämtar
  byggnumret automatiskt från TestFlight och räknar upp — senast kända
  nummer var 6, så nästa bygge blir 7 utan att någon behöver skriva in
  det manuellt.
- Signering sker automatiskt via App Store Connect-nyckeln. **Nyckeln
  behöver Admin-rollen** i App Store Connect (Users and Access →
  Integrations) för att få skapa certifikat/profiler automatiskt — annars
  misslyckas byggsteget med ett signeringsfel.
- Inte verifierat live än (kräver körning på riktig macOS-runner, som
  inte finns tillgänglig i den här sessionen): exakt hur CocoaPods/Xcode
  beter sig, om `GITHUB_TOKEN` har push-rättighet för bootstrap-commiten
  (Settings → Actions → General → Workflow permissions måste tillåta
  "Read and write"), och om ASC-nyckelns behörighet räcker för
  signeringen. Räkna med att detta kan behöva ett par körningar/fixar
  innan det går igenom helt, precis som Supabase-workflowet gjorde.

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
  på flera ställen. De rördes inte i den här uppgiften (bara README.md
  var uttryckligen efterfrågad) men är kandidater för nästa
  städomgång.

## Nästa steg (prioritetsordning)

1. Mark: kör workflowet **"Bootstrap iOS project"** på den här PR-grenen
   (Actions-fliken → välj workflowet → Run workflow → välj grenen).
2. Granska resultatet (committen med `ios/`-mappen), kör **"Deploy to
   TestFlight"** manuellt och se om den går igenom.
3. Om något av stegen felar: skicka felmeddelandet, så felsöker vi det
   tillsammans (samma mönster som med Supabase-workflowet).
4. När TestFlight-bygget fungerar: granska och mergea PR:en.
5. Testa hela flödet i appen mot den nya databasen: registrera konto,
   skapa tips, vänförfrågan, chatt, rapportera/blockera, admin-panelen.
6. Bestäm om kontoradering ska göras komplett (kräver en ny edge
   function med service-role).
7. Bestäm om notiser ska kopplas ihop (skrivs t.ex. vid ny vänförfrågan,
   nytt meddelande) eller om tabellen ska tas bort om den inte behövs.
