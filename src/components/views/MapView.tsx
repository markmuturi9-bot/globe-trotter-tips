import { useState, useMemo } from 'react';
import { Globe, ArrowLeft, ChevronDown, ChevronRight, Filter, Users, User, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipDetail } from '@/components/tips/TipDetail';
import { MapboxGlobe } from '@/components/map/MapboxGlobe';
import { useCountriesWithTips, useTips } from '@/hooks/useTips';
import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/hooks/useAuth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tip, Country, Profile } from '@/types';
import type { MapMarker } from '@/components/map/MapProvider';

interface CountryWithTips extends Country {
  tipCount: number;
}

type FilterType = 'all' | 'friends' | 'me' | string; // string for specific friend ID

export function MapView() {
  const { user } = useAuth();
  const { data: friendships } = useFriendships();
  const { data: countriesWithTips, isLoading: countriesLoading } = useCountriesWithTips();
  const { data: allTips, isLoading: tipsLoading } = useTips();
  const [selectedCountry, setSelectedCountry] = useState<CountryWithTips | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [noLocationOpen, setNoLocationOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Get accepted friends
  const acceptedFriends = useMemo(() => {
    if (!user || !friendships) return [];
    return friendships
      .filter(f => f.status === 'accepted')
      .map(f => {
        const friend = f.requester_id === user.id ? f.addressee : f.requester;
        return friend;
      })
      .filter(Boolean) as Profile[];
  }, [user, friendships]);

  const friendIds = useMemo(() => acceptedFriends.map(f => f.id), [acceptedFriends]);

  // Filter tips based on selected filter
  const filteredTips = useMemo(() => {
    if (!allTips) return [];
    
    switch (filter) {
      case 'all':
        return allTips;
      case 'friends':
        return allTips.filter(tip => friendIds.includes(tip.user_id));
      case 'me':
        return user ? allTips.filter(tip => tip.user_id === user.id) : [];
      default:
        // Specific friend ID
        return allTips.filter(tip => tip.user_id === filter);
    }
  }, [allTips, filter, friendIds, user]);

  // Recalculate countries with tips based on filtered tips
  const filteredCountriesWithTips = useMemo(() => {
    if (!countriesWithTips || !filteredTips) return [];
    
    const tipCountByCountry = filteredTips.reduce((acc, tip) => {
      acc[tip.country_id] = (acc[tip.country_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return countriesWithTips
      .map(country => ({
        ...country,
        tipCount: tipCountByCountry[country.id] || 0,
      }))
      .filter(country => country.tipCount > 0);
  }, [countriesWithTips, filteredTips]);

  // Tips for the selected country (filtered)
  const countryTips = useMemo(() => {
    if (!selectedCountry || !filteredTips) return [];
    return filteredTips.filter(tip => tip.country_id === selectedCountry.id);
  }, [selectedCountry, filteredTips]);

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
      const tipMarkers: MapMarker[] = [];

      tipsWithLocation.forEach(tip => {
        tipMarkers.push({
          id: tip.id,
          position: [tip.latitude!, tip.longitude!],
          label: tip.title.length > 20 ? tip.title.substring(0, 20) + '...' : tip.title,
          onClick: () => setSelectedTip(tip),
        });
      });

      if (tipsWithoutLocation.length > 0 && selectedCountry.latitude && selectedCountry.longitude) {
        tipMarkers.push({
          id: `no-location-${selectedCountry.id}`,
          position: [selectedCountry.latitude, selectedCountry.longitude],
          count: tipsWithoutLocation.length,
          label: 'General tips',
          onClick: () => {},
        });
      }

      return tipMarkers;
    } else {
      return filteredCountriesWithTips.map(country => ({
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
  }, [selectedCountry, filteredCountriesWithTips, tipsWithLocation, tipsWithoutLocation]);

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
    filteredCountriesWithTips.map(country => country.code),
    [filteredCountriesWithTips]
  );

  const isLoading = countriesLoading || tipsLoading;

  const getFilterLabel = () => {
    switch (filter) {
      case 'all': return 'Alla';
      case 'friends': return 'Vänner';
      case 'me': return 'Mina tips';
      default:
        const friend = acceptedFriends.find(f => f.id === filter);
        return friend?.username || 'Vän';
    }
  };

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
      {/* Filter dropdown - top right */}
      <div className="absolute top-4 right-4 z-10">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-[160px] bg-card shadow-lg">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue>{getFilterLabel()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4" />
                Alla användare
              </div>
            </SelectItem>
            {user && (
              <>
                <SelectItem value="me">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Mina tips
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Alla vänner
                  </div>
                </SelectItem>
                {acceptedFriends.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Specifik vän
                    </div>
                    {acceptedFriends.map(friend => (
                      <SelectItem key={friend.id} value={friend.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                            {friend.username.substring(0, 1).toUpperCase()}
                          </div>
                          {friend.username}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

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
        key={`${selectedCountry?.id || 'world'}-${filter}`}
        config={mapConfig}
        markers={mapMarkers} 
        highlightedCountryCodes={highlightedCountryCodes}
        className="flex-1"
        onMarkerClick={(id) => {
          const tip = filteredTips?.find(t => t.id === id);
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
