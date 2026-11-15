import React, { useState } from 'react';
import './App.css';

import MarsMap from './components/MarsMap';
import MissionDetails from './components/MissionDetails';
import { isConfirmedSurfaceLanding } from './components/LandingMarkers';

// Data imports
import surfaceMissions from './data/surfaceMissions.json';
import marsMissionCatalog from './data/marsMissionCatalog.json';
import moonMissions from './data/moonMissions.json';
import { MISSION_IMAGES } from './data/missionImages';
import { MISSION_COLORS } from './utils/missionColors';

const publicAsset = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`;
};

/**
 * App.jsx — Person 2 integration demo
 *
 * This file is intentionally minimal. It demonstrates that:
 *   1. MarsMap accepts missions + onSelectMission props.
 *   2. MissionDetails accepts a mission prop.
 *   3. No global state is managed inside either child component.
 *
 * Person 3 should replace this App.jsx with their own layout and
 * simply import { MarsMap, MissionDetails } and the JSON data files.
 *
 * Re-export of integration contract:
 *   <MarsMap missions={surfaceMissions} onSelectMission={setSelectedMission} />
 *   <MissionDetails mission={selectedMission} />
 */

export default function App() {
  const [activePlanet, setActivePlanet] = useState(() => (
    new URLSearchParams(window.location.search).get('planet') === 'moon' ? 'moon' : 'mars'
  ));
  const [selectedMission, setSelectedMission] = useState(null);
  const [crewFilter, setCrewFilter] = useState('All');
  const [agencyFilter, setAgencyFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('All');

  const isMoon = activePlanet === 'moon';
  const moonSurfaceMissions = moonMissions.filter((mission) => mission.surfaceCatalog !== false && (mission.surfaceEvent || ['lander', 'lander-rover', 'crewed-lander', 'rover', 'helicopter'].includes(mission.type)));
  const activeMissions = isMoon ? moonSurfaceMissions : marsMissionCatalog.missions;
  const filteredMissions = isMoon
    ? activeMissions.filter((mission) => (
      (crewFilter === 'All' || mission.crewStatus === crewFilter)
      && (agencyFilter === 'All' || mission.agency === agencyFilter)
      && (surfaceFilter === 'All' || (surfaceFilter === 'Successful landings' && !mission.surfaceEvent && mission.status === 'successful') || (surfaceFilter === 'Failed landing attempts' && mission.surfaceEvent?.type === 'crash-site') || (surfaceFilter === 'Impact events' && mission.surfaceEvent?.type === 'controlled-impact'))
    ))
    : activeMissions;
  const landableMissions = (isMoon ? filteredMissions : surfaceMissions).filter(isConfirmedSurfaceLanding);
  const featuredDiscoveries = isMoon ? filteredMissions : landableMissions;
  const totalNASA = featuredDiscoveries.filter((mission) => mission.agency === 'NASA').length;
  const totalISRO = activeMissions.filter((mission) => mission.agency === 'ISRO').length;
  const planetName = isMoon ? 'Moon' : 'Mars';
  const switchPlanet = (planet) => {
    setActivePlanet(planet);
    setSelectedMission(null);
    window.history.replaceState({}, '', `${window.location.pathname}?planet=${planet}`);
  };
  const selectedImage = MISSION_IMAGES[selectedMission?.id]
    || selectedMission?.image
    || (isMoon ? '/images/moon-map.jpg' : '/images/mars-base_4k.jpg');

  return (
    <div className={`app-shell planet-${activePlanet}`} id="top" style={{ '--mission-nasa-color': MISSION_COLORS.nasa, '--mission-isro-color': MISSION_COLORS.isro }}>
      <header className="app-header">
        <a className="app-header-logo" href="#top" aria-label="Space Mission Explorer home">
          <span className="logo-mars" aria-hidden="true"><span /></span>
          <span className="logo-copy">
            <span className="logo-text">Space Mission Explorer</span>
            <span className="logo-kicker">Footprints on {planetName} · Mission Control</span>
          </span>
        </a>
        <nav className="header-nav" aria-label="Page sections">
          <a href={`${import.meta.env.BASE_URL}index.html?planet=${activePlanet}`}>← Back to the globes</a>
          <a href="#surface-map">Surface map</a>
          <a href="#mission-image">Mission image</a>
          <a href="#discoveries">Discoveries</a>
        </nav>
        <div className="planet-switch" role="group" aria-label="Choose planetary explorer">
          <button className={!isMoon ? 'is-active' : ''} type="button" onClick={() => switchPlanet('mars')}>Mars</button>
          <button className={isMoon ? 'is-active' : ''} type="button" onClick={() => switchPlanet('moon')}>Moon</button>
        </div>
        <div className="app-header-stats" aria-label="Mission statistics">
          <div className="stat-chip nasa"><span className="stat-num">{totalNASA}</span><span className="stat-label">NASA</span></div>
          {isMoon && <div className="stat-chip isro"><span className="stat-num">{totalISRO}</span><span className="stat-label">ISRO</span></div>}
          <div className="stat-chip surface"><span className="stat-num">{landableMissions.length}</span><span className="stat-label">Landings</span></div>
        </div>
      </header>

      <main className="app-main">
        <div className="content-column">
          <section className="map-section" id="surface-map" aria-label={`${planetName} surface map`}>
            <div className="section-heading map-section-heading">
              <div>
                <span className="eyebrow">Surface intelligence · 01</span>
                <h1>{isMoon ? 'Explore the lunar frontier' : 'Explore the Martian frontier'}</h1>
                <p>{isMoon ? 'Track confirmed landing sites across the Moon.' : 'Track confirmed landing sites across the red planet.'}</p>
              </div>
              <span className="live-indicator"><span /> Global atlas</span>
            </div>
            <MarsMap
              missions={isMoon ? filteredMissions : surfaceMissions}
              onSelectMission={setSelectedMission}
              selectedId={selectedMission?.id}
              imageUrl={publicAsset(isMoon ? '/images/moon-map.jpg' : '/images/mars-base_4k.jpg')}
              loadingLabel={`${planetName} surface`}
              mapTitle={isMoon ? 'MOON SURFACE MAP' : 'MARS SURFACE MAP'}
              attribution={isMoon ? 'Moon surface map' : 'Mars surface map'}
              showSurfaceEvents={isMoon}
            />
          </section>

          <div className="lower-panels">
            <section className="mission-image-section" id="mission-image">
              <div className="panel-heading">
                <div><span className="eyebrow">Field archive · 02</span><h2>On the surface</h2></div>
                <span className="index-mark">{planetName.toUpperCase()} / 01</span>
              </div>
              <figure className="mission-image-frame">
                <img src={publicAsset(selectedImage)} alt={selectedMission ? `${selectedMission.name} mission image` : `Global ${planetName} surface map`} loading="lazy" />
                <div className="image-vignette" />
                <figcaption>
                  <span className="image-caption-kicker">{selectedMission ? 'Selected expedition' : 'Surface atlas'}</span>
                  <strong>{selectedMission?.name || 'A world of ancient terrain'}</strong>
                  <span>{selectedMission?.landingSite || 'Select a landing marker to explore its mission record.'}</span>
                </figcaption>
                <span className="image-corner-mark" aria-hidden="true">✳</span>
              </figure>
            </section>

            <section className="discovery-section" id="discoveries">
              <div className="panel-heading">
                <div><span className="eyebrow">Science highlights · 03</span><h2>Discoveries</h2></div>
                <span className="index-mark">{isMoon ? `${featuredDiscoveries.length} RECORDS` : 'ARCHIVE'}</span>
              </div>
              {isMoon && (
                <div className="moon-filter-groups">
                  <div className="crew-filters discovery-filters" role="group" aria-label="Filter Moon missions by crew status">
                    {['All', 'Manned', 'Unmanned'].map((filter) => (
                      <button key={filter} type="button" className={crewFilter === filter ? 'is-active' : ''} onClick={() => setCrewFilter(filter)}>{filter}</button>
                    ))}
                  </div>
                  <div className="crew-filters discovery-filters" role="group" aria-label="Filter Moon missions by agency">
                    {['All', 'NASA', 'ISRO'].map((filter) => (
                      <button key={filter} type="button" className={agencyFilter === filter ? 'is-active' : ''} onClick={() => setAgencyFilter(filter)}>{filter}</button>
                    ))}
                  </div>
                  <div className="crew-filters discovery-filters" role="group" aria-label="Filter Moon surface mission outcomes">
                    {['All', 'Successful landings', 'Failed landing attempts', 'Impact events'].map((filter) => (
                      <button key={filter} type="button" className={surfaceFilter === filter ? 'is-active' : ''} onClick={() => setSurfaceFilter(filter)}>{filter}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="discovery-list" style={{ height: '250px', overflowY: 'auto' }}>
                {featuredDiscoveries.map((mission, index) => (
                  <button className={`discovery-card${selectedMission?.id === mission.id ? ' is-selected' : ''}`} key={mission.id} onClick={() => setSelectedMission(mission)} type="button">
                    <span className={`discovery-art discovery-art-${index + 1}`} aria-hidden="true">
                      <img src={publicAsset(MISSION_IMAGES[mission.id] || mission.image || (isMoon ? '/images/moon-map.jpg' : '/images/mars-base_4k.jpg'))} alt="" loading="lazy" />
                      <span />
                    </span>
                    <span className="discovery-copy">
                      <span className="discovery-meta">{mission.agency} <i /> {mission.type?.replace(/-/g, ' ') || mission.landingSite || 'Lunar mission'}</span>
                      <strong>{mission.name}</strong>
                      {isMoon && <span className={`crew-status-badge discovery-crew-badge crew-${mission.crewStatus.toLowerCase()}`}>{mission.crewStatus}</span>}
                      <span>{mission.description || mission.objective || 'Official mission record; details are available in the profile.'}</span>
                    </span>
                    <span className="discovery-arrow" aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="details-section" aria-label="Mission overview">
          <div className="sidebar-intro">
            <span className="eyebrow">Mission overview</span>
            <span className="sidebar-orbit" aria-hidden="true">◌</span>
          </div>
          <MissionDetails mission={selectedMission} />
          <div className="sidebar-footnote"><span className="footnote-dot" /> NASA & ISRO mission archive</div>
        </aside>
      </main>

      <footer className="app-footer">
        {/* Integration placeholder: connect this to the merged app's previous view. */}
        <button className="footer-back-button" type="button" aria-label="Back">← Back</button>
        <a className="footer-back" href="#top"><span>↑</span> Back to top</a>
        <span className="footer-signature"><span className="footer-sun" /> Footprints on {planetName} <i>·</i> Mission Explorer</span>
        <nav aria-label="Footer navigation"><a href="#surface-map">Atlas</a><a href="#mission-image">Archive</a><a href="#discoveries">Discoveries</a></nav>
      </footer>
    </div>
  );
}
