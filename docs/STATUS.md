# TIPIT — nuläge

Senast uppdaterad: 2026-11-12. Backend-bytet (Supabase), iOS/TestFlight-
kedjan och designuppdateringen är mergade. Pågående arbete (en PR): ta bort
notisklockan, fylla hela skärmen på iPhone, kontoskapande med e-postkod,
adminskydd och riktig kontoradering. Se "Pågående PR" nedan.

## Pågående PR (nov 2026) — väntar på granskning och test

- **Notisklockan borttagen** från headern (hade ingen funktion). Tabellen
  `notifications` är orörd.
- **Skärmen fylls ut på iPhone**: `ios.contentInset` ändrat från
  `'automatic'` till `'never'` i `capacitor.config.ts` (iOS la på
  säkerhetsområdena själv, och appens CSS gjorde det också → svarta kanter).
  **Ej testat** (kan inte köras här). Skicka skärmdump efter nästa
  TestFlight-bygge; ligger kanterna kvar ska orsaken utredas, inte gissas.
- **Konto och lösenord**: registrering bekräftas med en kod på 6 siffror
  (mejlet skickas av Supabase Auth), kod kan skickas igen (60 s mellan),
  glömt lösenord med kod, byta lösenord i Inställningar. Lösenord minst 8
  tecken. Användarnamn 3–30 tecken (`a-z A-Z 0-9 _ -`), unikt oavsett
  versaler (databasen vaktar via migreringen
  `20261113000000_username_rules.sql`, appen frågar via
  `is_username_available`). Sidan `/auth` skickar nu vidare till Profil —
  all inloggning ligger i `src/components/auth/AuthScreen.tsx`.
  **Fungerar inte fullt ut förrän Mark gjort stegen i
  `docs/SUPABASE-INSTALLNING.md`** (Confirm email på, lösenordslängd 8,
  mejlmallar med `{{ .Token }}`).
- **Admin**: den sista admin kan inte tas bort eller nedgraderas
  (databastrigger i `20261113000100_last_admin_guard.sql` + avstängd knapp i
  `Admin.tsx`). Första admin skapas manuellt i SQL Editor
  (`docs/SUPABASE-INSTALLNING.md`, steg 4).
- **Kontoradering på riktigt**: ny edge function `delete-account` (kräver
  lösenord, vägrar sista admin, tar bort filer i `tip-images/<user-id>/`,
  raderar sedan inloggningen; resten följer med via cascade — även
  chattar för den andra parten). Klienten visar "raderat" först när
  servern bekräftat. **Ej testad mot riktiga Supabase** — funktionen
  driftsätts vid merge till main.
- **Kvar efter radering (medvetet orört, ska beslutas av Mark)**:
  `reports` och `blocked_users` har inga främmande nycklar, så rader som
  nämner det raderade id:t ligger kvar. `support_requests.user_id` sätts
  till null, men raden behåller `name`, `email`, `subject` och
  `message`.

## Designuppdatering (november 2026) — mergad

Gjort enligt designspecen (layout/scroll, tokens, header + bottenmeny med "+",
ny Profil, ny Settings-sida).

- **Layout/scroll**: rotorsaken var att `html` hade säkerhetsmarginal (padding)
  samtidigt som skalet var 100dvh högt, och att `body` var `position: fixed` med
  `overflow: hidden` → sidan blev högre än skärmen och botten klipptes. Nu finns
  en enda scrollyta (`AppShell`), säkerhetsområden räknas bara i header (topp) och
  bottenmeny (botten), och innehållet har utrymme under menyn.
- **Header** 56 px, döljs vid scroll nedåt på List/Friends/Profile.
- **Bottenmeny** genomskinlig med oskärpa, "+" i mitten.
- **Nytt**: `/settings`, minimal språkhantering (`src/lib/i18n.tsx`, svenska +
  engelska, sparas på enheten).
- **Känt/kvar**: inloggning, registrering, lösenord och radering är nu
  översatta; resten av appen (t.ex. adminsidan, tips, vänner) är
  fortfarande på engelska. Push-notiser finns inte i appen: kontrollen sparar
  bara valet på enheten. Synligheten är nu på riktigt: migreringen
  `20261112000000_tips_visibility.sql` (se `docs/FORSLAG-profilsynlighet.md`)
  körs vid merge till `main`. Utloggade ser inga tips.
- **Ej testat på riktig iPhone** (ingen Mac här).


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
- **Håll Supabase vaken**: `.github/workflows/supabase-keepalive.yml`
  gör en liten läsfråga mot databasen var tredje dag (och kan köras
  manuellt), så gratisprojektet inte pausas efter 7 dagars inaktivitet.
- **Lovable-städning**: `lovable-tagger`, dev-server-URL:en i
  `capacitor.config.ts`, den föråldrade README-texten och en
  config.toml-post för en funktion som inte längre finns
  (`get-tomtom-key`) är borttagna. `.env` är borttagen ur repot — de
  publika Supabase-värdena ligger direkt i
  `src/integrations/supabase/client.ts` istället.

## Kända problem / begränsningar

- **Obekräftade konton håller kvar sitt användarnamn** tills de rensas
  manuellt (Authentication → Users).
- **`npm run lint` har ~30 äldre fel** (mest `any`-typer och en `require`
  i `tailwind.config.ts`) som inte rörts i den här PR:en. Inga nya fel
  tillkom.
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

1. Mark: gör stegen i `docs/SUPABASE-INSTALLNING.md` (kolla användarnamn
   före merge, sedan Confirm email, lösenordslängd, mejlmallar, första
   admin).
2. Granska och mergea PR:en; kör "Deploy to TestFlight" och skicka
   skärmdump av skärmen (svarta kanter borta?).
3. Testa hela flödet: registrera med kod, glömt lösenord, byt lösenord,
   radera konto, adminpanelen.
4. Besluta vad som ska hända med `reports`, `blocked_users` och
   `support_requests` vid kontoradering (se ovan).
5. Besluta om notiser ska kopplas ihop eller om tabellen ska tas bort.
