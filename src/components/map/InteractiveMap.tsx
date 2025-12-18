import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapConfig, MapMarker } from './MapProvider';
import { MAP_DEFAULTS } from './MapProvider';

interface InteractiveMapProps {
  config?: Partial<MapConfig>;
  markers?: MapMarker[];
  className?: string;
  onMarkerClick?: (markerId: string) => void;
}

// Fix for default marker icons in Leaflet with bundlers
const defaultIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm shadow-lg border-2 border-background"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export function InteractiveMap({ 
  config, 
  markers = [], 
  className = '',
  onMarkerClick 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const mapConfig = { ...MAP_DEFAULTS, ...config };
    
    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current, {
      center: mapConfig.center,
      zoom: mapConfig.zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Create markers layer
    markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm shadow-lg border-2 border-background transition-transform hover:scale-110">
              ${marker.count ?? ''}
            </div>
            ${marker.label ? `<span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium bg-card px-2 py-0.5 rounded shadow whitespace-nowrap">${marker.label}</span>` : ''}
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 20],
      });

      const leafletMarker = L.marker(marker.position, { icon })
        .addTo(markersLayerRef.current!);
      
      if (marker.onClick || onMarkerClick) {
        leafletMarker.on('click', () => {
          marker.onClick?.();
          onMarkerClick?.(marker.id);
        });
      }
    });
  }, [markers, onMarkerClick]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
}
