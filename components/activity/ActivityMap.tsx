'use client';

import { useEffect, useRef } from 'react';
import polyline from 'polyline-encoded';

interface ActivityMapProps {
  polyline: string;
}

export function ActivityMap({ polyline: polylineString }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Clean up previous map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Decode polyline
      const coordinates = polyline.decode(polylineString);

      // Create map
      const map = L.map(mapRef.current!).setView(coordinates[0] as [number, number], 13);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add polyline to map
      const routeLine = L.polyline(coordinates as [number, number][], {
        color: '#FF6B35',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Add start marker
      L.marker(coordinates[0] as [number, number], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        }),
      }).addTo(map);

      // Add end marker
      L.marker(coordinates[coordinates.length - 1] as [number, number], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #F44336; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        }),
      }).addTo(map);

      // Fit bounds to show entire route
      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [polylineString]);

  return (
    <>
      <style jsx global>{`
        @import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
    </>
  );
}
