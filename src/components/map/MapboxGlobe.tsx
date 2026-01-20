import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import type { MapConfig, MapMarker } from './MapProvider';
import { MAP_DEFAULTS } from './MapProvider';
import { supabase } from '@/integrations/supabase/client';

interface MapboxGlobeProps {
  config?: Partial<MapConfig>;
  markers?: MapMarker[];
  highlightedCountryCodes?: string[];
  className?: string;
  onMarkerClick?: (markerId: string) => void;
  onCountryClick?: (countryCode: string) => void;
}

type ClusterProperties = {
  cluster: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string;
  markerId?: string;
  markerLabel?: string;
  markerCount?: number;
};

type PointFeature = GeoJSON.Feature<GeoJSON.Point, ClusterProperties>;

// Country code mapping from 2-letter to 3-letter ISO codes (Mapbox uses 3-letter)
const iso2ToIso3: Record<string, string> = {
  'AF': 'AFG', 'AL': 'ALB', 'DZ': 'DZA', 'AD': 'AND', 'AO': 'AGO', 'AG': 'ATG', 'AR': 'ARG', 'AM': 'ARM',
  'AU': 'AUS', 'AT': 'AUT', 'AZ': 'AZE', 'BS': 'BHS', 'BH': 'BHR', 'BD': 'BGD', 'BB': 'BRB', 'BY': 'BLR',
  'BE': 'BEL', 'BZ': 'BLZ', 'BJ': 'BEN', 'BT': 'BTN', 'BO': 'BOL', 'BA': 'BIH', 'BW': 'BWA', 'BR': 'BRA',
  'BN': 'BRN', 'BG': 'BGR', 'BF': 'BFA', 'BI': 'BDI', 'CV': 'CPV', 'KH': 'KHM', 'CM': 'CMR', 'CA': 'CAN',
  'CF': 'CAF', 'TD': 'TCD', 'CL': 'CHL', 'CN': 'CHN', 'CO': 'COL', 'KM': 'COM', 'CG': 'COG', 'CD': 'COD',
  'CR': 'CRI', 'HR': 'HRV', 'CU': 'CUB', 'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'DJ': 'DJI', 'DM': 'DMA',
  'DO': 'DOM', 'EC': 'ECU', 'EG': 'EGY', 'SV': 'SLV', 'GQ': 'GNQ', 'ER': 'ERI', 'EE': 'EST', 'SZ': 'SWZ',
  'ET': 'ETH', 'FJ': 'FJI', 'FI': 'FIN', 'FR': 'FRA', 'GA': 'GAB', 'GM': 'GMB', 'GE': 'GEO', 'DE': 'DEU',
  'GH': 'GHA', 'GR': 'GRC', 'GD': 'GRD', 'GT': 'GTM', 'GN': 'GIN', 'GW': 'GNB', 'GY': 'GUY', 'HT': 'HTI',
  'HN': 'HND', 'HU': 'HUN', 'IS': 'ISL', 'IN': 'IND', 'ID': 'IDN', 'IR': 'IRN', 'IQ': 'IRQ', 'IE': 'IRL',
  'IL': 'ISR', 'IT': 'ITA', 'CI': 'CIV', 'JM': 'JAM', 'JP': 'JPN', 'JO': 'JOR', 'KZ': 'KAZ', 'KE': 'KEN',
  'KI': 'KIR', 'KP': 'PRK', 'KR': 'KOR', 'KW': 'KWT', 'KG': 'KGZ', 'LA': 'LAO', 'LV': 'LVA', 'LB': 'LBN',
  'LS': 'LSO', 'LR': 'LBR', 'LY': 'LBY', 'LI': 'LIE', 'LT': 'LTU', 'LU': 'LUX', 'MG': 'MDG', 'MW': 'MWI',
  'MY': 'MYS', 'MV': 'MDV', 'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL', 'MR': 'MRT', 'MU': 'MUS', 'MX': 'MEX',
  'FM': 'FSM', 'MD': 'MDA', 'MC': 'MCO', 'MN': 'MNG', 'ME': 'MNE', 'MA': 'MAR', 'MZ': 'MOZ', 'MM': 'MMR',
  'NA': 'NAM', 'NR': 'NRU', 'NP': 'NPL', 'NL': 'NLD', 'NZ': 'NZL', 'NI': 'NIC', 'NE': 'NER', 'NG': 'NGA',
  'MK': 'MKD', 'NO': 'NOR', 'OM': 'OMN', 'PK': 'PAK', 'PW': 'PLW', 'PA': 'PAN', 'PG': 'PNG', 'PY': 'PRY',
  'PE': 'PER', 'PH': 'PHL', 'PL': 'POL', 'PT': 'PRT', 'QA': 'QAT', 'RO': 'ROU', 'RU': 'RUS', 'RW': 'RWA',
  'KN': 'KNA', 'LC': 'LCA', 'VC': 'VCT', 'WS': 'WSM', 'SM': 'SMR', 'ST': 'STP', 'SA': 'SAU', 'SN': 'SEN',
  'RS': 'SRB', 'SC': 'SYC', 'SL': 'SLE', 'SG': 'SGP', 'SK': 'SVK', 'SI': 'SVN', 'SB': 'SLB', 'SO': 'SOM',
  'ZA': 'ZAF', 'SS': 'SSD', 'ES': 'ESP', 'LK': 'LKA', 'SD': 'SDN', 'SR': 'SUR', 'SE': 'SWE', 'CH': 'CHE',
  'SY': 'SYR', 'TW': 'TWN', 'TJ': 'TJK', 'TZ': 'TZA', 'TH': 'THA', 'TL': 'TLS', 'TG': 'TGO', 'TO': 'TON',
  'TT': 'TTO', 'TN': 'TUN', 'TR': 'TUR', 'TM': 'TKM', 'TV': 'TUV', 'UG': 'UGA', 'UA': 'UKR', 'AE': 'ARE',
  'GB': 'GBR', 'US': 'USA', 'UY': 'URY', 'UZ': 'UZB', 'VU': 'VUT', 'VA': 'VAT', 'VE': 'VEN', 'VN': 'VNM',
  'YE': 'YEM', 'ZM': 'ZMB', 'ZW': 'ZWE', 'XK': 'XKX', 'PS': 'PSE', 'EH': 'ESH', 'HK': 'HKG', 'MO': 'MAC'
};

// Reverse mapping from 3-letter to 2-letter codes
const iso3ToIso2: Record<string, string> = Object.fromEntries(
  Object.entries(iso2ToIso3).map(([k, v]) => [v, k])
);

export function MapboxGlobe({ 
  config, 
  markers = [], 
  highlightedCountryCodes = [],
  className = '',
  onMarkerClick,
  onCountryClick
}: MapboxGlobeProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(config?.zoom ?? MAP_DEFAULTS.zoom);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  // Convert 2-letter codes to 3-letter codes for Mapbox
  const highlightedIso3Codes = useMemo(() => 
    highlightedCountryCodes.map(code => iso2ToIso3[code] || code),
    [highlightedCountryCodes]
  );

  // Create supercluster index
  const supercluster = useMemo(() => {
    const index = new Supercluster<ClusterProperties>({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
    });

    const points: PointFeature[] = markers.map(marker => ({
      type: 'Feature',
      properties: {
        cluster: false,
        markerId: marker.id,
        markerLabel: marker.label,
        markerCount: marker.count,
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.position[1], marker.position[0]], // [lng, lat]
      },
    }));

    index.load(points);
    return index;
  }, [markers]);

  // Get clusters based on current zoom and bounds
  const clusters = useMemo(() => {
    if (!bounds) return [];
    return supercluster.getClusters(bounds, Math.floor(zoom));
  }, [supercluster, bounds, zoom]);

  // Fetch API key from edge function
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-key');
        if (error) {
          console.error('Failed to fetch Mapbox API key:', error);
          setError('Failed to fetch API key');
          return;
        }
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (e) {
        console.error('Error connecting to server:', e);
        setError('Failed to connect to server');
      }
    }
    fetchApiKey();
  }, []);

  const updateBoundsAndZoom = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const b = mapInstanceRef.current.getBounds();
    const z = mapInstanceRef.current.getZoom();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(z);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !apiKey) return;

    const mapConfig = { ...MAP_DEFAULTS, ...config };
    
    mapboxgl.accessToken = apiKey;
    
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [mapConfig.center[1], mapConfig.center[0]], // Mapbox uses [lng, lat]
      zoom: mapConfig.zoom,
      pitch: 0, // Set to 0 for better vertical centering
    });

    mapInstanceRef.current = map;

    // Set globe projection
    (map as any).setProjection('globe');

    // Add navigation controls
    map.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Disable scroll zoom for smoother experience initially
    map.scrollZoom.disable();
    
    // Enable on click
    map.on('click', () => {
      mapInstanceRef.current?.scrollZoom.enable();
    });

    map.on('style.load', () => {
      // Add atmosphere and fog effects for 3D globe
      (map as any).setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Add country boundaries source
      map.addSource('country-boundaries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // Add layer for countries without tips (gray overlay)
      // This layer will be filtered dynamically to only show countries NOT in the highlighted list
      map.addLayer({
        id: 'countries-no-tips',
        type: 'fill',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': '#6b7280', // Gray color
          'fill-opacity': 0.5
        },
        filter: [
          'all',
          ['==', ['get', 'disputed'], 'false'],
          ['any',
            ['==', 'all', ['get', 'worldview']],
            ['in', 'US', ['get', 'worldview']]
          ]
        ]
      });

      // Add invisible clickable layer for countries WITH tips
      map.addLayer({
        id: 'countries-clickable',
        type: 'fill',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0
        },
        filter: [
          'all',
          ['==', ['get', 'disputed'], 'false'],
          ['any',
            ['==', 'all', ['get', 'worldview']],
            ['in', 'US', ['get', 'worldview']]
          ]
        ]
      });

      // Add layer for country borders
      map.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#6b7280',
          'line-width': 0.5
        },
        filter: [
          'all',
          ['==', ['get', 'disputed'], 'false'],
          ['any',
            ['==', 'all', ['get', 'worldview']],
            ['in', 'US', ['get', 'worldview']]
          ]
        ]
      });

      // Change cursor on hover over clickable countries
      map.on('mouseenter', 'countries-clickable', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'countries-clickable', () => {
        map.getCanvas().style.cursor = '';
      });

      setMapLoaded(true);
      updateBoundsAndZoom();
    });

    mapInstanceRef.current.on('moveend', updateBoundsAndZoom);
    mapInstanceRef.current.on('zoomend', updateBoundsAndZoom);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [apiKey, config, updateBoundsAndZoom]);

  // Update country styling: gray overlay for countries WITHOUT tips, clickable for those WITH tips
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (highlightedIso3Codes.length > 0) {
      // Gray overlay only on countries that are NOT highlighted (no tips)
      map.setFilter('countries-no-tips', [
        'all',
        ['==', ['get', 'disputed'], 'false'],
        ['any',
          ['==', 'all', ['get', 'worldview']],
          ['in', 'US', ['get', 'worldview']]
        ],
        ['!', ['in', ['get', 'iso_3166_1_alpha_3'], ['literal', highlightedIso3Codes]]]
      ]);

      // Make only highlighted countries clickable
      map.setFilter('countries-clickable', [
        'all',
        ['==', ['get', 'disputed'], 'false'],
        ['any',
          ['==', 'all', ['get', 'worldview']],
          ['in', 'US', ['get', 'worldview']]
        ],
        ['in', ['get', 'iso_3166_1_alpha_3'], ['literal', highlightedIso3Codes]]
      ]);
    } else {
      // If no countries have tips, show all with gray overlay
      map.setFilter('countries-no-tips', [
        'all',
        ['==', ['get', 'disputed'], 'false'],
        ['any',
          ['==', 'all', ['get', 'worldview']],
          ['in', 'US', ['get', 'worldview']]
        ]
      ]);

      // No countries clickable
      map.setFilter('countries-clickable', ['==', ['get', 'iso_3166_1_alpha_3'], '']);
    }
  }, [highlightedIso3Codes, mapLoaded]);

  // Handle country clicks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !onCountryClick) return;

    const handleCountryClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (e.features && e.features.length > 0) {
        const iso3Code = e.features[0].properties?.iso_3166_1_alpha_3;
        if (iso3Code) {
          const iso2Code = iso3ToIso2[iso3Code] || iso3Code;
          onCountryClick(iso2Code);
        }
      }
    };

    map.on('click', 'countries-clickable', handleCountryClick);

    return () => {
      map.off('click', 'countries-clickable', handleCountryClick);
    };
  }, [mapLoaded, onCountryClick]);

  // Update markers when clusters change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add cluster/individual markers
    clusters.forEach((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const props = cluster.properties;

      const el = document.createElement('div');
      el.className = 'mapbox-custom-marker';

      if (props.cluster) {
        // Cluster marker
        const count = props.point_count || 0;
        el.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg border-2 border-background transition-transform hover:scale-110">
              ${count}
            </div>
          </div>
        `;
        
        el.addEventListener('click', () => {
          // Zoom into the cluster
          if (mapInstanceRef.current && props.cluster_id !== undefined) {
            const expansionZoom = Math.min(
              supercluster.getClusterExpansionZoom(props.cluster_id),
              16
            );
            mapInstanceRef.current.flyTo({
              center: [lng, lat],
              zoom: expansionZoom
            });
          }
        });
      } else {
        // Individual marker
        const markerId = props.markerId!;
        const marker = markers.find(m => m.id === markerId);
        
        el.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm shadow-lg border-2 border-background transition-transform hover:scale-110">
              ${props.markerCount ?? ''}
            </div>
            ${props.markerLabel ? `<span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium bg-card px-2 py-0.5 rounded shadow whitespace-nowrap">${props.markerLabel}</span>` : ''}
          </div>
        `;
        
        el.addEventListener('click', () => {
          marker?.onClick?.();
          onMarkerClick?.(markerId);
        });
      }

      const mapboxMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapInstanceRef.current!);
      
      markersRef.current.push(mapboxMarker);
    });
  }, [clusters, markers, onMarkerClick, mapLoaded, supercluster]);

  // Handle config changes (fly to new location)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !config) return;
    
    const mapConfig = { ...MAP_DEFAULTS, ...config };
    mapInstanceRef.current.flyTo({
      center: [mapConfig.center[1], mapConfig.center[0]],
      zoom: mapConfig.zoom,
      duration: 1500
    });
  }, [config, mapLoaded]);

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted ${className}`}>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
}
