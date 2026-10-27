'use strict';
function homeView() {
  const lineDescriptions = [
    'Luce indiretta e dettagli architettonici, con libertà di forma.',
    'Luce indiretta e profili che nascondono lo spessore della lastra.',
    'Profili essenziali per integrare la luce e definire le finiture.',
    'Tagli di luce, velette e nicchie in continuità con il cartongesso.',
    'Botole a scomparsa in alluminio e cartongesso.'
  ];
  const benefits = [
    ['Posa semplificata','Profili e accessori studiati per facilitare il lavoro in cantiere e ridurre le rilavorazioni.'],
    ['Finiture precise','Allineamenti puliti e continuità delle superfici, per valorizzare ogni dettaglio.'],
    ['Supporto tecnico','Un confronto concreto per individuare la soluzione adatta al progetto e alla posa.']
  ];
  const guideImages = [photos.project2[0],photos.project3[0],'940f6b7a5b29ce7741c702f3120404a0',photos.project4[0],lines[3].id];
  // Barre di luce sopra la guida: più lunghe e chiare al centro, si accendono dal centro allo scroll (motion.js).
  const guideLight = Array.from({length:27},(_,i)=>{const d=Math.abs(i-13)/13;return `<i style="--len:${Math.round(40+120*(1-d**1.6))}px;--o:${(.12+.88*(1-d)**1.4).toFixed(2)}"></i>`;}).join('');
  const guideBars = Array.from({length:41},(_,i)=>`<i style="--bar-size:${6+Math.pow(Math.sin(i/40*Math.PI),10)*30}px"></i>`).join('');
  const faqLeft = faqItems.slice(0,5);
  const faqRight = [faqItems[5],
    ['Perché prendere in considerazione il sistema Canaletto?','Il team può aiutarti a confrontare le soluzioni disponibili in base a geometria, effetto luminoso e posa del progetto.'],
    ['Perché la scelta di composito minerale, cartongesso e alluminio?','Ogni linea usa materiali dedicati alla propria applicazione. Consulta la documentazione ufficiale della configurazione per scegliere il sistema adatto.'],
    ['Le caratteristiche dei materiali Canaletto variano nel tempo?','Per durabilità, condizioni di utilizzo e manutenzione, richiedi la scheda tecnica del prodotto al nostro team.'],
    ['A che interasse bisogna fissare gli squadretti?','L’interasse va verificato nelle istruzioni di posa ufficiali del profilo e del kit scelti. Contatta il supporto tecnico per la tua configurazione.']
  ];
  const faqRows = faqLeft.flatMap((item,i)=>[item,faqRight[i]]);
  return hero('Luce come linguaggio','',true)+
    `<section class="intro hp-intro"><h2 data-word-reveal>La luce prende forma.<br>L’architettura si distingue.</h2><p data-word-reveal>Progettiamo e produciamo profili e sistemi integrati per dare luce e forma agli spazi da vivere e condividere. Soluzioni nate dall’esperienza in cantiere, con la cura di ogni dettaglio, dalla posa alla finitura.</p>${link('Scopri Canaletto','chi-siamo','button soft')}</section>`+
    band('472875debd3162785fd7df558dd8fe47','Sistemi integrati per l’illuminotecnica','Profili per disegnare tagli di luce e illuminazione indiretta nel cartongesso.',link('Esplora le soluzioni','illuminotecnica'))+
    band('940f6b7a5b29ce7741c702f3120404a0','Sistemi integrati per secco e finiture','Botole e dettagli tecnici per dare continuità alle superfici.',link('Scopri i sistemi','catalogo'))+
    band('0467c954596f2afe05697b85cde58e18','Il tuo progetto, il suo profilo.','Sviluppiamo soluzioni su disegno per esigenze specifiche<br>di forma, posa e integrazione della luce.',link('Parlaci del tuo progetto','contatti'),true)+
    `<section class="hp-lines-h" id="linee" aria-label="Le nostre linee"><div class="lh-head container"><h2>Trova la soluzione<br>per il tuo progetto.</h2><p>Ogni dettaglio conta. Esplora le nostre linee e individua il sistema più adatto alle tue esigenze di progettazione e installazione.</p></div><div class="lh-track">${lines.map((line,i)=>`<a class="lh-card laser-box" href="#${lineRoute(line)}"><span class="lh-num">0${i+1}</span><h3>Linea ${line.name}</h3><p>${lineDescriptions[i]}</p>${image(line.id,'Sezione del profilo Linea '+line.name)}<span class="lh-link">Scopri la Linea ${line.name}${icon('arrow-right')}</span></a>`).join('')}<div class="lh-card lh-end"><h3>Non sai quale scegliere?</h3><p>Parti dall’effetto che vuoi ottenere: la guida ti porta alla linea giusta.</p><button class="button dark" data-action="guide">Apri la guida alla scelta${icon('arrow-right')}</button></div></div></section>`+
    `<section class="guide-band hp-guide"><div class="guide-ruler ruler-left" aria-hidden="true">${guideBars}</div><div class="guide-ruler ruler-right" aria-hidden="true">${guideBars}</div><div class="guide-light" aria-hidden="true">${guideLight}</div><h2>Guida alla scelta</h2><p>Quale soluzione serve al tuo progetto?<br>Parti dall’effetto che vuoi ottenere.</p><div class="guide-wheel" role="group" aria-label="Effetto da ottenere">${['Dettaglio Architettonico','Luce Indiretta','Accesso a Scomparsa','Tagli di Luce','Profili in Cartongesso'].map((text,i)=>`<button data-wheel-index="${i}" data-wheel-image="assets/${guideImages[i]}.webp" class="wheel-option wheel-${i}" aria-pressed="${i===2}" tabindex="${i===2?0:-1}">${text}</button>`).join('')}</div>${action('Trova il profilo giusto','guide','button hp-outline','settings')}</section>`+
    projectCloud()+
    `<section class="container hp-highlight"><div class="editorial hp-project">${image('785bfd42a7d9cb8735c79f8d506aaf2d','Sala riunioni con luce integrata')}<div><h2><span>Progetto in evidenza</span>Sala riunioni dell’azienda X</h2><p>Sviluppiamo soluzioni su misura per esigenze di cantiere, design e integrazione luminosa.</p>${link('Scopri di più','progetti','button hp-outline')}</div></div></section>`+
    `<section class="container hp-sample"><div class="sample-box"><div class="sample-copy"><span class="eyebrow">CANALETTO SAMPLE BOX</span><h2>La qualità prende forma.<br>Toccala con mano.</h2><p>Osserva i materiali, confronta le sezioni e scopri i dettagli dei profili <span class="accent">Canaletto</span>. Il campionario ti aiuta a valutare le soluzioni per il tuo prossimo progetto.</p></div>${image('8a5be4390d1bbb5d5316c887dfcf4b26','Canaletto Sample Box','sample-image')}<ul>${[['profiles','5 profili da scoprire'],['section','Sezioni reali'],['schema','Schemi tecnici'],['case','Pensato per i professionisti']].map(([glyph,text])=>`<li><span>${mgIcon(glyph)}</span>${text}</li>`).join('')}</ul><div class="sample-action">${action('Acquista il campionario','sample','button hp-outline','shopping-cart')}</div></div></section>`+
    whyChoose(benefits)+
    faqTopics([...faqLeft,...faqRight]);
}

function homeFooter() {
  return `<div class="hp-footer"><section class="cta"><h2>Diamo forma<br>al tuo prossimo progetto.</h2><p>Hai un’idea da realizzare? Parliamone.</p>${link('Parliamo del tuo progetto','contatti','button soft')}<a class="hp-mark" href="#home" aria-label="Canaletto, home"><img src="assets/brand-mark.svg" alt="Canaletto" width="160" height="166"></a></section><div class="footer-main"><div class="footer-grid"><div><small>CONTACT US</small><p><a href="mailto:info@canalettoitalia.com">info@canalettoitalia.com</a><br><a href="tel:+390802464644">080 2464644</a></p></div><div><small>VISIT US</small><p>70022 Altamura (BA)<br>S.P. 238 s. v. Tumo KM 57,5</p></div><div><small>FOLLOW US</small><div class="footer-social">${['LINKEDIN','INSTAGRAM','FACEBOOK','YOUTUBE','TIKTOK'].map(name=>`<button data-social="${name}">${name}</button>`).join('')}</div></div></div><div class="legal"><div>© 2026 Canaletto Smart S.r.l. · Tutti i diritti riservati.<br>Made in Never Before Italia</div><div>P. IVA IT07704780720 · REA: 575634 · PEC canalettosmart@gigapec.it<br>Capitale sociale € 30.000,00 I.V.</div><div><button data-legal="Privacy Policy">Privacy Policy</button> · <button data-legal="Cookie Policy">Cookie Policy</button> · <button data-legal="Accessibilità">Accessibilità</button></div></div></div></div>`;
}

// Perché scegliere: sezione bloccata, i tre motivi si accendono uno alla volta e la foto a destra cambia
// (lo stato data-active lo aggiorna motion.js con lo scroll; su mobile è una lista semplice).
const whyPhotos = ['c6dcabc9ce6250c20c009b3fc8dab711', 'dbfd80c3667515e07632611d1f30b2b2', '11874c90c311dff48f377e631c02ddad'];
function whyChoose(items) {
  return `<section class="hp-why" data-active="0"><div class="why-text"><h2 class="why-title">Perché scegliere<img src="assets/logo.svg" alt="Canaletto"></h2><ol>${items.map(([t,p],i)=>`<li><span class="why-num">0${i+1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join('')}</ol></div><div class="why-media">${whyPhotos.map(id=>`<img src="assets/${id}.webp" alt="" loading="lazy">`).join('')}</div></section>`;
}
// FAQ divise per argomento: a sinistra gli argomenti, a destra le domande dell'argomento scelto.
function faqTopics(rows) {
  const topics = [['Prodotto',[0,1,2,6]],['Materiali',[3,7,8]],['Posa',[4,9]],['Azienda',[5]]];
  const item = ([q,a]) => `<details><summary><span class="faq-q">${q}</span><i aria-hidden="true"></i></summary><p>${a} <a href="#contatti" class="text-button">Contattaci ${icon('arrow-right')}</a></p></details>`;
  return `<section class="hp-faqs"><div class="faqs-side"><h2>FAQ</h2><div class="faqs-tabs" role="tablist" aria-label="Argomenti">${topics.map(([n,ids],i)=>`<button type="button" role="tab" class="${i===0?'on':''}" aria-selected="${i===0}" data-faq-topic="${i}">${n}<sup>${ids.length}</sup></button>`).join('')}</div>${link('Non trovi la risposta? Scrivici','contatti','button dark')}</div><div class="faqs-panels">${topics.map(([,ids],i)=>`<div class="faqs-panel" role="tabpanel" data-faq-panel="${i}"${i?' hidden':''}>${ids.map(k=>item(rows[k])).join('')}</div>`).join('')}</div></section>`;
}
document.addEventListener('click', e => {
  const tab = e.target.closest?.('[data-faq-topic]');
  if (!tab) return;
  const root = tab.closest('.hp-faqs');
  root.querySelectorAll('[data-faq-topic]').forEach(b => { b.classList.toggle('on', b === tab); b.setAttribute('aria-selected', b === tab); });
  root.querySelectorAll('[data-faq-panel]').forEach(p => { p.hidden = p.dataset.faqPanel !== tab.dataset.faqTopic; });
});
