import React from 'react';
import './MissionDetails.css';
import { getMissionColor } from '../utils/missionColors';

/**
 * MissionDetails
 *
 * Displays detailed information about a selected Mars surface mission.
 *
 * Props:
 *   mission {Object|null}  A single mission object from surfaceMissions.json,
 *                          or null to show the empty/placeholder state.
 *
 * Integration contract (Person 3):
 *   <MissionDetails mission={selectedMission} />
 *
 * The component is intentionally stateless — all state management is owned by
 * the parent application (Person 3). This component only renders what it receives.
 */
export default function MissionDetails({ mission }) {
  if (!mission) {
    return (
      <div className="mission-details-panel">
        <div className="mission-details-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#8bb8d4" strokeWidth="2" />
            <circle cx="24" cy="24" r="12" stroke="#8bb8d4" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="4" y1="24" x2="44" y2="24" stroke="#8bb8d4" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
          <span>Select a landing site marker to view mission details</span>
        </div>
      </div>
    );
  }

  const missionType = mission.type ?? mission.category;
  const typePillClass = `mission-type-pill type-pill-${missionType?.replace(/[^a-z-]/g, '') ?? 'lander'}`;
  const statusClass   = `status-pill status-${mission.status ?? 'completed'}`;

  // Mangalyaan-specific highlight (if this dataset were extended to orbiters)
  const isMangalyaan = mission.id === 'mars-orbiter-mission';
  const formatCoordinates = () => {
    if (!Number.isFinite(mission.latitude) || !Number.isFinite(mission.longitude)) return null;
    const signedLongitude = ((mission.longitude + 180) % 360 + 360) % 360 - 180;
    const latitudeLabel = `${Math.abs(mission.latitude).toFixed(4)}°${mission.latitude < 0 ? 'S' : 'N'}`;
    const longitudeLabel = `${Math.abs(signedLongitude).toFixed(4)}°${signedLongitude < 0 ? 'W' : 'E'}`;
    return `${latitudeLabel}, ${longitudeLabel}`;
  };
  const coordinates = formatCoordinates();
  const surfaceEventCoordinates = mission.surfaceEvent
    ? `${Math.abs(mission.surfaceEvent.latitude).toFixed(4)}°${mission.surfaceEvent.latitude < 0 ? 'S' : 'N'}, ${Math.abs(mission.surfaceEvent.longitude).toFixed(4)}°${mission.surfaceEvent.longitude < 0 ? 'W' : 'E'}`
    : null;

  return (
    <div className="mission-details-panel">
      {/* Panel header */}
      <div className="mission-details-header">
        <span className="mission-details-title">Mission Profile</span>
        <span className={`agency-badge ${mission.agency?.toLowerCase() ?? 'nasa'}`} style={{ color: getMissionColor(mission), borderColor: getMissionColor(mission), backgroundColor: `${getMissionColor(mission)}14` }}>
          {mission.agency}
        </span>
      </div>

      {/* Body */}
      <div className="mission-details-body">
        <div className="mission-name">{mission.name}</div>

        {/* Type + status pills */}
        <div className="mission-type-row">
          {missionType && (
            <span className={typePillClass}>{missionType.replace(/-/g, ' ')}</span>
          )}
          {mission.status && (
            <span className={statusClass}>{mission.status.replace(/-/g, ' ')}</span>
          )}
          {mission.crewStatus && (
            <span className={`crew-status-badge crew-${mission.crewStatus.toLowerCase()}`}>{mission.crewStatus}</span>
          )}
        </div>

        {mission.launchYear && <div className="mission-year">Launch year · {mission.launchYear}</div>}

        {mission.surfaceCategory && <div className="mission-year">Surface category · {mission.surfaceCategory}</div>}

        {/* Key facts grid */}
        <div className="mission-info-grid">
          {mission.landingSite && (
            <div className="info-cell">
              <div className="info-cell-label">Landing Site</div>
              <div className="info-cell-value">📍 {mission.landingSite}</div>
            </div>
          )}
          {coordinates && (
            <div className="info-cell">
              <div className="info-cell-label">Coordinates</div>
              <div className="info-cell-value coord">{coordinates}</div>
            </div>
          )}
          {mission.surfaceEvent && (
            <div className="info-cell mission-pair-cell">
              <div className="info-cell-label">Surface Event</div>
              <div className="info-cell-value">{mission.surfaceEvent.label} · {surfaceEventCoordinates}</div>
              <div className="info-cell-label">{mission.surfaceEvent.coordinatePrecision}</div>
            </div>
          )}
          {mission.launchDate && (
            <div className="info-cell">
              <div className="info-cell-label">Launch Date</div>
              <div className="info-cell-value">{mission.launchDate}</div>
            </div>
          )}
          {mission.country && (
            <div className="info-cell">
              <div className="info-cell-label">Country</div>
              <div className="info-cell-value">{mission.country}</div>
            </div>
          )}
          {mission.endDate && (
            <div className="info-cell">
              <div className="info-cell-label">Mission End</div>
              <div className="info-cell-value">{mission.endDate}</div>
            </div>
          )}
          {mission.arrivalDate && (
            <div className="info-cell">
              <div className="info-cell-label">Arrival Date</div>
              <div className="info-cell-value">{mission.arrivalDate}</div>
            </div>
          )}
          {mission.landingDate && (
            <div className="info-cell">
              <div className="info-cell-label">Landing Date</div>
              <div className="info-cell-value">{mission.landingDate}</div>
            </div>
          )}
          {mission.twinMission && (
            <div className="info-cell mission-pair-cell">
              <div className="info-cell-label">Mission Pair</div>
              <div className="info-cell-value">{mission.twinMission}</div>
            </div>
          )}
        </div>

        {/* Scientific objective */}
        {mission.objective && (
          <>
            <div className="section-label">Scientific Objective</div>
            <div className="mission-objective">{mission.objective}</div>
          </>
        )}
        {mission.outcome && (
          <>
            <div className="section-label">Mission Outcome</div>
            <div className="mission-description">{mission.outcome}</div>
          </>
        )}
        {mission.scientificAchievements?.length > 0 && (
          <>
            <div className="section-label">Scientific Achievements</div>
            <div className="mission-achievement-list">{mission.scientificAchievements.map((item) => <article className="mission-achievement" key={item.title}><strong>{item.title}</strong><span>{item.instrument}</span><p>{item.observation}</p><small>{item.significance}</small></article>)}</div>
          </>
        )}
        {mission.achievements?.length > 0 && (
          <>
            <div className="section-label">Scientific Achievements</div>
            <ul className="mission-achievements">{mission.achievements.map((item) => <li key={item}>{item}</li>)}</ul>
          </>
        )}
        {mission.missionTimeline?.length > 0 && <><div className="section-label">Mission Timeline</div><ul className="mission-achievements">{mission.missionTimeline.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {mission.spacecraftComponents?.length > 0 && <><div className="section-label">Spacecraft Components</div><div className="mission-description">{mission.spacecraftComponents.join(' · ')}</div></>}

        {/* Description */}
        {mission.description && (
          <>
            <div className="section-label">Mission Summary</div>
            <div className="mission-description">{mission.description}</div>
          </>
        )}

        {/* Mangalyaan special highlight */}
        {isMangalyaan && (
          <div className="mangalyaan-highlight">
            <div className="mangalyaan-badge">India's Historic Mars Mission</div>
            <div className="mangalyaan-fact">
              <strong>First attempt success:</strong> India is the only nation to reach Mars orbit on its maiden attempt.
            </div>
            <div className="mangalyaan-fact">
              <strong>Development:</strong> Built in just 15 months by ISRO.
            </div>
            <div className="mangalyaan-fact">
              <strong>Significance:</strong> Made India the 4th space agency and first Asian nation to successfully orbit Mars.
            </div>
          </div>
        )}

        {/* Source */}
        {mission.source && (
          <a
            href={mission.source}
            target="_blank"
            rel="noopener noreferrer"
            className="mission-source"
          >
            ↗ Official Mission Source
          </a>
        )}
        {mission.sourceUrl && (
          <a href={mission.sourceUrl} target="_blank" rel="noopener noreferrer" className="mission-source">↗ Official mission source</a>
        )}
        {mission.image && mission.imageNasaId && <a className="mission-source" href={`https://images.nasa.gov/details/${mission.imageNasaId}`} target="_blank" rel="noopener noreferrer">↗ NASA image record · {mission.imageNasaId}</a>}
      </div>
    </div>
  );
}
