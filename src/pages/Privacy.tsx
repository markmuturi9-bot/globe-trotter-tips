import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">Integritetspolicy</h1>
        <p className="text-muted-foreground mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif font-medium mb-3">1. Inledning</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi värnar om din integritet och är engagerade i att skydda dina personuppgifter. 
              Denna integritetspolicy förklarar hur vi samlar in, använder och skyddar din information 
              i enlighet med EU:s dataskyddsförordning (GDPR) och svensk lagstiftning.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">2. Personuppgiftsansvarig</h2>
            <p className="text-muted-foreground leading-relaxed">
              Personuppgiftsansvarig för behandlingen av dina personuppgifter är tjänstens ägare. 
              Du kan kontakta oss via e-post för frågor om dataskydd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">3. Vilka uppgifter vi samlar in</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Vi samlar in följande kategorier av personuppgifter:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Kontouppgifter:</strong> E-postadress, användarnamn</li>
              <li><strong>Innehåll du skapar:</strong> Resestipar, platser, bilder du laddar upp</li>
              <li><strong>Teknisk data:</strong> IP-adress, webbläsartyp, enhetsinformation</li>
              <li><strong>Användningsdata:</strong> Hur du interagerar med tjänsten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">4. Rättslig grund för behandling</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Vi behandlar dina personuppgifter baserat på:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Avtal:</strong> För att tillhandahålla tjänsten du registrerat dig för</li>
              <li><strong>Samtycke:</strong> När du godkänner cookies eller viss databehandling</li>
              <li><strong>Berättigat intresse:</strong> För att förbättra och säkra tjänsten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">5. Hur vi använder dina uppgifter</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Tillhandahålla och förbättra tjänsten</li>
              <li>Hantera ditt användarkonto</li>
              <li>Möjliggöra sociala funktioner (vänner, delning)</li>
              <li>Skicka viktiga meddelanden om tjänsten</li>
              <li>Analysera användning för att förbättra upplevelsen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">6. Delning av uppgifter</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi säljer aldrig dina personuppgifter. Vi kan dela data med:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Tjänsteleverantörer:</strong> Som hjälper oss driva tjänsten (hosting, autentisering)</li>
              <li><strong>Rättsliga krav:</strong> Om vi är skyldiga enligt lag</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">7. Lagring och säkerhet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dina uppgifter lagras på säkra servrar inom EU/EES. Vi använder kryptering och 
              andra tekniska åtgärder för att skydda din data. Vi behåller dina uppgifter 
              så länge du har ett konto hos oss eller så länge det krävs enligt lag.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">8. Dina rättigheter</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Enligt GDPR har du följande rättigheter:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Tillgång:</strong> Du kan begära en kopia av dina uppgifter</li>
              <li><strong>Rättelse:</strong> Du kan korrigera felaktiga uppgifter</li>
              <li><strong>Radering:</strong> Du kan begära att vi raderar dina uppgifter</li>
              <li><strong>Begränsning:</strong> Du kan begränsa hur vi använder dina uppgifter</li>
              <li><strong>Dataportabilitet:</strong> Du kan exportera dina uppgifter</li>
              <li><strong>Invändning:</strong> Du kan invända mot viss behandling</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Du kan utöva dessa rättigheter via dina profilinställningar eller genom att kontakta oss.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi använder cookies för att tjänsten ska fungera korrekt. Se vår cookie-banner 
              för mer information och för att hantera dina preferenser. Nödvändiga cookies 
              krävs för autentisering och kan inte stängas av.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">10. Ändringar i policyn</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi kan uppdatera denna policy vid behov. Vid väsentliga ändringar meddelar 
              vi dig via e-post eller i tjänsten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">11. Klagomål</h2>
            <p className="text-muted-foreground leading-relaxed">
              Om du är missnöjd med hur vi hanterar dina personuppgifter har du rätt att 
              lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY) på{' '}
              <a 
                href="https://www.imy.se" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.imy.se
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">12. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              För frågor om denna integritetspolicy eller hur vi behandlar dina uppgifter, 
              kontakta oss via tjänstens kontaktfunktion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
