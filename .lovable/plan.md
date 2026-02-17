

# Visuell redesign inspirerad av BRIK-estetiken

## Sammanfattning

Bilden visar en mork, premium UI med djupa teal/grongron-svarta bakgrunder, rundade kort med synliga ljusa kanter, mjuka lavendel/lila accenter och stor, fetare typografi. Jag foreslar att vi implementerar detta som ett **rent CSS-tema** som kan slas pa och av utan att rora nagon funktionell kod.

## Strategi for sakerhet och reversibilitet

### Varfor detta ar riskfritt

Hela TIPIT-appen anvander redan CSS-variabler (`--background`, `--card`, `--primary`, etc.) for alla farger, och Tailwind-klasser for layout. Genom att **bara overrida dessa CSS-variabler** under en ny CSS-klass behovs:

- **Noll andring i React-komponenter** (ingen risk for funktionella buggar)
- **Noll andring i Tailwind-config** (befintlig konfiguration forblir ororad)
- **Inget nytt beroende** (ingen ny npm-paket)

### Sa byter du mellan designerna

En ny knapp laggs till bredvid tema-valjaren (sol/mane-ikonen) i headern. Den togglar en CSS-klass pa `<html>`-elementet. Valet sparas i localStorage sa det overlever sidladdningar.

- Klicka en gang: BRIK-designen aktiveras
- Klicka igen: Tillbaka till original-designen
- Ingen sidladdning kravs, bytet sker omedelbart

## Detaljerade andringar

### 1. Ny CSS-fil: `src/styles/theme-brik.css`

En helt ny fil som definierar CSS-variabel-overrides under klassen `.theme-brik`. Denna fil importeras i `index.css` men paverkar ingenting forutom nar klassen ar aktiv.

Fargprofil baserad pa bilden:
- **Bakgrund**: Djup mork teal (~hsl(170 20% 7%))
- **Kort**: Nagot ljusare teal (~hsl(170 15% 10%)) med synliga ljusa kanter
- **Primary/accent**: Mjuk lavendel (~hsl(252 50% 72%))
- **Foreground-text**: Ljus/vit (~hsl(0 0% 92%))
- **Border**: Synligare, ljusare kanter (~hsl(170 10% 25%))
- **Radie**: Storre rundning (1rem istallet for 0.75rem)

Filen overridar bade `:root.theme-brik` och `.theme-brik.dark` sa att designen funkar oavsett ljust/morkt lage (men BRIK-stilen ar primart mork).

### 2. Ny komponent: `src/components/theme/DesignToggle.tsx`

En enkel knapp-komponent som:
- Togglar klassen `theme-brik` pa `<html>`-elementet
- Sparar valet i `localStorage` under nyckeln `tipit-design`
- Visar en ikon (t.ex. Palette) for att skilja den fran tema-togglaren
- Laser localStorage vid mount for att aterstalla valet

### 3. Mindre andringar i befintliga filer

| Fil | Andring | Risk |
|-----|---------|------|
| `src/index.css` | Lagg till `@import './styles/theme-brik.css'` langst upp | Ingen - import av tom-aktiv CSS |
| `src/components/layout/Header.tsx` | Lagg till `<DesignToggle />` bredvid `<ThemeToggle />` | Minimal - en extra knapp i toolbaren |
| `src/components/theme/SystemChromeSync.tsx` | Uppdatera LIGHT_CHROME/DARK_CHROME att lasa om `.theme-brik` ar aktiv, for korrekt statusbar-farg pa nativ | Minimal - villkorlig hex-varde |

### 4. Typografi-overrides i theme-brik.css

Bilden visar en serifare, fetare rubrikstil. Jag importerar fonten "DM Serif Display" (Google Fonts) i BRIK-temat och overridar `font-family` for rubriker under `.theme-brik`.

## Teknisk detalj

```text
Filstruktur:
src/
  styles/
    theme-brik.css        <-- NY fil (CSS-variabler + font)
  components/
    theme/
      DesignToggle.tsx    <-- NY fil (toggle-knapp)
      ThemeToggle.tsx      (oforandrad)
      SystemChromeSync.tsx (liten uppdatering for chrome-farg)
  index.css               (en rad tillagd: @import)
  components/
    layout/
      Header.tsx           (en komponent tillagd i toolbar)
```

Inga andra filer behover andras. Alla vyer (MapView, ListView, ProfileView, FriendsView), alla tips-komponenter, alla hooks, all affarslogik forblir helt ororda.

## Atergang till originaldesignen

- **Under utveckling**: Klicka pa design-toggle-knappen i headern
- **Permanent borttagning**: Ta bort importen i index.css, ta bort `theme-brik.css` och `DesignToggle.tsx`, ta bort `<DesignToggle />` fran Header.tsx. Tre enradig-andringar + tva filer borttagna.

