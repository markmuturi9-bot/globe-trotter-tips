import { useState, useMemo } from 'react';
import { Globe, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipCard } from '@/components/tips/TipCard';
import { TipDetail } from '@/components/tips/TipDetail';
import { useCountriesWithTips, useTipsByCountry } from '@/hooks/useTips';
import type { Tip, Country } from '@/types';

interface CountryWithTips extends Country {
  tipCount: number;
}

export function MapView() {
  const { data: countriesWithTips, isLoading } = useCountriesWithTips();
  const [selectedCountry, setSelectedCountry] = useState<CountryWithTips | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  
  const { data: countryTips } = useTipsByCountry(selectedCountry?.id || null);
  
  const tipsWithLocation = useMemo(() => 
    countryTips?.filter(tip => tip.latitude && tip.longitude) || [], 
    [countryTips]
  );
  
  const tipsWithoutLocation = useMemo(() => 
    countryTips?.filter(tip => !tip.latitude && !tip.longitude) || [], 
    [countryTips]
  );
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }
  
  if (selectedCountry) {
    return (
      <div className="flex-1 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCountry(null)}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Globe
          </Button>
          <h2 className="font-serif text-2xl font-semibold">{selectedCountry.name}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCountry.tipCount} tip{selectedCountry.tipCount !== 1 ? 's' : ''} shared
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {tipsWithLocation.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Tips with location
              </h3>
              <div className="space-y-3">
                {tipsWithLocation.map(tip => (
                  <TipCard key={tip.id} tip={tip} onClick={() => setSelectedTip(tip)} />
                ))}
              </div>
            </div>
          )}
          
          {tipsWithoutLocation.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Tips without location
              </h3>
              <div className="space-y-3">
                {tipsWithoutLocation.map(tip => (
                  <TipCard key={tip.id} tip={tip} onClick={() => setSelectedTip(tip)} />
                ))}
              </div>
            </div>
          )}
          
          {countryTips?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tips yet for this country.</p>
            </div>
          )}
        </div>
        
        {selectedTip && (
          <TipDetail tip={selectedTip} onClose={() => setSelectedTip(null)} />
        )}
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 relative bg-gradient-to-b from-accent/30 to-background overflow-hidden">
        {/* Visual globe representation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            {/* Globe circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20" />
            
            {/* Decorative lines */}
            <div className="absolute inset-4 rounded-full border border-dashed border-primary/10" />
            <div className="absolute inset-8 rounded-full border border-dashed border-primary/10" />
            <div className="absolute inset-12 rounded-full border border-dashed border-primary/10" />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-16 h-16 md:w-24 md:h-24 text-primary/40" />
            </div>
          </div>
        </div>
        
        {/* Country markers floating around */}
        <div className="absolute inset-0 pointer-events-none">
          {countriesWithTips.slice(0, 8).map((country, index) => {
            const angle = (index / 8) * 2 * Math.PI;
            const radius = 35 + (index % 2) * 10;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            
            return (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm shadow-medium group-hover:scale-110 transition-transform">
                    {country.tipCount}
                  </div>
                  <span className="text-xs font-medium mt-1 bg-card/90 px-2 py-0.5 rounded shadow-soft">
                    {country.code}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Country list below */}
      <div className="p-4 border-t border-border bg-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Countries with tips ({countriesWithTips.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {countriesWithTips.map(country => (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors"
            >
              <span className="font-medium">{country.name}</span>
              <span className="text-xs text-muted-foreground">({country.tipCount})</span>
            </button>
          ))}
          
          {countriesWithTips.length === 0 && (
            <p className="text-sm text-muted-foreground">No tips have been shared yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
