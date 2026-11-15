import marsRecords from './src/data/orbitalMissions.json';
import moonRecords from './orbital-moon.json';
import enrichment from './orbital-enrichment.json';
import './orbital-panel.css';

export const ORBITAL_PROFILES = Object.freeze({
  'mariner-9': {
    periapsisKm: 1398, apoapsisKm: 17916, inclination: 64.3, periodHours: 12,
    orbitLabel: 'Elliptical · 1,398–17,916 km · 64.3° inclination',
    orbitSource: 'https://science.nasa.gov/mission/mariner-9/',
  },
  'viking-1-orbiter': {
    periapsisKm: 1500, apoapsisKm: 32800, inclination: 33.4, periodHours: 24.6,
    orbitLabel: 'Elliptical · 1,500–32,800 km · 33.4° inclination',
    orbitSource: 'https://science.nasa.gov/mission/viking-1/',
  },
  'viking-2-orbiter': {
    periapsisKm: 1502, apoapsisKm: 35728, inclination: 55.6, periodHours: 24.6,
    orbitLabel: 'Elliptical · 1,502–35,728 km · 55.6° inclination',
    orbitSource: 'https://science.nasa.gov/mission/viking-2/',
  },
  'mars-global-surveyor': {
    periapsisKm: 368, apoapsisKm: 438, inclination: 92.96, periodHours: 1.96,
    orbitLabel: 'Near-polar mapping orbit · 368–438 km · about 118 minutes',
    orbitSource: 'https://nssdc.gsfc.nasa.gov/planetary/marsurv.html',
  },
  'mars-reconnaisance-orbiter': {
    periapsisKm: 250, apoapsisKm: 316, inclination: 93, periodHours: 2,
    orbitLabel: 'Near-polar · 250–316 km · about 2 hours',
    orbitSource: 'https://www.jpl.nasa.gov/news/nasa-mars-reconnaissance-orbiter-reaches-planned-flight-path/',
  },
  'mars-odyssey': {
    periapsisKm: 400, apoapsisKm: 400, inclination: 93, periodHours: 2,
    orbitLabel: 'Near-polar · about 400 km · about 2 hours',
    orbitSource: 'https://science.nasa.gov/mission/odyssey/',
  },
  maven: {
    periapsisKm: 132, apoapsisKm: 4570, inclination: 75, periodHours: 3.7,
    orbitLabel: 'Elliptical · 132–4,570 km · 75° inclination',
    orbitSource: 'https://science.nasa.gov/missions/maven/nasas-maven-uses-red-planets-atmosphere-to-change-orbit/',
  },
  'mars-orbiter-mission': {
    periapsisKm: 300, apoapsisKm: 71000, inclination: 150, periodHours: 73,
    orbitLabel: 'Highly elliptical · 300–71,000 km · 150° inclination',
    orbitSource: 'https://www.isro.gov.in/mission_overview_mars_orbiter_mission.html',
  },
  'lunar-reconnaissance-orbiter': {
    periapsisKm: 50, apoapsisKm: 50, inclination: 90, periodHours: 2,
    orbitLabel: 'Polar mapping orbit · about 50 km · about 2 hours',
    orbitSource: 'https://science.nasa.gov/mission/lro/about/',
  },
  'apollo-8': {
    periapsisKm: 110, apoapsisKm: 112, inclination: 12, periodHours: 2,
    orbitLabel: 'Low lunar orbit · about 110 km · 12° inclination',
    orbitSource: 'https://www.nasa.gov/missions/apollo/apollo-8-mission-details/',
  },
  'lunar-orbiter-3': {
    periapsisKm: 55, apoapsisKm: 1847, inclination: 20.9, periodHours: 3.5,
    orbitLabel: 'Elliptical · 55–1,847 km · 20.9° inclination',
    orbitSource: 'https://ntrs.nasa.gov/api/citations/19740012502/downloads/19740012502.pdf',
  },
  ladee: {
    periapsisKm: 20, apoapsisKm: 60, inclination: 180, periodHours: 2,
    orbitLabel: 'Low retrograde equatorial orbit · 20–60 km',
    orbitSource: 'https://science.nasa.gov/mission/ladee/in-depth/',
  },
  'lunar-prospector': {
    periapsisKm: 100, apoapsisKm: 100, inclination: 90, periodHours: 1.97,
    orbitLabel: 'Circular polar orbit · about 100 km · 118 minutes',
    orbitSource: 'https://science.nasa.gov/mission/lunar-prospector/',
  },
  'chandrayaan-1-orbiter': {
    periapsisKm: 100, apoapsisKm: 100, inclination: 90, periodHours: 2,
    orbitLabel: 'Circular polar orbit · about 100 km',
    orbitSource: 'https://www.isro.gov.in/Chandrayaan_1.html',
  },
  'chandrayaan-2-orbiter': {
    periapsisKm: 100, apoapsisKm: 100, inclination: 90, periodHours: 2,
    orbitLabel: 'Circular polar orbit · 100 × 100 km',
    orbitSource: 'https://www.isro.gov.in/Chandrayaan2_science.html',
  },
});

const enrich = m => ({ ...m, ...enrichment[m.id], orbitProfile: ORBITAL_PROFILES[m.id] });
const records = { mars: marsRecords.filter(m => m.type === 'orbiter').map(enrich), moon: moonRecords.map(enrich) };
const formatDate = value => value ? new Date(`${value}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : null;
export function createOrbitalPanel(host) {
  const panel = document.createElement('aside');
  panel.className = 'orbital-panel';
  panel.setAttribute('aria-label', 'Orbital missions');
  panel.innerHTML = '<h2></h2><p class="orbital-count"></p><div class="orbital-list" aria-label="Mission list"></div><section class="orbital-details" aria-label="Selected orbital mission" aria-live="polite"></section>';
  host.append(panel);
  const list = panel.querySelector('.orbital-list');
  const details = panel.querySelector('.orbital-details');
  function select(mission) {
    for (const button of list.children) button.setAttribute('aria-pressed', String(button.dataset.id === mission.id));
    details.replaceChildren();
    const add = (tag, text) => { const element = document.createElement(tag); element.textContent = text; details.append(element); };
    const addFact = (label, value) => {
      const row = document.createElement('p');
      row.className = 'orbital-fact';
      const key = document.createElement('span');
      key.textContent = label;
      const content = document.createElement('strong');
      content.textContent = value;
      row.append(key, content);
      details.append(row);
    };
    add('h3', mission.name);
    if (mission.image) {
      const figure = document.createElement('figure');
      const img = document.createElement('img'); img.src = mission.image; img.alt = mission.imageTitle || mission.name; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      const caption = document.createElement('figcaption'); caption.textContent = `${mission.imageTitle || mission.name} · ${mission.agency} mission archive`;
      img.addEventListener('error', () => { img.hidden = true; caption.textContent = 'Image unavailable. View the official mission source below.'; });
      figure.append(img, caption); details.append(figure);
      if (mission.imageSource) {
        const credit = document.createElement('a'); credit.href = mission.imageSource; credit.textContent = 'Image source ↗'; credit.target = '_blank'; credit.rel = 'noopener noreferrer'; caption.append(' · ', credit);
      }
    }
    for (const [label, value] of [['Agency', mission.agency], ['Launched', formatDate(mission.launchDate)], ['Reached orbit', formatDate(mission.arrivalDate)], ['Mission ended', formatDate(mission.endDate)], ['Status', mission.status?.replaceAll('-', ' ')]]) {
      if (value) addFact(label, value);
    }
    if (mission.description) {
      const overview = document.createElement('p');
      overview.className = 'orbital-overview';
      overview.textContent = mission.description;
      details.append(overview);
    }
    for (const [label, value] of [['Mission objective', mission.objective], ['Instruments', (mission.instruments || mission.mangalyaanFacts?.instruments)?.join(', ')]]) {
      if (value) addFact(label, value);
    }
    if (mission.orbitProfile) {
      const orbit = document.createElement('p');
      orbit.className = 'orbital-profile-note';
      orbit.textContent = `Illustrative path · ${mission.orbitProfile.orbitLabel}. Radial scale is compressed so the full route stays visible beside the planet.`;
      details.append(orbit);
      const reference = document.createElement('a');
      reference.href = mission.orbitProfile.orbitSource;
      reference.textContent = 'Orbit details ↗';
      reference.target = '_blank';
      reference.rel = 'noopener noreferrer';
      details.append(reference);
    } else {
      const note = mission.status === 'failed-launch' || mission.status === 'failed-arrival' || mission.status === 'lost-contact' || mission.status === 'en-route'
        ? 'This mission did not enter orbit around this world, so there is no flown orbit path to show.'
        : 'Orbit information is not available for this mission yet.';
      add('p', note);
    }
    if (mission.source || mission.sourceUrl) {
      const link = document.createElement('a'); link.href = mission.source || mission.sourceUrl; link.textContent = 'Official mission source ↗'; link.target = '_blank'; link.rel = 'noopener noreferrer'; details.append(link);
    }
    host.dispatchEvent(new CustomEvent('orbitalmissionselect', { detail: { mission } }));
  }
  function setPlanet(planet) {
    panel.classList.add('is-switching');
    host.dataset.theme = planet;
    panel.dataset.theme = planet;
    panel.querySelector('h2').textContent = `${planet === 'moon' ? 'Moon' : 'Mars'} orbital missions`;
    const withProfiles = records[planet].filter(mission => mission.orbitProfile).length;
    panel.querySelector('.orbital-count').textContent = `${withProfiles} of ${records[planet].length} missions have a published orbit profile`;
    list.replaceChildren();
    for (const mission of records[planet]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.id = mission.id;
      const name = document.createElement('strong'); name.textContent = mission.name;
      const meta = document.createElement('span'); meta.textContent = `${mission.agency} · ${mission.launchDate?.slice(0, 4) || mission.launchYear || 'Launch year unavailable'}`;
      const availability = document.createElement('span');
      availability.className = `orbit-availability${mission.orbitProfile ? ' has-orbit' : ''}`;
      availability.textContent = mission.orbitProfile ? 'Orbit path available' : 'No flown orbit path';
      button.append(name, meta, availability); button.addEventListener('click', () => select(mission)); list.append(button);
    }
    const preferredId = planet === 'moon' ? 'lunar-reconnaissance-orbiter' : 'mars-reconnaisance-orbiter';
    select(records[planet].find(mission => mission.id === preferredId) || records[planet][0]);
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove('is-switching')));
  }
  setPlanet('mars');
  return { setPlanet };
}
