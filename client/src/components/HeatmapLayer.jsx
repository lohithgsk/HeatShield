import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * HeatmapLayer component using leaflet.heat canvas rendering
 * Supports dynamic real-time telemetry updates and historical replay simulations
 */
export default function HeatmapLayer({ points, options }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initHeatmap() {
      if (typeof window !== 'undefined' && !window.L) {
        window.L = L;
      }
      try {
        await import('leaflet.heat');
      } catch (err) {
        console.error('Failed to import leaflet.heat:', err);
        return;
      }

      if (!isMounted || !map) return;

      // Tear down previous layer
      if (heatLayerRef.current) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch {
          // ignore
        }
        heatLayerRef.current = null;
      }

      if (!points || points.length === 0) return;

      try {
        const defaultOptions = {
          radius: options?.radius ?? 28,
          blur: options?.blur ?? 20,
          maxZoom: options?.maxZoom ?? 17,
          max: options?.max ?? 1.0,
          minOpacity: options?.minOpacity ?? 0.35,
          gradient: options?.gradient ?? {
            0.15: '#4E8064',
            0.35: '#D1A33A',
            0.55: '#D58A3C',
            0.72: '#CC653E',
            0.88: '#B4473D',
            1.00: '#B4473D'
          }
        };

        const layer = L.heatLayer(points, defaultOptions);
        layer.addTo(map);
        heatLayerRef.current = layer;
      } catch (err) {
        console.error('Error instantiating heatLayer:', err);
      }
    }

    initHeatmap();

    return () => {
      isMounted = false;
      if (heatLayerRef.current && map) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch {
          // ignore
        }
        heatLayerRef.current = null;
      }
    };
  }, [
    map,
    points,
    options?.radius,
    options?.blur,
    options?.max,
    options?.minOpacity
  ]);

  return null;
}
