import { ReactNode } from 'react';

// Map provider abstraction - currently using Mapbox GL
// Address search uses TomTom Search API via search-address edge function

export interface MapConfig {
  center: [number, number];
  zoom: number;
  style?: string;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  label?: string;
  count?: number;
  onClick?: () => void;
}

interface MapProviderProps {
  children: ReactNode;
}

// Provider for any map-level context if needed
export function MapProvider({ children }: MapProviderProps) {
  return <>{children}</>;
}

export const MAP_DEFAULTS: MapConfig = {
  center: [20, 0],
  zoom: 2,
};
