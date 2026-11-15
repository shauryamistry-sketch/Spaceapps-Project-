import marsRecords from './src/data/orbitalMissions.json';
import moonRecords from './orbital-moon.json';
import enrichment from './orbital-enrichment.json';
import './orbital-panel.css';

const enrich = m => ({ ...m, ...enrichment[m.id] });
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
    for (const [label, value] of [['Agency', mission.agency], ['Launch date', formatDate(mission.launchDate)], ['Orbit arrival', formatDate(mission.arrivalDate)], ['Mission end', formatDate(mission.endDate)], ['Status', mission.status?.replaceAll('-', ' ')], ['Overview', mission.description], ['Objective', mission.objective], ['Instruments', (mission.instruments || mission.mangalyaanFacts?.instruments)?.join(', ')]]) {
      if (value) add('p', `${label}: ${value}`);
    }
    if (mission.source || mission.sourceUrl) {
      const link = document.createElement('a'); link.href = mission.source || mission.sourceUrl; link.textContent = 'Official mission source ↗'; link.target = '_blank'; link.rel = 'noopener noreferrer'; details.append(link);
    }
  }
  function setPlanet(planet) {
    host.dataset.theme = planet;
    panel.dataset.theme = planet;
    panel.querySelector('h2').textContent = `${planet === 'moon' ? 'Moon' : 'Mars'} orbital missions`;
    panel.querySelector('.orbital-count').textContent = `${records[planet].length} missions · Select a mission to explore its story`;
    list.replaceChildren();
    for (const mission of records[planet]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.id = mission.id;
      const name = document.createElement('strong'); name.textContent = mission.name;
      const meta = document.createElement('span'); meta.textContent = `${mission.agency} · ${mission.launchDate?.slice(0, 4) || mission.launchYear || 'Launch year unavailable'}`;
      button.append(name, meta); button.addEventListener('click', () => select(mission)); list.append(button);
    }
    select(records[planet][0]);
  }
  setPlanet('mars');
  return { setPlanet };
}
