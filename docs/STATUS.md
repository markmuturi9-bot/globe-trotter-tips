# TIPIT — nuläge

Senast uppdaterad: 2026-09-24, i samband med bytet från Lovable Cloud till
en egen Supabase-databas.

## Vad som gjorts

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

1. Mark: kör de manuella Supabase-dashboard-stegen (se PR-rapporten) så
   att inloggning fungerar mot den nya databasen.
2. Mark: granska och godkänn/mergea pull requesten.
3. Testa hela flödet i appen mot den nya databasen: registrera konto,
   skapa tips, vänförfrågan, chatt, rapportera/blockera, admin-panelen.
4. Bestäm om kontoradering ska göras komplett (kräver en ny edge
   function med service-role).
5. Bestäm om notiser ska kopplas ihop (skrivs t.ex. vid ny vänförfrågan,
   nytt meddelande) eller om tabellen ska tas bort om den inte behövs.
