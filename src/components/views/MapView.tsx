import { useState, useMemo } from 'react';
import { Globe, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipCard } from '@/components/tips/TipCard';
import { TipDetail } from '@/components/tips/TipDetail';
import { TomTomMap } from '@/components/map/TomTomMap';
import { useCountriesWithTips, useTips } from '@/hooks/useTips';
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
        onClick: () => setSelectedCountry(country),
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
            size="sm"
            onClick={() => setSelectedCountry(null)}
            className="shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to World
          </Button>
        </div>
      )}

      {/* Country info overlay */}
      {selectedCountry && (
        <div className="absolute top-4 right-4 z-10 bg-card p-4 rounded-lg shadow-lg max-w-xs">
          <h2 className="font-serif text-xl font-semibold">{selectedCountry.name}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {selectedCountry.tipCount} tip{selectedCountry.tipCount !== 1 ? 's' : ''} shared
          </p>
          
          {/* Quick tip list */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {tipsWithLocation.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3" />
                  With location ({tipsWithLocation.length})
                </h4>
                {tipsWithLocation.map(tip => (
                  <button
                    key={tip.id}
                    onClick={() => setSelectedTip(tip)}
                    className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors"
                  >
                    {tip.title}
                  </button>
                ))}
              </div>
            )}
            
            {tipsWithoutLocation.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  General ({tipsWithoutLocation.length})
                </h4>
                {tipsWithoutLocation.map(tip => (
                  <button
                    key={tip.id}
                    onClick={() => setSelectedTip(tip)}
                    className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors"
                  >
                    {tip.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <TomTomMap 
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
