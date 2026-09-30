# CLAUDE.md — regler för arbete på TIPIT

TIPIT är Marks privata reseapp (spara/dela resetips på en karta). Mark äger
appen, är enda användaren, och kan inte programmera själv — feedback kommer
från hur appen används och ser ut, ofta med skärmdumpar. Detta dokument är
stående regler för allt arbete i det här repot, oavsett vilken uppgift som
görs.

## Kommunikation

- Förklara allt på kort, enkel svenska utan kodjargong.
- Berätta alltid: vad som ändrats, varför, och vad Mark ska testa.
- Om något är oklart, eller är ett större design- eller funktionsval:
  fråga, eller ge 2–3 alternativ. Gissa inte på sådant Mark borde tycka
  till om.

## Hur kod skrivs

- Varje ändring ska ha ett tydligt syfte för användning eller stabilitet.
  Inga onödiga beroenden, ingen död kod.
- Håll ändringar små och fokuserade på det som faktiskt efterfrågats.
- Appen ska finnas på svenska och engelska.

## Arbetsflöde

- Jobba i en egen branch per uppgift. Öppna en pull request. Ingenting
  når `main` utan Marks godkännande.
- Dela upp stora uppgifter i mindre steg och committa löpande.
- Ändra aldrig `appId` i `capacitor.config.ts` — då slutar TestFlight att
  känna igen appen.
- Innan en uppgift rapporteras som klar: kontrollera att build (`npm run
  build`) och lint (`npm run lint`) går igenom, och att ändringen fungerar
  som avsett.
- Håll `docs/STATUS.md` uppdaterad med kort nuläge, kända problem och
  nästa steg, så nästa session kan fortsätta därifrån.

## Hemligheter och nycklar

- Hemliga nycklar (t.ex. `GEMINI_API_KEY`, service-role-nycklar) får
  aldrig ligga i koden — bara i GitHub-secrets eller Supabase Edge
  Function-secrets.
- Publika värden (Supabase-URL, Supabase publishable key, Mapbox
  pk-token) får ligga direkt i koden.

## Databas (Supabase)

- Alla databasändringar görs som migreringar i `supabase/migrations`.
- Varje tabell ska ha RLS (Row Level Security) påslaget och explicita
  `GRANT`-rader. Nya tabeller exponeras inte automatiskt i det här
  projektet — utan en explicit `GRANT` kan varken `anon` eller
  `authenticated` läsa/skriva till tabellen, oavsett RLS-policyer.
- Kontrollera att RLS-policyer är rimliga i förhållande till hur appen
  faktiskt används (t.ex. att gäster som bläddrar på kartan utan
  inloggning fortfarande kan läsa det som krävs för det).

## iOS

- Xcode-projektet (`ios/App`) hanteras av Mark själv på en lånad Mac.
  Bygg inget för iOS här om inte annat sägs uttryckligen.
