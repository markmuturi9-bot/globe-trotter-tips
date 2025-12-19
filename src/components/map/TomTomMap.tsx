import { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import type { MapConfig, MapMarker } from './MapProvider';
import { MAP_DEFAULTS } from './MapProvider';
import { supabase } from '@/integrations/supabase/client';

interface TomTomMapProps {
  config?: Partial<MapConfig>;
  markers?: MapMarker[];
  highlightedCountryCodes?: string[];
  className?: string;
  onMarkerClick?: (markerId: string) => void;
}

export function TomTomMap({ 
  config, 
  markers = [], 
  highlightedCountryCodes = [],
  className = '',
  onMarkerClick 
}: TomTomMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<tt.Map | null>(null);
  const markersRef = useRef<tt.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch API key from edge function
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const { data, error } = await supabase.functions.invoke('get-tomtom-key');
        if (error) {
          setError('Failed to fetch API key');
          return;
        }
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (e) {
        setError('Failed to connect to server');
      }
    }
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !apiKey) return;

    const mapConfig = { ...MAP_DEFAULTS, ...config };
    
    mapInstanceRef.current = tt.map({
      key: apiKey,
      container: mapRef.current,
      center: [mapConfig.center[1], mapConfig.center[0]], // TomTom uses [lng, lat]
      zoom: mapConfig.zoom,
    });

    mapInstanceRef.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [apiKey]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement('div');
      el.className = 'tomtom-custom-marker';
      el.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm shadow-lg border-2 border-background transition-transform hover:scale-110">
            ${marker.count ?? ''}
          </div>
          ${marker.label ? `<span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium bg-card px-2 py-0.5 rounded shadow whitespace-nowrap">${marker.label}</span>` : ''}
        </div>
      `;
      
      el.addEventListener('click', () => {
        marker.onClick?.();
        onMarkerClick?.(marker.id);
      });

      const ttMarker = new tt.Marker({ element: el })
        .setLngLat([marker.position[1], marker.position[0]]) // TomTom uses [lng, lat]
        .addTo(mapInstanceRef.current!);
      
      markersRef.current.push(ttMarker);
    });
  }, [markers, onMarkerClick, mapLoaded]);

  // Country highlighting is handled via markers with country codes
  // TomTom doesn't easily support vector tile filtering like Mapbox

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
