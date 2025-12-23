import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie_consent';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  accepted_at: string;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      functional: true,
      accepted_at: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      functional: false,
      accepted_at: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
      <Card className="max-w-4xl mx-auto shadow-lg border-border/50">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden md:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Vi använder cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Vi använder nödvändiga cookies för att tjänsten ska fungera. 
                  Funktionella cookies hjälper oss att förbättra din upplevelse.
                  Läs mer i vår{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    integritetspolicy
                  </Link>.
                </p>
              </div>

              {showDetails && (
                <div className="space-y-3 border-t border-border pt-4 animate-fade-in">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Nödvändiga cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Krävs för inloggning och grundläggande funktionalitet. Kan inte stängas av.
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Alltid på</span>
                  </div>
                  
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Funktionella cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Sparar dina preferenser som sidofältets läge.
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">Valfritt</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button onClick={handleAcceptAll} className="flex-1 sm:flex-none">
                  Acceptera alla
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAcceptNecessary}
                  className="flex-1 sm:flex-none"
                >
                  Endast nödvändiga
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm"
                >
                  {showDetails ? 'Dölj detaljer' : 'Visa detaljer'}
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 -mt-1 -mr-1"
              onClick={handleAcceptNecessary}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
