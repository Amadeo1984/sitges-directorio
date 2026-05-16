'use client';

import { useEffect, useRef } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  url: string;
  featured?: boolean;
}

interface MapViewProps {
  markers: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export function MapView({ markers, center, zoom = 13, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    let map: MapLibreMap | null = null;
    let disposed = false;

    (async () => {
      const maplibre = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (disposed || !containerRef.current) return;

      const c = center ?? { lat: 41.2362, lng: 1.8138 }; // Sitges centro
      map = new maplibre.Map({
        container: containerRef.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [c.lng, c.lat],
        zoom,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.addControl(new maplibre.NavigationControl({}), 'top-right');

      map.on('load', () => {
        if (!map || disposed) return;
        for (const m of markers) {
          const el = document.createElement('a');
          el.href = m.url;
          el.title = m.name;
          el.className = 'block h-7 w-7 rounded-full border-2 border-white shadow ' +
            (m.featured ? 'bg-amber-500' : 'bg-brand-600');
          new maplibre.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .setPopup(new maplibre.Popup({ offset: 16 }).setHTML(
              `<a href="${m.url}" class="font-medium">${m.name}</a>`
            ))
            .addTo(map);
        }
      });
    })();

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [markers, center, zoom]);

  return <div ref={containerRef} className={className ?? 'h-[60vh] w-full'} />;
}
