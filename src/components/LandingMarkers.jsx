import React, { useCallback } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { latLonToMapCoordinates } from '../utils/marsCoordinates';
import { getMissionColor } from '../utils/missionColors';

/**
 * Returns marker colour based on mission status and agency.
 * Operational missions get cyan.
 * Successful NASA missions get green.
 * ISRO would get saffron (not on surface — Mangalyaan was an orbiter, excluded here).
 */
/**
 * Creates a custom SVG circular marker icon.
 */
function createMarkerIcon(mission, isSelected, overlapOffset) {
  const color = getMissionColor(mission);
  const isSurfaceEvent = Boolean(mission.surfaceEvent);
  const size = 36;
  const [offsetX, offsetY] = overlapOffset;
  const outerRing = isSelected ? `<circle cx="18" cy="18" r="9" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.9"/>` : '';
  const glow = isSelected ? ' style="filter: drop-shadow(0 0 4px currentColor)"' : '';

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36"${glow}>
      <g transform="translate(${offsetX} ${offsetY})">
      ${outerRing}
      ${isSurfaceEvent
        ? `<rect x="13.5" y="13.5" width="9" height="9" rx="1" fill="${color}" stroke="#0f1116" stroke-width="1.5" transform="rotate(45 18 18)"/>`
        : `<circle cx="18" cy="18" r="5" fill="${color}" stroke="#0f1116" stroke-width="1.5"/>`}
      </g>
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
  const surfaceType = ['lander', 'lander-rover', 'crewed-lander', 'rover', 'helicopter'].includes(
    String(mission?.type ?? mission?.category ?? '').toLowerCase()
  );
  const confirmedStatus = ['successful', 'operational', 'completed'].includes(mission?.status);
  return surfaceType
    && confirmedStatus
    && Number.isFinite(mission?.latitude)
    && Number.isFinite(mission?.longitude)
    && mission.latitude >= -90
    && mission.latitude <= 90;
}

export function isVerifiedSurfaceEvent(mission) {
  const event = mission?.surfaceEvent;
  return Boolean(event)
    && ['controlled-impact', 'crash-site'].includes(event.type)
    && Number.isFinite(event.latitude)
    && Number.isFinite(event.longitude)
    && event.latitude >= -90
    && event.latitude <= 90;
}

export function isDisplayableSurfaceMarker(mission) {
  return isConfirmedSurfaceLanding(mission) || isVerifiedSurfaceEvent(mission);
}

function getMarkerCoordinates(mission) {
  if (isVerifiedSurfaceEvent(mission)) {
    return [mission.surfaceEvent.latitude, mission.surfaceEvent.longitude];
  }
  return [mission.latitude, mission.longitude];
}

function getOverlapOffsets(missions) {
  const offsets = new Map();
  const groups = new Map();
  const offsetPattern = [[0, 0], [7, -7], [-7, 7], [7, 7], [-7, -7]];

  missions.forEach((mission) => {
    const [latitude, longitude] = getMarkerCoordinates(mission);
    const [y, x] = latLonToMapCoordinates(latitude, longitude);
    // Group nearby sites only for presentation. The marker's Leaflet position
    // continues to use the source coordinate exactly.
    const groupKey = `${Math.round(x / 8)}:${Math.round(y / 8)}`;
    const group = groups.get(groupKey) ?? [];
    group.push(mission);
    groups.set(groupKey, group);
  });

  groups.forEach((group) => {
    group.sort((left, right) => left.id.localeCompare(right.id));
    group.forEach((mission, index) => offsets.set(mission.id, offsetPattern[index] ?? [0, 0]));
  });
  return offsets;
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

  const displayable = missions.filter(isDisplayableSurfaceMarker);
  const overlapOffsets = getOverlapOffsets(displayable);

  return (
    <>
      {displayable.map((mission) => {
        const [latitude, longitude] = getMarkerCoordinates(mission);
        const position = latLonToMapCoordinates(latitude, longitude);
        const isSelected = mission.id === selectedId;
        const icon = createMarkerIcon(mission, isSelected, overlapOffsets.get(mission.id) ?? [0, 0]);
        const missionType = mission.surfaceEvent?.label ?? mission.type ?? mission.category ?? 'surface mission';

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
                {(mission.surfaceEvent?.label || mission.landingSite) && (
                  <div style={{ color: '#000000', fontSize: '10px' }}>{mission.surfaceEvent?.label || mission.landingSite}</div>
                )}
              </div>
            </Tooltip>

            {/* Click popup */}
            <Popup>
              <div>
                <div className="map-popup-name">{mission.name}</div>
                <div className={`map-popup-agency ${mission.agency.toLowerCase()}`} style={{ color: getMissionColor(mission) }}>
                  {mission.agency} · {missionType}
                </div>
                {(mission.surfaceEvent?.label || mission.landingSite) && (
                  <div className="map-popup-site">📍 {mission.surfaceEvent?.label || mission.landingSite}</div>
                )}
                {mission.landingDate && !mission.surfaceEvent && (
                  <div style={{ fontSize: '10px', color: '#B8A69A', marginBottom: '4px' }}>
                    Landed: {mission.landingDate}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#B8A69A', marginBottom: '6px' }}>
                  {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                </div>
                {mission.surfaceEvent && (
                  <div style={{ fontSize: '10px', color: '#B8A69A' }}>{mission.surfaceEvent.coordinatePrecision}</div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
