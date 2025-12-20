import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import Supercluster from 'supercluster';
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
  const [zoom, setZoom] = useState(config?.zoom ?? MAP_DEFAULTS.zoom);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

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

  const updateBoundsAndZoom = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const b = mapInstanceRef.current.getBounds();
    const z = mapInstanceRef.current.getZoom();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(z);
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
      updateBoundsAndZoom();
    });

    mapInstanceRef.current.on('moveend', updateBoundsAndZoom);
    mapInstanceRef.current.on('zoomend', updateBoundsAndZoom);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [apiKey, config, updateBoundsAndZoom]);

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
      el.className = 'tomtom-custom-marker';

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
            mapInstanceRef.current.setCenter([lng, lat]);
            mapInstanceRef.current.setZoom(expansionZoom);
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

      const ttMarker = new tt.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapInstanceRef.current!);
      
      markersRef.current.push(ttMarker);
    });
  }, [clusters, markers, onMarkerClick, mapLoaded, supercluster]);

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
