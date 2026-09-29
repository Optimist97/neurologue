export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
export function safeUrl(value = '') { try { const u = new URL(value); return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) ? escapeHtml(u.href) : ''; } catch { return ''; } }
const e = escapeHtml;
export const SIZE_SETTINGS = {
  menuSize: {label:'Taille des menus (px)',min:16,max:24,default:18,variable:'--menu-size'},
  titleSize: {label:'Taille des titres (px)',min:30,max:56,default:40,variable:'--title-size'},
  textSize: {label:'Taille du texte (px)',min:16,max:24,default:18,variable:'--text-size'}
};
export const FONT_CHOICES = {
  classic: { label:'Classique · Source Serif 4', serif:'"Source Serif 4", Georgia, serif', sans:'"Source Sans 3", system-ui, sans-serif' },
  contemporary: { label:'Contemporain · Lora', serif:'Lora, Georgia, serif', sans:'"DM Sans", system-ui, sans-serif' },
  simple: { label:'Sobre · Source Sans 3', serif:'"Source Sans 3", system-ui, sans-serif', sans:'"Source Sans 3", system-ui, sans-serif' }
};
export const PALETTES = {
  ivory: { label:'Ivoire · défaut', paper:'#f8f6ef', sage:'#e8eee4', navInk:'#294d40', navLine:'#c5d1bd' },
  sage: { label:'Sauge pâle', paper:'#eef2e8', sage:'#e2e9d9', navInk:'#354d34', navLine:'#becdb4' },
  mist: { label:'Bleu brume', paper:'#edf2f6', sage:'#e0e9ed', navInk:'#294a60', navLine:'#bcced9' },
  lavender: { label:'Lavande grisée', paper:'#f0ecf4', sage:'#e6e2ed', navInk:'#51435f', navLine:'#cfc1dc' },
  terracotta: { label:'Terracotta clair', paper:'#f5e6dd', sage:'#ecddd1', navInk:'#744535', navLine:'#d8b9a6' }
};
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
const neuroIllustration = (kind='brain') => {
 const shapes = {
 brain:'<path d="M100 38C90 25 66 31 62 47C45 42 29 57 34 73C19 85 22 106 37 114C30 131 44 147 59 146C65 167 92 169 100 151M100 38C110 25 134 31 138 47C155 42 171 57 166 73C181 85 178 106 163 114C170 131 156 147 141 146C135 167 108 169 100 151V38"/><path d="M62 47C62 60 71 66 81 63M34 73C47 70 55 78 53 89M37 114C49 113 60 121 59 133M59 146C65 136 76 134 82 139M81 85C69 88 65 101 71 111M138 47C138 60 129 66 119 63M166 73C153 70 145 78 147 89M163 114C151 113 140 121 141 133M141 146C135 136 124 134 118 139M119 85C131 88 135 101 129 111"/>',
 neurons:'<path d="M99 104C83 86 73 65 61 44M99 104C115 82 127 65 145 53M99 104C128 112 148 126 163 147M99 104C80 117 65 138 50 157M99 104C98 129 104 148 108 167"/><path d="M73 65L46 69M73 65L78 42M127 65L124 40M127 65L159 75M148 126L169 116M148 126L137 149M65 138L42 125M65 138L77 158"/><circle cx="99" cy="104" r="10"/><circle cx="61" cy="44" r="3"/><circle cx="145" cy="53" r="3"/><circle cx="50" cy="157" r="3"/><circle cx="163" cy="147" r="3"/>',
 rhythm:'<path d="M30 100H59C67 100 70 86 77 86S88 117 96 117S108 65 117 65S130 109 139 109S148 100 154 100H172"/><path d="M53 57C65 45 82 39 100 39M148 148C135 161 119 166 102 165"/><circle cx="100" cy="39" r="3"/><circle cx="102" cy="165" r="3"/>'
 };
 return '<div class="neuro-illustration neuro-'+kind+'" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none"><ellipse class="art-wash" cx="100" cy="102" rx="85" ry="80"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+shapes[kind]+'</g></svg></div>';
};
export function renderSite(root, d, mode='home') {
  const palette=Object.hasOwn(PALETTES,d.general.background) ? PALETTES[d.general.background] : PALETTES.ivory;
  const style=root.ownerDocument?.documentElement.style;
  const fonts=Object.hasOwn(FONT_CHOICES,d.general.typography) ? FONT_CHOICES[d.general.typography] : FONT_CHOICES.classic;
  if(style){style.setProperty('--paper',palette.paper);style.setProperty('--sage',palette.sage);style.setProperty('--nav-ink',palette.navInk);style.setProperty('--nav-line',palette.navLine);style.setProperty('--serif',fonts.serif);style.setProperty('--sans',fonts.sans);}
  if(style)for(const [key,setting] of Object.entries(SIZE_SETTINGS)) {
    const value=d.general[key];
    style.setProperty(setting.variable,(Number.isInteger(value)&&value>=setting.min&&value<=setting.max?value:setting.default)+'px');
  }
  if (d.maintenance.enabled) { root.innerHTML = `<main id="main" class="maintenance"><span class="brand-mark">${e(d.general.initials)}</span><p class="eyebrow">${e(d.general.name)} · ${e(d.general.specialty)}</p><h1>${e(d.maintenance.title)}</h1><p>${e(d.maintenance.message)}</p></main>`; return; }
  const home=mode==='home';
  if (!home && !shown(d.infoPage)) { root.innerHTML='<main id="main" class="maintenance"><h1>Page indisponible</h1><a href="./index.html">Retour à l’accueil</a></main>';return; }
  const places = home && shown(d.locationsSection) && list(d.locations).length;
  const topics = !home && shown(d.topics) && list(d.conditions).length;
  const practical = home && shown(d.practical) && list(d.preparations).length;
  const faq = !home && shown(d.faqSection) && list(d.faqs).length;
  const contact = home && shown(d.contactSection);
  const nav = [[home && shown(d.about),'#approche','Présentation'],[shown(d.infoPage),'./consultations.html',d.infoPage.label],[places,'#lieux','Consultations'],[practical || faq,'#pratique',home?'Préparer la consultation':'Infos pratiques']].filter(([v])=>v).map(([,url,label])=>`<a href="${url}"${!home&&url==='./consultations.html'?' aria-current="page"':''}>${e(label)}</a>`).join('');
  const target = places ? '#lieux' : contact ? '#contact' : '';
  root.innerHTML = `${d.general.demo ? `<div class="demo-note">${e(d.general.demoMessage)}</div>` : ''}<header class="site-header wrap"><a class="brand" href="./index.html"><span class="brand-mark">${e(d.general.initials)}</span><span>${e(d.general.name)}<small>${e(d.general.specialty)}</small></span></a><button class="menu-button" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">☰</span></button><nav id="navigation" aria-label="Navigation principale">${nav}</nav>${target ? `<a class="header-cta" href="${target}">Lieux de consultation <span aria-hidden="true">↗</span></a>` : ''}</header>
  <main id="main">${!home ? `<section class="info-heading wrap"><div class="info-heading-copy"><a class="text-link" href="./index.html">← Retour à l’accueil</a><h1>${e(d.infoPage.title)}</h1><p>${e(d.infoPage.text)}</p></div>${d.general.illustrationInfo!==false?neuroIllustration('neurons'):''}</section>` : ''}${home && shown(d.hero) ? `<section class="hero wrap"><div class="hero-copy"><p class="eyebrow">${e(d.hero.eyebrow)}</p><h1>${e(d.general.name)}</h1><p class="hero-specialty">${e(d.general.specialty)}</p><p class="hero-region">${e(d.general.region)}</p><p class="lead">${e(d.hero.text)}</p><div class="hero-locations">${places ? list(d.locations).filter(l=>l.linkVisible).map(l=>external(l.url,l.name+' · '+l.city,'hero-location')).join('') : ''}</div><p class="hero-note">${e(d.hero.note)}</p></div>${d.general.showPhoto && safePhoto(d.general.photo) ? `<figure class="portrait-panel"><img src="${safePhoto(d.general.photo)}" alt="${e(d.general.photoAlt)}" width="600" height="750"><figcaption>${e(d.general.name)}</figcaption></figure>` : ''}</section>` : ''}
  ${home && shown(d.about) ? `<section id="approche" class="about wrap section"><div>${heading({...d.about,text: ''})}${d.general.illustrationProfile!==false?neuroIllustration():''}</div><div class="about-copy"><p>${e(d.about.text)}</p><div class="credentials"><p>${e(d.about.qualifications)}</p><p>${e(d.about.languages)}</p></div></div></section>` : ''}
  ${topics ? `<section id="expertises" class="topics section"><div class="wrap"><div class="section-heading">${heading(d.topics)}</div><div class="condition-grid">${list(d.conditions).map((c,i)=>`<article class="condition"><span class="number">${String(i+1).padStart(2,'0')}</span><div><h3>${e(c.title)}</h3><p>${e(c.text)}</p></div><span class="condition-symbol" aria-hidden="true">✳</span></article>`).join('')}</div></div></section>` : ''}
  ${places ? `<section id="lieux" class="locations section wrap"><div class="section-heading">${heading(d.locationsSection)}</div><div class="location-grid">${list(d.locations).map((l,i)=>`<article class="location"><div class="location-top"><span class="eyebrow">${e(l.type)}</span><span class="location-number">${String(i+1).padStart(2,'0')}</span></div><p class="location-city">${e(l.city)}</p><h3>${e(l.name)}</h3><p class="location-subtitle">${e(l.subtitle)}</p><p class="address">${e(l.address)}</p><p>${e(l.text)}</p><div class="location-actions">${l.bookingVisible ? external(l.bookingUrl,l.bookingLabel,'button booking-link') : ''}${l.linkVisible ? external(l.url,d.locationsSection.button,'institution-link') : ''}${l.phoneVisible && l.phone ? external('tel:'+l.phone.replace(/[^+\d]/g,''), l.phone,'phone-link') : ''}${l.mapVisible ? external(l.map,d.locationsSection.mapLabel,'text-link') : ''}</div></article>`).join('')}</div></section>` : ''}
  ${practical || faq ? `<div id="pratique">${practical ? `<section class="practical section"><div class="wrap"><div class="section-heading illustrated-heading"><div>${heading(d.practical)}</div>${d.general.illustrationPractical!==false?neuroIllustration('rhythm'):''}</div><div class="preparation-grid">${list(d.preparations).map((p,i)=>`<article><span class="step">${String(i+1).padStart(2,'0')}</span><h3>${e(p.title)}</h3><p>${e(p.text)}</p></article>`).join('')}</div></div></section>` : ''}${faq ? `<section class="faq section wrap"><div>${heading(d.faqSection)}</div><div>${list(d.faqs).map(f=>`<details><summary>${e(f.question)}<span aria-hidden="true">+</span></summary><p>${e(f.answer)}</p></details>`).join('')}</div></section>` : ''}</div>` : ''}
  ${contact ? `<section id="contact" class="contact section wrap"><div>${heading(d.contactSection)}</div><div><div class="contact-links">${places ? list(d.locations).filter(l=>l.linkVisible).map(l=>external(l.url,l.name+' · '+l.city,'contact-link')).join('') : ''}${list(d.contacts).map(c=>external(c.url,c.label+' · '+c.value,'contact-link')).join('')}</div><p class="privacy-note">${e(d.contactSection.privacy)}</p></div></section>` : ''}
  ${shown(d.emergency) ? `<aside class="emergency wrap"><div><strong>${e(d.emergency.title)}</strong><p>${e(d.emergency.text)}</p></div>${external(d.emergency.url,d.emergency.button,'emergency-button')}</aside>` : ''}</main>
  <footer class="footer wrap"><div><span class="footer-name">${e(d.general.name)}</span><p>${e(d.general.footer)}</p></div><span>${e(d.general.region)}</span>${shown(d.legal) ? `<details class="legal"><summary>${e(d.legal.title)}</summary><p>${e(d.legal.text)}</p></details>` : ''}</footer>`;
  const menu = root.querySelector('.menu-button');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); root.querySelector('nav').classList.toggle('open',open); });
  root.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');root.querySelector('nav').classList.remove('open');}));
}



