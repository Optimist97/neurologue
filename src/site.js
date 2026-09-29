export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
export function safeUrl(value = '') { try { const u = new URL(value); return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) ? escapeHtml(u.href) : ''; } catch { return ''; } }
const e = escapeHtml;
export function safePhoto(value='') {
  if (/^\.\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$/i.test(value) && !value.includes('..')) return e(value);
  if (/^data:image\/(webp|png|jpeg);base64,[a-zA-Z0-9+/=]+$/.test(value)) return e(value);
  try { const u=new URL(value); if(u.protocol==='https:')return e(u.href); } catch {}
  return '';
}
const shown = value => value?.visible !== false;
const list = items => (items || []).filter(shown);
const external = (url, label, cls = '') => safeUrl(url) ? `<a class="${cls}" href="${safeUrl(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(label)} <span aria-hidden="true">↗</span></a>` : '';
const heading = s => `<p class="eyebrow">${e(s.eyebrow)}</p><h2>${e(s.title)}</h2>${s.text ? `<p class="section-intro">${e(s.text)}</p>` : ''}`;
export function renderSite(root, d, mode='home') {
  if (d.maintenance.enabled) { root.innerHTML = `<main id="main" class="maintenance"><span class="brand-mark">${e(d.general.initials)}</span><p class="eyebrow">${e(d.general.name)} · ${e(d.general.specialty)}</p><h1>${e(d.maintenance.title)}</h1><p>${e(d.maintenance.message)}</p></main>`; return; }
  const home=mode==='home';
  if (!home && !shown(d.infoPage)) { root.innerHTML='<main id="main" class="maintenance"><h1>Page indisponible</h1><a href="./index.html">Retour à l’accueil</a></main>';return; }
  const places = home && shown(d.locationsSection) && list(d.locations).length;
  const topics = !home && shown(d.topics) && list(d.conditions).length;
  const practical = !home && shown(d.practical) && list(d.preparations).length;
  const faq = !home && shown(d.faqSection) && list(d.faqs).length;
  const contact = home && shown(d.contactSection);
  const nav = [[home && shown(d.about),'#approche','Présentation'],[shown(d.infoPage),'./consultations.html',d.infoPage.label],[places,'#lieux','Consultations'],[practical || faq,'#pratique','Infos pratiques']].filter(([v])=>v).map(([,url,label])=>`<a href="${url}">${label}</a>`).join('');
  const target = places ? '#lieux' : contact ? '#contact' : '';
  root.innerHTML = `${d.general.demo ? `<div class="demo-note">${e(d.general.demoMessage)}</div>` : ''}<header class="site-header wrap"><a class="brand" href="./index.html"><span class="brand-mark">${e(d.general.initials)}</span><span>${e(d.general.name)}<small>${e(d.general.specialty)}</small></span></a><button class="menu-button" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">☰</span></button><nav id="navigation" aria-label="Navigation principale">${nav}</nav>${target ? `<a class="header-cta" href="${target}">Lieux de consultation <span aria-hidden="true">↗</span></a>` : ''}</header>
  <main id="main">${!home ? `<section class="info-heading wrap"><a class="text-link" href="./index.html">← Retour à l’accueil</a><h1>${e(d.infoPage.title)}</h1><p>${e(d.infoPage.text)}</p></section>` : ''}${home && shown(d.hero) ? `<section class="hero wrap"><div class="hero-copy"><p class="eyebrow">${e(d.hero.eyebrow)}</p><h1>${e(d.general.name)}</h1><p class="hero-specialty">${e(d.general.specialty)}</p><p class="hero-region">${e(d.general.region)}</p><p class="lead">${e(d.hero.text)}</p><div class="hero-locations">${places ? list(d.locations).filter(l=>l.linkVisible).map(l=>external(l.url,l.name+' · '+l.city,'hero-location')).join('') : ''}</div><p class="hero-note">${e(d.hero.note)}</p></div>${d.general.showPhoto && safePhoto(d.general.photo) ? `<figure class="portrait-panel"><img src="${safePhoto(d.general.photo)}" alt="${e(d.general.photoAlt)}" width="600" height="750"><figcaption>${e(d.general.name)}</figcaption></figure>` : ''}</section>` : ''}
  ${home && shown(d.about) ? `<section id="approche" class="about wrap section"><div>${heading({...d.about,text: ''})}</div><div class="about-copy"><p>${e(d.about.text)}</p><div class="credentials"><p>${e(d.about.qualifications)}</p><p>${e(d.about.languages)}</p></div></div></section>` : ''}
  ${topics ? `<section id="expertises" class="topics section"><div class="wrap"><div class="section-heading">${heading(d.topics)}</div><div class="condition-grid">${list(d.conditions).map((c,i)=>`<article class="condition"><span class="number">${String(i+1).padStart(2,'0')}</span><div><h3>${e(c.title)}</h3><p>${e(c.text)}</p></div><span class="condition-symbol" aria-hidden="true">✳</span></article>`).join('')}</div></div></section>` : ''}
  ${places ? `<section id="lieux" class="locations section wrap"><div class="section-heading">${heading(d.locationsSection)}</div><div class="location-grid">${list(d.locations).map((l,i)=>`<article class="location"><div class="location-top"><span class="eyebrow">${e(l.type)}</span><span class="location-number">${String(i+1).padStart(2,'0')}</span></div><p class="location-city">${e(l.city)}</p><h3>${e(l.name)}</h3><p class="location-subtitle">${e(l.subtitle)}</p><p class="address">${e(l.address)}</p><p>${e(l.text)}</p><div class="location-actions">${l.linkVisible ? external(l.url,d.locationsSection.button,'institution-link') : ''}${l.phoneVisible && l.phone ? external('tel:'+l.phone.replace(/[^+\d]/g,''), l.phone,'phone-link') : ''}${l.mapVisible ? external(l.map,d.locationsSection.mapLabel,'text-link') : ''}</div></article>`).join('')}</div></section>` : ''}
  ${practical || faq ? `<div id="pratique">${practical ? `<section class="practical section"><div class="wrap"><div class="section-heading">${heading(d.practical)}</div><div class="preparation-grid">${list(d.preparations).map((p,i)=>`<article><span class="step">${String(i+1).padStart(2,'0')}</span><h3>${e(p.title)}</h3><p>${e(p.text)}</p></article>`).join('')}</div></div></section>` : ''}${faq ? `<section class="faq section wrap"><div>${heading(d.faqSection)}</div><div>${list(d.faqs).map(f=>`<details><summary>${e(f.question)}<span aria-hidden="true">+</span></summary><p>${e(f.answer)}</p></details>`).join('')}</div></section>` : ''}</div>` : ''}
  ${contact ? `<section id="contact" class="contact section wrap"><div>${heading(d.contactSection)}</div><div><div class="contact-links">${places ? list(d.locations).filter(l=>l.linkVisible).map(l=>external(l.url,l.name+' · '+l.city,'contact-link')).join('') : ''}${list(d.contacts).map(c=>external(c.url,c.label+' · '+c.value,'contact-link')).join('')}</div><p class="privacy-note">${e(d.contactSection.privacy)}</p></div></section>` : ''}
  ${shown(d.emergency) ? `<aside class="emergency wrap"><div><strong>${e(d.emergency.title)}</strong><p>${e(d.emergency.text)}</p></div>${external(d.emergency.url,d.emergency.button,'emergency-button')}</aside>` : ''}</main>
  <footer class="footer wrap"><div><span class="footer-name">${e(d.general.name)}</span><p>${e(d.general.footer)}</p></div><span>${e(d.general.region)}</span>${shown(d.legal) ? `<details class="legal"><summary>${e(d.legal.title)}</summary><p>${e(d.legal.text)}</p></details>` : ''}</footer>`;
  const menu = root.querySelector('.menu-button');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); root.querySelector('nav').classList.toggle('open',open); });
  root.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');root.querySelector('nav').classList.remove('open');}));
}


