import React, { useState } from 'react';
import './App.css';

import MarsMap from './components/MarsMap';
import MissionDetails from './components/MissionDetails';
import { isConfirmedSurfaceLanding } from './components/LandingMarkers';

// Data imports
import surfaceMissions from './data/surfaceMissions.json';
import marsMissionCatalog from './data/marsMissionCatalog.json';

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
  const [selectedMission, setSelectedMission] = useState(null);

  const landableMissions = surfaceMissions.filter(isConfirmedSurfaceLanding);
  const totalNASA = marsMissionCatalog.missions.filter((mission) => mission.agency === 'NASA').length;
  const totalISRO = marsMissionCatalog.missions.filter((mission) => mission.agency === 'ISRO').length;
  const featuredDiscoveries = landableMissions;

  return (
    <div className="app-shell" id="top">
      <header className="app-header">
        <a className="app-header-logo" href="#top" aria-label="Mars Mission Explorer home">
          <span className="logo-mars" aria-hidden="true"><span /></span>
          <span className="logo-copy">
            <span className="logo-text">Mars Mission Explorer</span>
            <span className="logo-kicker">Footprints on Mars · Mission Control</span>
          </span>
        </a>
        <nav className="header-nav" aria-label="Page sections">
          <a href="#surface-map">Surface map</a>
          <a href="#mission-image">Mission image</a>
          <a href="#discoveries">Discoveries</a>
        </nav>
        <div className="app-header-stats" aria-label="Mission statistics">
          <div className="stat-chip"><span className="stat-num">{marsMissionCatalog.missions.length}</span><span className="stat-label">Missions</span></div>
          <div className="stat-chip nasa"><span className="stat-num">{totalNASA}</span><span className="stat-label">NASA</span></div>
          <div className="stat-chip isro"><span className="stat-num">{totalISRO}</span><span className="stat-label">ISRO</span></div>
          <div className="stat-chip surface"><span className="stat-num">{landableMissions.length}</span><span className="stat-label">Landings</span></div>
        </div>
      </header>

      <main className="app-main">
        <div className="content-column">
          <section className="map-section" id="surface-map" aria-label="Mars surface map">
            <div className="section-heading map-section-heading">
              <div>
                <span className="eyebrow">Surface intelligence · 01</span>
                <h1>Explore the Martian frontier</h1>
                <p>Track confirmed landing sites across the red planet.</p>
              </div>
              <span className="live-indicator"><span /> Global atlas</span>
            </div>
            <MarsMap missions={landableMissions} onSelectMission={setSelectedMission} selectedId={selectedMission?.id} />
          </section>

          <div className="lower-panels">
            <section className="mission-image-section" id="mission-image">
              <div className="panel-heading">
                <div><span className="eyebrow">Field archive · 02</span><h2>On the surface</h2></div>
                <span className="index-mark">MARS / 01</span>
              </div>
              <figure className="mission-image-frame">
                <img src={selectedMission?.image || '/images/mars-base_4k.jpg'} alt={selectedMission ? `Mars surface map view for ${selectedMission.name}` : 'Global Mars surface map'} loading="lazy" />
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
                <span className="index-mark">ARCHIVE</span>
              </div>
              <div className="discovery-list" style={{ height: '250px', overflowY: 'auto' }}>
                {featuredDiscoveries.map((mission, index) => (
                  <button className={`discovery-card${selectedMission?.id === mission.id ? ' is-selected' : ''}`} key={mission.id} onClick={() => setSelectedMission(mission)} type="button">
                    <span className={`discovery-art discovery-art-${index + 1}`} aria-hidden="true">
                      <img src={mission.image || '/images/mars-base_4k.jpg'} alt="" loading="lazy" />
                      <span />
                    </span>
                    <span className="discovery-copy">
                      <span className="discovery-meta">{mission.agency} <i /> {mission.landingSite}</span>
                      <strong>{mission.name}</strong>
                      <span>{mission.objective}</span>
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
        <span className="footer-signature"><span className="footer-sun" /> Footprints on Mars <i>·</i> Mission Explorer</span>
        <nav aria-label="Footer navigation"><a href="#surface-map">Atlas</a><a href="#mission-image">Archive</a><a href="#discoveries">Discoveries</a></nav>
      </footer>
    </div>
  );
}
