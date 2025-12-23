import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">Användarvillkor</h1>
        <p className="text-muted-foreground mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif font-medium mb-3">1. Godkännande av villkor</h2>
            <p className="text-muted-foreground leading-relaxed">
              Genom att använda denna tjänst godkänner du dessa användarvillkor. 
              Om du inte accepterar villkoren, vänligen använd inte tjänsten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">2. Tjänstebeskrivning</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tjänsten är en plattform för att dela och upptäcka resetips. 
              Användare kan skapa, dela och spara resetips samt interagera med andra användare.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">3. Användarkonto</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Du måste vara minst 16 år för att använda tjänsten</li>
              <li>Du ansvarar för att hålla dina inloggningsuppgifter säkra</li>
              <li>Du är ansvarig för all aktivitet på ditt konto</li>
              <li>Du måste ange korrekt information vid registrering</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">4. Användarinnehåll</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Du behåller äganderätten till innehåll du skapar. Genom att publicera innehåll 
              ger du oss en licens att visa och distribuera det inom tjänsten.
            </p>
            <p className="text-muted-foreground leading-relaxed">Du får inte publicera innehåll som:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Bryter mot lag eller andras rättigheter</li>
              <li>Är kränkande, hotfullt eller diskriminerande</li>
              <li>Innehåller vilseledande information</li>
              <li>Är spam eller reklam utan tillåtelse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">5. Uppförande</h2>
            <p className="text-muted-foreground leading-relaxed">
              Du förväntas behandla andra användare med respekt. Vi förbehåller oss rätten 
              att ta bort innehåll eller stänga av konton som bryter mot dessa villkor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">6. Immateriella rättigheter</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tjänstens design, kod och varumärken tillhör oss. Du får inte kopiera, 
              modifiera eller distribuera dessa utan skriftligt tillstånd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">7. Ansvarsbegränsning</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tjänsten tillhandahålls "i befintligt skick". Vi garanterar inte att tjänsten 
              alltid är tillgänglig eller felfri. Vi ansvarar inte för skador som uppstår 
              genom användning av tjänsten, i den utsträckning lagen tillåter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">8. Avsluta konto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Du kan när som helst avsluta ditt konto via profilinställningarna. 
              Vid kontoavslutning raderas dina uppgifter i enlighet med vår{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                integritetspolicy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">9. Ändringar av villkor</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi kan uppdatera dessa villkor. Vid väsentliga ändringar informerar vi dig 
              via e-post eller i tjänsten. Fortsatt användning efter ändring innebär 
              att du accepterar de nya villkoren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">10. Tillämplig lag</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dessa villkor lyder under svensk lag. Eventuella tvister ska i första hand 
              lösas genom förhandling, i andra hand genom allmän domstol i Sverige.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">11. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              För frågor om dessa villkor, kontakta oss via tjänstens kontaktfunktion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
