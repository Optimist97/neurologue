import { renderSite } from './site.js';
const root = document.getElementById('site');
const mode = document.body.dataset.page || 'home';
async function main() {
try {
const response = await fetch('./cv-data.json', { cache:'no-cache' });
if (!response.ok) throw new Error('Données indisponibles');
const data = await response.json();
renderSite(root,data,mode);
if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:"instant",block:"start"}));
document.title = mode === 'consult' ? `${data.infoPage.title} · ${data.general.name}` : `${data.general.name} · ${data.general.specialty}`;
document.querySelector('meta[name="description"]').content = data.general.description;
} catch { root.innerHTML = '<main id="main" class="maintenance"><h1>Le site est momentanément indisponible.</h1><p>Merci de réessayer dans quelques instants.</p></main>'; }
}
if (new URLSearchParams(location.search).has('preview') && window.parent !== window) {
window.addEventListener('message', event => { if(event.origin === location.origin && event.source === window.parent && event.data?.type === 'neuro-preview') renderSite(root,event.data.data,mode); });
window.parent.postMessage({type:'neuro-ready'},location.origin);
} else main();
