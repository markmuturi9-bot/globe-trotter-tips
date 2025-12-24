import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-5 md:p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="hidden md:flex w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-1.5">Vi använder cookies</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vi använder nödvändiga cookies för att tjänsten ska fungera.{' '}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Läs vår integritetspolicy
                </Link>.
              </p>
            </div>

            {showDetails && (
              <div className="space-y-3 border-t border-border/50 pt-4 animate-fade-in">
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Nödvändiga cookies</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Krävs för inloggning och grundläggande funktionalitet.
                    </p>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">Alltid på</span>
                </div>
                
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Funktionella cookies</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
                className="text-sm gap-1.5"
              >
                {showDetails ? (
                  <>Dölj detaljer <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Visa detaljer <ChevronDown className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 -mt-1 -mr-1 rounded-xl"
            onClick={handleAcceptNecessary}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}