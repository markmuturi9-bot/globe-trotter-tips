import { useState, useMemo } from 'react';
import { Globe, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipDetail } from '@/components/tips/TipDetail';
import { MapboxGlobe } from '@/components/map/MapboxGlobe';
import { useCountriesWithTips, useTips } from '@/hooks/useTips';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Tip, Country } from '@/types';
import type { MapMarker } from '@/components/map/MapProvider';

interface CountryWithTips extends Country {
  tipCount: number;
}

export function MapView() {
  const { data: countriesWithTips, isLoading: countriesLoading } = useCountriesWithTips();
  const { data: allTips, isLoading: tipsLoading } = useTips();
  const [selectedCountry, setSelectedCountry] = useState<CountryWithTips | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [noLocationOpen, setNoLocationOpen] = useState(false);

  // Tips for the selected country
  const countryTips = useMemo(() => {
    if (!selectedCountry || !allTips) return [];
    return allTips.filter(tip => tip.country_id === selectedCountry.id);
  }, [selectedCountry, allTips]);

  const tipsWithLocation = useMemo(() => 
    countryTips.filter(tip => tip.latitude && tip.longitude), 
    [countryTips]
  );

  const tipsWithoutLocation = useMemo(() => 
    countryTips.filter(tip => !tip.latitude || !tip.longitude), 
    [countryTips]
  );

  // Create markers for the map
  const mapMarkers: MapMarker[] = useMemo(() => {
    if (selectedCountry) {
      // When a country is selected, show individual tip markers
      // Tips with exact location use their coordinates
      // Tips without location use country coordinates
      const tipMarkers: MapMarker[] = [];

      // Add markers for tips with exact locations
      tipsWithLocation.forEach(tip => {
        tipMarkers.push({
          id: tip.id,
          position: [tip.latitude!, tip.longitude!],
          label: tip.title.length > 20 ? tip.title.substring(0, 20) + '...' : tip.title,
          onClick: () => setSelectedTip(tip),
        });
      });

      // Add markers for tips without locations at country position
      if (tipsWithoutLocation.length > 0 && selectedCountry.latitude && selectedCountry.longitude) {
        tipMarkers.push({
          id: `no-location-${selectedCountry.id}`,
          position: [selectedCountry.latitude, selectedCountry.longitude],
          count: tipsWithoutLocation.length,
          label: 'General tips',
          onClick: () => {}, // Could open a list
        });
      }

      return tipMarkers;
    } else {
      // World view - show country markers
      return countriesWithTips.map(country => ({
        id: country.id,
        position: [country.latitude || 0, country.longitude || 0] as [number, number],
        label: country.code,
        count: country.tipCount,
        onClick: () => {
          setSelectedCountry(country);
          setNoLocationOpen(false);
        },
      }));
    }
  }, [selectedCountry, countriesWithTips, tipsWithLocation, tipsWithoutLocation]);

  // Map config for country view
  const mapConfig = useMemo(() => {
    if (selectedCountry && selectedCountry.latitude && selectedCountry.longitude) {
      return {
        center: [selectedCountry.latitude, selectedCountry.longitude] as [number, number],
        zoom: 5,
      };
    }
    return undefined;
  }, [selectedCountry]);

  const highlightedCountryCodes = useMemo(() => 
    countriesWithTips.map(country => country.code),
    [countriesWithTips]
  );

  const isLoading = countriesLoading || tipsLoading;

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

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Back button when viewing a country */}
      {selectedCountry && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setSelectedCountry(null)}
            className="shadow-lg h-9 w-9"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Country info overlay - centered */}
      {selectedCountry && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card px-4 py-3 rounded-lg shadow-lg">
          <h2 className="font-serif text-lg font-semibold text-center">{selectedCountry.name}</h2>
          
          {tipsWithoutLocation.length > 0 && (
            <Collapsible open={noLocationOpen} onOpenChange={setNoLocationOpen} className="mt-2">
              <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto">
                {noLocationOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Tips utan adress ({tipsWithoutLocation.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {tipsWithoutLocation.map(tip => (
                  <button
                    key={tip.id}
                    onClick={() => setSelectedTip(tip)}
                    className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors"
                  >
                    {tip.title}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      <MapboxGlobe 
        key={selectedCountry?.id || 'world'}
        config={mapConfig}
        markers={mapMarkers} 
        highlightedCountryCodes={highlightedCountryCodes}
        className="flex-1"
        onMarkerClick={(id) => {
          const tip = allTips?.find(t => t.id === id);
          if (tip) {
            setSelectedTip(tip);
          }
        }}
      />

      {selectedTip && (
        <TipDetail tip={selectedTip} onClose={() => setSelectedTip(null)} />
      )}
    </div>
  );
}
