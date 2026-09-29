import { defaultData } from './data.js';
import { escapeHtml as e, safeUrl, safePhoto, PALETTES, FONT_CHOICES, SIZE_SETTINGS } from '../../site.js';
export const REPOSITORY = 'Optimist97/neurologue';
export const STORAGE_KEY = 'neuro-site-v2-draft';
const clone = d => JSON.parse(JSON.stringify(d));
const sections = [
['general','Identité, photo & lisibilité'],['maintenance','Site en construction'],['hero','Accueil'],['about','La neurologue'],['infoPage','Page : quand consulter ?'],['topics','Motifs · titre de rubrique'],['conditions','Motifs de consultation'],['locationsSection','Lieux · titre de rubrique'],['locations','Centres & hôpitaux'],['practical','Préparer la consultation'],['preparations','Conseils de préparation'],['faqSection','Questions · titre de rubrique'],['faqs','Questions fréquentes'],['contactSection','Contact · titre de rubrique'],['contacts','Liens de contact'],['emergency','Urgences'],['legal','Mentions légales']
];
const labels = {photo:'Photo (lien HTTPS ou image importée)',showPhoto:'Afficher la photo',photoAlt:'Description de la photo',bookingUrl:'Lien de rendez-vous ROSA',bookingLabel:'Texte du bouton de rendez-vous',bookingVisible:'Afficher le bouton de rendez-vous ROSA',visible:'Afficher sur le site',name:'Nom',specialty:'Spécialité',region:'Région',initials:'Monogramme',description:'Description pour les moteurs de recherche',demo:'Afficher le bandeau de démonstration',demoMessage:'Message du bandeau',footer:'Phrase du pied de page',enabled:'Masquer tout le site (mode construction)',title:'Titre',message:'Message personnalisé',eyebrow:'Petit titre de rubrique',accent:'Deuxième partie du titre',text:'Texte',button:'Libellé du bouton',secondary:'Libellé du lien vers l’approche',note:'Information sous les boutons',artVisible:'Afficher le motif graphique',artCaption:'Légende du motif',quote:'Citation',qualifications:'Formation & qualifications',languages:'Langues de consultation',mapLabel:'Libellé du lien itinéraire',type:'Type d’établissement',subtitle:'Sous-titre',city:'Ville',address:'Adresse',url:'Lien (https://, mailto: ou tel:)',linkVisible:'Afficher le lien vers l’établissement',phone:'Téléphone du secrétariat',phoneVisible:'Afficher le lien d’appel',map:'Lien vers l’itinéraire',mapVisible:'Afficher l’itinéraire',question:'Question',answer:'Réponse',privacy:'Confidentialité / note de contact',label:'Libellé du contact',value:'Coordonnée affichée'};
const longFields = new Set(['description','text','message','privacy','answer','quote']);
export function validateData(data) {
 if (!data || typeof data !== 'object' || Array.isArray(data) || data.version !== 2) throw new Error('Ce fichier doit être un export du CMS neurologie (version 2).');
 const result = clone(defaultData);
 for (const [key,template] of Object.entries(defaultData)) {
  if (key === 'version') continue;
  const source = data[key];
  if (Array.isArray(template)) {
   if (!Array.isArray(source) || source.length > 100) throw new Error('Liste invalide : '+key);
   result[key] = source.map(item => validateObject(item,template[0],key));
  } else result[key] = validateObject(source,template,key);
 }
 return result;
}
function validateObject(source,template,key) {
 if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('Rubrique invalide : '+key);
 const result = {};
 for (const [field,value] of Object.entries(template)) {
  const entry = source[field] ?? (key==='locations' && field==='bookingUrl' ? '' : key==='locations' && field==='bookingVisible' ? false : value);
  if (typeof entry !== typeof value || (typeof entry === 'string' && entry.length > (field==='photo'?1000000:20000))) throw new Error('Champ invalide : '+key+'.'+field);
  if (field==='photo' && entry && !safePhoto(entry)) throw new Error('Photo invalide : utilisez une image importée, un chemin local ou un lien HTTPS.');
  if (field==='background' && !Object.hasOwn(PALETTES,entry)) throw new Error('Choisissez l’un des fonds pastels proposés.');
  if (field==='typography' && !Object.hasOwn(FONT_CHOICES,entry)) throw new Error('Choisissez l’une des trois typographies proposées.');
  if (Object.hasOwn(SIZE_SETTINGS,field)) {
    const setting=SIZE_SETTINGS[field];
    if(!Number.isInteger(entry)||entry<setting.min||entry>setting.max)throw new Error(setting.label+' : choisissez une valeur entre '+setting.min+' et '+setting.max+'.');
  }
  if (typeof entry === 'string' && ['url','map','bookingUrl'].includes(field) && entry && !safeUrl(entry)) throw new Error('Lien invalide : '+key+'.'+field);
  result[field] = entry;
 }
 return result;
}
class App {
 constructor() { this.data=clone(defaultData);this.token=null;this.remoteSha=null;this.baseSha=null;this.hasDraft=false;this.dirty=false;this.frame=document.getElementById('preview');this.bind();this.setSessionView(false);this.load(); }
 status(message) { document.getElementById('status').textContent=message; }
 githubStatus(message) { document.getElementById('githubStatus').textContent=message; const login=document.getElementById('loginStatus');if(login)login.textContent=message; }
 setSessionView(connected) {
  const login=document.getElementById('loginView'),editor=document.getElementById('editorView');if(!login||!editor)return;
  login.hidden=connected;editor.hidden=!connected;document.title=connected?'Atelier · Neurologie':'Connexion · Neurologie';
  if(typeof window!=='undefined')window.history.replaceState(null,'',connected?'./cms.html':'./connexion.html');
  document.getElementById(connected?'save':'githubToken').focus();
 }
 async load() {
  try {
   const response=await fetch('./cv-data.json',{cache:'no-cache'});
   if(!response.ok) throw new Error();
   this.data=validateData(await response.json());
  } catch { this.status('Données publiées indisponibles : exemple chargé.'); }
  try {
   const draft=JSON.parse(localStorage.getItem(STORAGE_KEY));
   if(draft?.data) {this.data=validateData(draft.data);this.baseSha=draft.baseSha || null;this.hasDraft=true;}
  } catch { this.status('Le brouillon local était invalide. Données publiées chargées.'); }
  this.render();this.preview();this.status(this.hasDraft?'Brouillon local restauré. Il n’est pas encore publié.':'Contenu du site chargé. Modifiez puis sauvegardez ou publiez.');
 }
 bind() {
  const byId=(id,fn)=>document.getElementById(id).addEventListener('click',fn);
  byId('save',()=>this.save());
  byId('publish',()=>this.publish());
  document.getElementById('loginForm').addEventListener('submit',event=>{event.preventDefault();this.connect();});
  byId('disconnect',()=>this.disconnect());
  byId('export',()=>this.export());
  byId('demo',()=>{if(confirm('Remplacer le brouillon par l’exemple fictif ?')){this.data=clone(defaultData);this.dirty=true;this.render();this.save();}});
  byId('published',()=>{if(confirm('Remplacer votre brouillon par le contenu actuellement publié ?')){try{localStorage.removeItem(STORAGE_KEY);}catch{}this.baseSha=null;this.hasDraft=false;this.dirty=false;this.disconnect();this.load();}});
  document.getElementById('import').addEventListener('change',event=>this.import(event));
  document.getElementById('fields').addEventListener('change', async event=>{
   if(event.target.id!=='photoFile')return;
   try {
    const file=event.target.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15000000)throw new Error('Choisissez une image JPEG, PNG ou WebP de moins de 15 Mo.');
    const bitmap=await createImageBitmap(file), canvas=document.createElement('canvas');
    const ratio=Math.min(1,800/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));if(!blob||blob.size>700000)throw new Error('Image trop volumineuse après conversion.');
    const reader=new FileReader();reader.onload=()=>{this.data.general.photo=reader.result;this.data.general.showPhoto=true;this.dirty=true;this.render();this.preview();this.status('Photo importée · sauvegardez ou publiez.');};reader.readAsDataURL(blob);
   }catch(error){this.status(error.message);}
  });
  document.getElementById('previewPage').addEventListener('change',event=>{
   this.frame.src=event.target.value==='consult'?'./consultations.html?preview=1':'./index.html?preview=1';
  });
  document.getElementById('fields').addEventListener('input',event=>{
   const path=event.target.dataset.path;
   if(!path) return;
   const parts=path.split('.');
   let obj=this.data;
   for(const part of parts.slice(0,-1)) obj=obj[part];
   obj[parts.at(-1)]=event.target.type==='checkbox'?event.target.checked:event.target.type==='number'?Number(event.target.value):event.target.value;
   this.dirty=true;this.preview();this.status('Modifications en cours · sauvegardez votre brouillon ou publiez.');
  });
  document.getElementById('fields').addEventListener('click',event=>{
   const button=event.target.closest('button[data-list]');
   if(!button)return;
   const key=button.dataset.list,index=Number(button.dataset.index);
   if(button.dataset.action==='add'){const item=clone(defaultData[key][0]);for(const field of Object.keys(item)){if(typeof item[field]==='string')item[field]='';}item.visible=true;this.data[key].push(item);}
   if(button.dataset.action==='remove'){if(!confirm('Supprimer cet élément du brouillon ?'))return;this.data[key].splice(index,1);}
   if(button.dataset.action==='up' && index>0)[this.data[key][index-1],this.data[key][index]]=[this.data[key][index],this.data[key][index-1]];
   if(button.dataset.action==='down' && index<this.data[key].length-1)[this.data[key][index+1],this.data[key][index]]=[this.data[key][index],this.data[key][index+1]];
   this.dirty=true;this.render();this.preview();this.status('Liste modifiée · pensez à sauvegarder ou publier.');
  });
  document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{
   this.frame.style.width=button.dataset.width==='full'?'100%':button.dataset.width+'px';
   document.querySelectorAll('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  this.frame.addEventListener('load',()=>this.preview());
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===this.frame.contentWindow&&event.data?.type==='neuro-ready')this.preview();});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='s'){event.preventDefault();this.save();}});
  window.addEventListener('pagehide',()=>{this.token=null;document.getElementById('githubToken').value='';});
  window.addEventListener('beforeunload',event=>{if(this.dirty){event.preventDefault();event.returnValue='';}});
 }
 field(key,value,path) {
  const id='field-'+path.replaceAll('.','-'), label=labels[key]||key;
  if(typeof value==='boolean') return `<label class="field-toggle" for="${id}">${e(label)}<input role="switch" type="checkbox" id="${id}" data-path="${path}" ${value?'checked':''}></label>`;
  if(Object.hasOwn(SIZE_SETTINGS,key)){const s=SIZE_SETTINGS[key];return `<label for="${id}">${e(s.label)}</label><input type="number" id="${id}" data-path="${path}" min="${s.min}" max="${s.max}" step="1" value="${value}"><p class="help">De ${s.min} à ${s.max} px · défaut : ${s.default} px. Aperçu immédiat sur les deux pages.</p>`;}
  if(key==='typography')return `<label for="${id}">Typographie</label><select id="${id}" data-path="${path}">${Object.entries(FONT_CHOICES).map(([k,f])=>`<option value="${k}" ${k===value?'selected':''}>${e(f.label)}</option>`).join('')}</select><p class="help">Trois associations professionnelles, avec un texte courant lisible. Le choix s’applique aux deux pages.</p>`;
  if(key==='background')return `<label for="${id}">Couleur de fond</label><select id="${id}" data-path="${path}">${Object.entries(PALETTES).map(([k,p])=>`<option value="${k}" ${k===value?'selected':''}>${e(p.label)}</option>`).join('')}</select><div class="palette-swatches" aria-hidden="true">${Object.entries(PALETTES).map(([k,p])=>`<span title="${e(p.label)}" style="background:${p.paper};${k===value?'outline:2px solid #183e37':''}"></span>`).join('')}</div><p class="help">Teintes claires sélectionnées pour leur contraste avec le texte. L’ivoire est le choix par défaut.</p>`;
  if(key==='photo')return `<label for="${id}">${e(label)}</label><input id="${id}" data-path="${path}" value="${e(value.startsWith('data:')?'':value)}" placeholder="Image importée ou adresse HTTPS"><label class="file-button">Importer une photo<input id="photoFile" type="file" accept="image/jpeg,image/png,image/webp" hidden></label><p class="help">JPEG, PNG ou WebP · 15 Mo maximum. La photo est optimisée puis incluse dans le contenu publié.</p>`;
  return `<label for="${id}">${e(label)}</label>${longFields.has(key)?`<textarea id="${id}" data-path="${path}">${e(value)}</textarea>`:`<input id="${id}" data-path="${path}" value="${e(value)}">`}`;
 }
 render() {
  const open=new Set(Array.from(document.querySelectorAll('#fields>details[open]')).map(d=>d.dataset.section));
  document.getElementById('fields').innerHTML=sections.map(([key,title])=>{
   const value=this.data[key];
   const fields=Array.isArray(value)?value.map((item,index)=>`<article class="list-item"><div class="item-heading"><h3>${e(item.name||item.title||item.question||item.label||'Nouvel élément')} <small>· ${index+1}</small></h3></div>${Object.entries(item).map(([k,v])=>this.field(k,v,key+'.'+index+'.'+k)).join('')}<div class="item-actions"><button data-list="${key}" data-index="${index}" data-action="up" aria-label="Monter l’élément ${index+1}" ${index===0?'disabled':''}>↑ Monter</button><button data-list="${key}" data-index="${index}" data-action="down" aria-label="Descendre l’élément ${index+1}" ${index===value.length-1?'disabled':''}>↓ Descendre</button><button class="danger" data-list="${key}" data-index="${index}" data-action="remove">Supprimer</button></div></article>`).join('')+`<button data-list="${key}" data-action="add">+ Ajouter un élément</button>`:Object.entries(value).map(([k,v])=>this.field(k,v,key+'.'+k)).join('');
   return `<details data-section="${key}" ${open.has(key)||key==='maintenance'?'open':''}><summary>${e(title)}${Array.isArray(value)?' ('+value.length+')':''}</summary>${fields}</details>`;
  }).join('');
 }
 preview() { this.frame.contentWindow?.postMessage({type:'neuro-preview',data:this.data},location.origin); }
 save() {
  try { this.data=validateData(this.data); }
  catch(error){this.status('Brouillon non enregistré : '+error.message);return;}
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify({data:this.data,baseSha:this.baseSha}));this.dirty=false;this.hasDraft=true;this.status('Brouillon sauvegardé dans ce navigateur · '+new Date().toLocaleTimeString('fr-BE'));this.preview(); }
  catch { this.status('Sauvegarde locale impossible. Exportez un JSON pour conserver vos modifications.'); }
 }
 export() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(this.data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='neurologue-contenu.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async import(event) {
  try {const file=event.target.files[0];if(!file)return;if(file.size>2000000)throw new Error('Fichier trop volumineux (2 Mo maximum).');const next=validateData(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));this.data=next;this.dirty=true;this.render();this.save();}
  catch(error){this.status('Import refusé : '+error.message);}finally{event.target.value='';}
 }
 headers() {return {Authorization:'Bearer '+this.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};}
 endpoint() {return 'https://api.github.com/repos/'+REPOSITORY+'/contents/public/cv-data.json';}
 async remote() {
  const response=await fetch(this.endpoint()+'?ref=main',{headers:this.headers(),cache:'no-store'});
  if(!response.ok)throw new Error('Lecture du dépôt impossible ('+response.status+'). Vérifiez le dépôt et les droits Contents.');
  return response.json();
 }
 async connect() {
  const input=document.getElementById('githubToken');const token=input.value.trim();input.value='';
  if(!/^(github_pat_|ghp_)[A-Za-z0-9_]+$/.test(token))return this.githubStatus('Veuillez saisir un token GitHub valide.');
  this.token=token;const connectButton=document.getElementById('connect');if(connectButton)connectButton.disabled=true;this.githubStatus('Connexion en cours…');
  try {
   const response=await fetch('https://api.github.com/user',{headers:this.headers()});
   if(!response.ok)throw new Error('Jeton invalide ou expiré.');
   const user=await response.json();if(user.login.toLowerCase()!=='optimist97')throw new Error('Ce token ne permet pas d’accéder à cet éditeur.');
   const remote=await this.remote();this.remoteSha=remote.sha;
   if((this.hasDraft||this.dirty)&&this.baseSha&&this.baseSha!==remote.sha)throw new Error('Le contenu distant a changé depuis ce brouillon. Exportez votre brouillon et rechargez le site publié avant de fusionner vos modifications.');
   if(!this.hasDraft&&!this.dirty){this.data=validateData(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(remote.content.replace(/\s/g,'')),c=>c.charCodeAt(0)))));this.render();this.preview();}
   this.baseSha=remote.sha;this.setSessionView(true);document.getElementById('disconnect').disabled=false;document.getElementById('publish').disabled=false;this.githubStatus('Connecté à '+REPOSITORY+'. Modifiez les champs puis cliquez sur Publier sur GitHub pour mettre le site à jour.');
  } catch(error){this.token=null;document.getElementById('publish').disabled=true;document.getElementById('disconnect').disabled=true;this.githubStatus(error.message);}finally{const button=document.getElementById('connect');if(button)button.disabled=false;}
 }
 disconnect(){this.setSessionView(false);this.token=null;this.remoteSha=null;document.getElementById('githubToken').value='';document.getElementById('disconnect').disabled=true;document.getElementById('publish').disabled=true;this.githubStatus('Déconnecté. Le jeton a été retiré de la mémoire.');}
 async publish() {
  if(!this.token){this.githubStatus('Connectez GitHub pour publier. Vos modifications restent en brouillon.');document.getElementById('githubToken').focus();return;}
  const button=document.getElementById('publish');button.disabled=true;this.githubStatus('Publication en cours…');
  try {
   const data=validateData(this.data), remote=await this.remote();
   if(remote.sha!==this.baseSha)throw new Error('Une autre modification a été publiée. Exportez votre brouillon et rechargez le site publié pour éviter de l’écraser.');
   const bytes=new TextEncoder().encode(JSON.stringify(data,null,2)+'\n');
   let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
   const response=await fetch(this.endpoint(),{method:'PUT',headers:{...this.headers(),'Content-Type':'application/json'},body:JSON.stringify({message:'Mettre à jour le site de neurologie depuis le CMS',content:btoa(binary),sha:remote.sha,branch:'main'})});
   if(!response.ok){const error=await response.json();throw new Error(response.status===403?'Ce jeton ne permet pas de publier. Autorisez le dépôt neurologue et la permission Contents : lecture et écriture.':error.message||'Publication refusée ('+response.status+').');}
   const result=await response.json();this.baseSha=result.content.sha;this.remoteSha=this.baseSha;this.save();this.githubStatus('Contenu publié sur GitHub ✓ Le déploiement Pages démarre. Le site sera mis à jour après sa réussite.');
  }catch(error){this.githubStatus('Publication interrompue : '+error.message);}finally{button.disabled=false;}
 }
}
if(typeof document!=='undefined')window.app=new App();
export { App };



