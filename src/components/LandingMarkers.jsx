import React, { useCallback } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { latLonToMapCoordinates } from '../utils/marsCoordinates';

/**
 * Returns marker colour based on mission status and agency.
 * Operational missions get cyan.
 * Successful NASA missions get green.
 * ISRO would get saffron (not on surface — Mangalyaan was an orbiter, excluded here).
 */
function getMarkerColor(mission) {
  if (!mission) return '#39FF14';
  if (mission.status === 'operational') return '#00D4FF';
  if (mission.agency === 'ISRO') return '#FF9933';
  return '#39FF14';
}

/**
 * Creates a custom SVG circular marker icon.
 */
function createMarkerIcon(mission, isSelected) {
  const color = getMarkerColor(mission);
  const size = isSelected ? 20 : 14;
  const outerRing = isSelected ? '<circle cx="10" cy="10" r="9" fill="none" stroke="#FF9933" stroke-width="1.5" opacity="0.8"/>' : '';
  const glow = isSelected ? ' style="filter: drop-shadow(0 0 4px rgba(255,153,51,.72))"' : '';

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 14}" height="${isSelected ? 20 : 14}" viewBox="0 0 20 20"${glow}>
      ${outerRing}
      <circle cx="10" cy="10" r="5" fill="${color}" stroke="#000" stroke-width="1.5"/>
    </svg>
  `;

  return L.divIcon({
    html: svgString,
    className: 'mars-landing-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

/**
 * LandingMarkers
 *
 * Props:
 *   missions        {Array}    Surface mission objects (from surfaceMissions.json)
 *   onSelectMission {Function} Callback(missionObject) on marker click
 *   selectedId      {string}   Currently-selected mission ID (optional — for visual highlight)
 *
 * Only renders successful or operational surface missions with a recorded
 * landing date and finite coordinates. Failed attempts and orbital missions
 * are excluded even when they have an estimated or attempted location.
 */
export function isConfirmedSurfaceLanding(mission) {
  const surfaceType = ['lander', 'lander-rover', 'rover', 'helicopter'].includes(
    String(mission?.type ?? mission?.category ?? '').toLowerCase()
  );
  const confirmedStatus = ['successful', 'operational', 'completed'].includes(mission?.status);
  return surfaceType
    && confirmedStatus
    && Boolean(mission?.landingDate)
    && Number.isFinite(mission?.latitude)
    && Number.isFinite(mission?.longitude)
    && mission.latitude >= -90
    && mission.latitude <= 90;
}

export default function LandingMarkers({ missions = [], onSelectMission, selectedId }) {
  const handleClick = useCallback(
    (mission) => {
      if (typeof onSelectMission === 'function') {
        onSelectMission(mission);
      }
    },
    [onSelectMission]
  );

  const displayable = missions.filter(isConfirmedSurfaceLanding);

  return (
    <>
      {displayable.map((mission) => {
        const position = latLonToMapCoordinates(mission.latitude, mission.longitude);
        const isSelected = mission.id === selectedId;
        const icon = createMarkerIcon(mission, isSelected);
        const missionType = mission.type ?? mission.category ?? 'surface mission';

        return (
          <Marker
            key={mission.id}
            position={position}
            icon={icon}
            eventHandlers={{
              click: () => handleClick(mission),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            {/* Hover tooltip */}
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div style={{ fontFamily: 'Inter, Aptos, Segoe UI, sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>
                  {mission.name}
                </div>
                <div style={{ color: '#000000', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {mission.agency}
                </div>
                {mission.landingSite && (
                  <div style={{ color: '#000000', fontSize: '10px' }}>{mission.landingSite}</div>
                )}
              </div>
            </Tooltip>

            {/* Click popup */}
            <Popup>
              <div>
                <div className="map-popup-name">{mission.name}</div>
                <div className={`map-popup-agency ${mission.agency.toLowerCase()}`}>
                  {mission.agency} · {missionType}
                </div>
                {mission.landingSite && (
                  <div className="map-popup-site">📍 {mission.landingSite}</div>
                )}
                {mission.landingDate && (
                  <div style={{ fontSize: '10px', color: '#B8A69A', marginBottom: '4px' }}>
                    Landed: {mission.landingDate}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#B8A69A', marginBottom: '6px' }}>
                  {mission.latitude?.toFixed(4)}°, {mission.longitude?.toFixed(4)}°
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
