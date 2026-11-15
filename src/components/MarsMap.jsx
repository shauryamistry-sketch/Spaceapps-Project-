import React, { useState, useCallback } from 'react';
import { MapContainer, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MarsMap.css';

import { MAP_WIDTH, MAP_HEIGHT, getMapBounds, getInitialCenter } from '../utils/marsCoordinates';
import LandingMarkers from './LandingMarkers';

// Image URL — uses the original mars-base_4k.jpg copied to public/images/
const MARS_IMAGE_URL = `${import.meta.env.BASE_URL}images/mars-base_4k.jpg`;

/**
 * MarsMap
 *
 * Props:
 *   missions        {Array}    Array of surface mission objects from surfaceMissions.json
 *   onSelectMission {Function} Callback(missionObject) called when a marker is clicked
 *
 * Integration contract (Person 3):
 *   <MarsMap missions={surfaceMissions} onSelectMission={(m) => setSelected(m)} />
 */
export default function MarsMap({ missions = [], onSelectMission, selectedId }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const bounds = getMapBounds();
  // Initial center: equator / prime meridian in CRS.Simple coords
  const center = getInitialCenter();

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => setImageError(true), []);

  // Verify image exists before rendering Leaflet
  React.useEffect(() => {
    const img = new Image();
    img.onload  = handleImageLoad;
    img.onerror = handleImageError;
    img.src = MARS_IMAGE_URL;
  }, [handleImageLoad, handleImageError]);

  if (imageError) {
    return (
      <div className="mars-map-wrapper">
        <div className="map-error">
          ⚠ Mars surface image could not be loaded ({MARS_IMAGE_URL})
        </div>
      </div>
    );
  }

  return (
    <div className="mars-map-wrapper">
      {/* Header bar */}
      <div className="map-header">
        <div className="map-header-dot" />
        <span className="map-header-title">Mars Surface Map — Equirectangular Projection (assumed)</span>
      </div>

      {/* Leaflet map */}
      <div className="mars-map-container">
        {!imageLoaded && (
          <div className="map-loading">Loading Mars surface…</div>
        )}
        {imageLoaded && (
          <MapContainer
            crs={L.CRS.Simple}
            center={center}
            zoom={1}
            minZoom={0}
            maxZoom={5}
            style={{ width: '100%', height: '100%' }}
            maxBounds={[
              [-MAP_HEIGHT * 0.1, -MAP_WIDTH * 0.1],
              [MAP_HEIGHT * 1.1, MAP_WIDTH * 1.1],
            ]}
            maxBoundsViscosity={0.85}
            scrollWheelZoom={true}
            zoomSnap={0.5}
            zoomDelta={0.5}
          >
            <ImageOverlay
              url={MARS_IMAGE_URL}
              bounds={bounds}
              attribution='Mars surface image — NASA/USGS'
            />

            <LandingMarkers
              missions={missions}
              onSelectMission={onSelectMission}
              selectedId={selectedId}
            />
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-item" style={{ color: '#39ff14' }}>
          <div className="legend-dot" />
          <span>NASA — Successful</span>
        </div>
        <div className="map-legend-item" style={{ color: '#ff9933' }}>
          <div className="legend-dot" />
          <span>ISRO — Successful</span>
        </div>
        <div className="map-legend-item" style={{ color: '#00d4ff' }}>
          <div className="legend-dot" />
          <span>Operational</span>
        </div>
      </div>
    </div>
  );
}
