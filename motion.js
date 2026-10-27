'use strict';
// Page and interaction contexts own their animations, including route teardown.
window.CanalettoMotion = (() => {
  const engine = window.gsap;
  const plugin = window.ScrollTrigger;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let media, interactions, refreshFrame;
  const closing = new WeakMap();
  const nodes = (selector, root = document) => [...root.querySelectorAll(selector)];
  const enabled = () => engine && plugin && !reduced.matches;
  if (engine && plugin) engine.registerPlugin(plugin);
  // Lenis (v1.1.13): scroll morbido mosso dal ticker GSAP, così ScrollTrigger resta in sync.
  // Spento con reduced motion; dentro i dialog lo scroll resta nativo.
  const lenis = window.Lenis && engine && plugin && !reduced.matches
    ? new window.Lenis({lerp: 0.1, prevent: node => node.closest?.('dialog')}) : null;
  if (lenis) {
    lenis.on('scroll', plugin.update);
    engine.ticker.add(time => lenis.raf(time * 1000));
    engine.ticker.lagSmoothing(0);
  }

  function cleanup() {
    cancelAnimationFrame(refreshFrame);
    media?.revert();
    interactions?.revert();
    media = interactions = null;
  }
  function refresh() {
    if (!plugin) return;
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => plugin.refresh());
  }
  function run(callback) {
    if (!enabled()) return;
    interactions ||= engine.context(() => {});
    interactions.add(callback);
  }
  function enter(target, distance = 14) {
    if (!target) return;
    const items = typeof target === 'string' ? nodes(target) : [target];
    if (!items.length) return;
    run(() => engine.fromTo(items, {opacity: 0, y: distance}, {
      opacity: 1, y: 0, duration: 0.38, stagger: 0.045,
      ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform'
    }));
  }
  function image(target) {
    if (!target) return;
    const source = target.getAttribute('src');
    const reveal = () => {
      if (target.isConnected && target.getAttribute('src') === source) enter(target, 0);
    };
    if (target.complete) reveal();
    else target.addEventListener('load', reveal, {once: true});
  }
  function open(dialog) {
    run(() => {
      engine.fromTo(dialog, {opacity: 0, y: 18}, {
        opacity: 1, y: 0, duration: 0.4, ease: 'power3.out',
        overwrite: true, clearProps: 'opacity,transform'
      });
      if (dialog.id === 'menu-dialog') {
        engine.fromTo(nodes('.menu-links a, .menu-bottom', dialog), {opacity: 0, y: 22}, {
          opacity: 1, y: 0, stagger: 0.055, delay: 0.07, duration: 0.48,
          ease: 'power3.out', overwrite: true, clearProps: 'opacity,transform'
        });
      }
    });
  }
  function close(dialog, immediately = false, focusTarget) {
    if (!dialog?.open) return;
    closing.get(dialog)?.kill();
    const finish = () => {
      closing.delete(dialog);
      dialog.close();
      if (engine) engine.set(dialog, {clearProps: 'opacity,transform'});
      if (focusTarget?.isConnected) focusTarget.focus();
    };
    if (immediately || !enabled()) { finish(); return; }
    run(() => closing.set(dialog, engine.to(dialog, {
      opacity: 0, y: 10, duration: 0.18, ease: 'power1.in',
      overwrite: true, onComplete: finish
    })));
  }
  function mount() {
    cleanup();
    // The route render jumps to the top natively: drop any smooth scroll still running.
    lenis?.scrollTo(window.scrollY, {immediate: true, force: true});
    if (!engine || !plugin) return;
    interactions = engine.context(() => {});
    media = engine.matchMedia();
    media.add({desktop: '(min-width: 901px)', small: '(max-width: 900px)',
      reduce: '(prefers-reduced-motion: reduce)'}, context => {
      const {desktop, reduce} = context.conditions;
      const disposeGuide = animateGuide(desktop, reduce);
      const video = document.querySelector('.hero video');
      if (reduce) {
        nodes('dialog[open]').forEach(dialog => {
          if (closing.has(dialog)) close(dialog, true);
        });
        interactions?.revert();
        interactions = engine.context(() => {});
        video?.pause();
        return disposeGuide;
      }
      animateIntroWords();
      animateGuideLight();
      video?.play().catch(() => {});
      const hero = document.querySelector('.hero');
      const title = hero?.querySelector('h1');
      const titleParts = title?.querySelectorAll('span');
      const opening = engine.timeline({defaults: {ease: 'power3.out'}});
      const heroMedia = hero?.querySelector('.hero-media');
      const contentDelay = heroMedia ? 0.85 : 0;
      if (heroMedia) {
        opening.fromTo(heroMedia, {scale: 0.6, yPercent: 45},
          {scale: 1, yPercent: 0, duration: 1.7,
            ease: 'expo.inOut', clearProps: 'transform'}, 0);
        opening.fromTo(heroMedia, {opacity: 0},
          {opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'opacity'}, 0);
        if (video) opening.fromTo(video, {scale: 1.2},
          {scale: 1, duration: 2, ease: 'power3.out', clearProps: 'transform'}, 0.25);
      }
      opening.fromTo(nodes('.header .brand, .header .tools'), {opacity: 0, y: -12},
        {opacity: 1, y: 0, duration: 0.65, stagger: 0.1, clearProps: 'opacity,transform'}, contentDelay);
      if (title) opening.fromTo(titleParts.length ? titleParts : title,
        {opacity: 0, y: desktop ? 32 : 20}, {opacity: 1, y: 0, duration: 0.85,
          stagger: 0.12, clearProps: 'opacity,transform'}, contentDelay + 0.18);
      const discovery = hero?.querySelector('.discovery');
      if (discovery) opening.fromTo(discovery, {opacity: 0, y: 20},
        {opacity: 1, y: 0, duration: 0.65, clearProps: 'opacity,transform'}, contentDelay + 0.45);

      const selectors = '.intro > *, .feature, .band-content > *, .line-section > h2, '+
        '.line-section > p, .line-card, .guide-band > h2, .guide-band > p, '+
        '.guide-choice, .editorial > *, .sample-box > *, '+
        '.benefits > *, .faq-head > *, .faq-grid details, .cta > *, '+
        '.footer-brand, .footer-grid > *, .values > div, .team-grid > *, '+
        '.manifesto > *, .staggered > div:not(.image-band) > *, .product-card, '+
        '.gallery-mosaic button, .specs > div, .technical > *, .contact-info > div, '+
        '.contact-section > *, .shop > *, .accessory-list > div, .projects-heading > *, '+
        '.project-entry > h2, .project-entry > p, .about-story > h2, .about-story p';
      // Batch only leaf selections; animating a parent and its child doubles displacement.
      const candidates = nodes(selectors).filter(el => !(desktop && el.closest('.mv')) && !el.hidden && !el.matches('[data-word-reveal]') && !el.closest('dialog') && !el.closest('.hp-project,.hp-sample,.hp-benefits .benefits'));
      const targets = candidates.filter(el => !candidates.some(parent => parent !== el && parent.contains(el)));
      engine.set(targets, {opacity: 0, y: desktop ? 26 : 16});
      plugin.batch(targets, {
        start: 'clamp(top 94%)', once: true, interval: 0.08, batchMax: desktop ? 4 : 2,
        onEnter: batch => context.add(() => engine.to(batch, {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.085,
          ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform'
        }))
      });
      const inView = targets.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * .94 && rect.bottom > 0;
      });
      if (inView.length) engine.to(inView,{opacity:1,y:0,duration:.65,stagger:.085,
        ease:'power2.out',overwrite:true,clearProps:'opacity,transform'});
      if (desktop) {
        nodes('.hero, .image-band').filter(frame => !frame.closest('.mv')).forEach(frame => {
          const visual = frame.querySelector(':scope > img, :scope > video');
          if (!visual) return;
          engine.fromTo(visual, {scale: 1.09, yPercent: -2}, {
            scale: 1.09, yPercent: 2, ease: 'none',
            scrollTrigger: {trigger: frame, start: 'clamp(top bottom)',
              end: 'clamp(bottom top)', scrub: 0.6, invalidateOnRefresh: true}
          });
        });
      }
      const disposeClouds = animateClouds(desktop);
      const disposeMission = animateMissionVision(desktop);
      animateWhyChoose(desktop);
      animateLinesTrack(desktop);
      animateAboutHero(desktop);
      // Values sta sopra il Manifesto: il suo pin va creato prima, altrimenti l'inizio del Manifesto
      // non tiene conto dello spazio aggiunto dal pin di Values.
      const disposeValues = animateValues(desktop) || (() => {});
      animateManifesto(desktop);
      if (video) plugin.create({trigger: hero, start: 'top bottom', end: 'bottom top',
        onToggle: self => self.isActive ? video.play().catch(() => {}) : video.pause()});
      refresh();
      return () => {disposeClouds();disposeGuide();disposeMission();disposeValues();};
    });
  }
  // Chi siamo, Mission/Vision (stile capsules.moyra.co): la sezione si blocca a schermo intero,
  // Mission sfuma, le foto scorrono a sinistra mentre la seconda si svela dall'alto con uno zoom,
  // Vision sale da sotto nella metà destra. Lo scroll guida la timeline e scatta su inizio/fine.
  function animateMissionVision(desktop) {
    const section = document.querySelector('.staggered.mv');
    if (!desktop || !section) return () => {};
    const [mission, band1, band2, vision] = section.children;
    const img1 = band1.querySelector('img'), img2 = band2.querySelector('img');
    section.classList.add('is-pinned');
    engine.timeline({
      defaults: {ease: 'sine.inOut', duration: 1},
      scrollTrigger: {trigger: section, start: 'top top', end: '+=100%', pin: true, scrub: 0.8,
        snap: {snapTo: 1, duration: {min: 0.35, max: 0.9}, delay: 0.05, ease: 'sine.inOut'},
        invalidateOnRefresh: true}
    })
      .to(mission, {scale: 0.9, opacity: 0}, 0)
      .to([band1, band2], {xPercent: -100, x: -8}, 0)
      .fromTo(band2, {clipPath: 'inset(0% 0% 100% 0% round 16px)'}, {clipPath: 'inset(0% 0% 0% 0% round 16px)'}, 0)
      .fromTo(img2, {scale: 1.5}, {scale: 1}, 0)
      .to(img1, {scale: 1.31}, 0)
      .fromTo(vision, {yPercent: 100}, {yPercent: 0}, 0)
      .fromTo(vision.children, {y: 60, opacity: 0}, {y: 0, opacity: 1, duration: 0.5, stagger: 0.08}, 0.45);
    return () => section.classList.remove('is-pinned');
  }
  // Home, "Perché scegliere": la sezione resta ferma per due schermate e accende i tre motivi in sequenza.
  // Chi siamo, hero stile wolverineworldwide.com/about-us: lo scroll porta --p da 0 a 1 e il CSS
  // fa il resto (foto che si stacca, titoli che salgono e diventano neri, linee e testi).
  // Sotto 900px la griglia è statica.
  function animateAboutHero(desktop) {
    const section = document.querySelector('.about-hero');
    if (!desktop || !section) return;
    engine.fromTo(section, {'--p': 0}, {'--p': 1, ease: 'none',
      scrollTrigger: {trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6}});
  }
  // Chi siamo, Manifesto: la sezione si ferma e una lama di luce scorre sul titolo accendendolo,
  // poi salgono le tre frasi. Sotto 900px il titolo resta acceso (--x:100% nel CSS).
  function animateManifesto(desktop) {
    const a = document.querySelector('.mf-a');
    if (a && desktop) {
      engine.timeline({scrollTrigger: {trigger: a, start: 'top top', end: '+=150%', pin: true, scrub: 0.6}})
        .fromTo(a, {'--x': '0%'}, {'--x': '100%', ease: 'none', duration: 1}, 0)
        .fromTo('.mf-a-beam', {opacity: 0}, {opacity: 1, duration: 0.1}, 0)
        .to('.mf-a-beam', {opacity: 0, duration: 0.15}, 0.9)
        .fromTo(nodes('.mf-a-cols p'), {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.35, stagger: 0.12}, 0.8);
    }
  }
  // Chi siamo, Values: la sezione si ferma; ogni carta sale dal fondo con le lettere del titolo che
  // salgono dalla maschera, mentre le precedenti arretrano e restano visibili in alto. Niente snap: litiga con Lenis.
  function animateValues(desktop) {
    const section = document.querySelector('.vl-d');
    if (!desktop || !section) return;
    const cards = nodes('.vl-d-card', section), count = section.querySelector('.vl-d-count b'), steps = cards.length - 1;
    section.classList.add('is-pinned');
    const tl = engine.timeline({defaults: {ease: 'power2.inOut', duration: 1},
      scrollTrigger: {trigger: section, start: 'top top', end: '+=' + steps * 70 + '%', pin: true, scrub: 0.6,
        onUpdate: self => { count.textContent = '0' + (Math.round(self.progress * steps) + 1); }}});
    engine.set(cards.slice(1), {yPercent: 115, rotation: 3});
    cards.forEach((card, i) => {
      if (!i) return;
      tl.to(card, {yPercent: 0, rotation: 0}, i - 1)
        .fromTo(nodes('.vl-c', card), {yPercent: 110}, {yPercent: 0, duration: 0.5, stagger: 0.02, ease: 'power3.out'}, i - 0.6)
        .fromTo(card.querySelector('.vl-d-line'), {scaleX: 0}, {scaleX: 1, duration: 0.5, ease: 'expo.inOut'}, i - 0.5);
      cards.slice(0, i).forEach((prev, j) => tl.to(prev, {scale: 1 - (i - j) * 0.04, y: -(i - j) * 13,
        backgroundColor: ['#e9e9e9', '#e0e0e0', '#d7d7d7', '#cecece', '#c5c5c5'][i - j - 1]}, i - 1));
    });
    return () => section.classList.remove('is-pinned');
  }
  // Home, linee: la sezione si blocca e i box scorrono in orizzontale fino al box della guida.
  function animateLinesTrack(desktop) {
    const section = document.querySelector('.hp-lines-h');
    if (!desktop || !section) return;
    const track = section.querySelector('.lh-track');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    engine.to(track, {x: () => -distance(), ease: 'none', scrollTrigger: {trigger: section,
      start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 0.6, invalidateOnRefresh: true,
      refreshPriority: 1}}); // created after the guide pin but sits above it on the page
  }
  // Home, barre sopra "Guida alla scelta": la luce si accende dal centro verso i lati e scende nei tagli.
  function animateGuideLight() {
    const bars = nodes('.guide-light i');
    if (!bars.length) return;
    engine.fromTo(bars, {scaleY: 0, '--on': 0}, {scaleY: 1, '--on': 1, ease: 'power2.out',
      stagger: {each: 0.06, from: 'center'},
      scrollTrigger: {trigger: bars[0].parentNode, start: 'top 90%', end: 'top 30%', scrub: 0.6}});
  }
  function animateWhyChoose(desktop) {
    const section = document.querySelector('.hp-why');
    if (!desktop || !section) return;
    plugin.create({trigger: section, start: 'top top', end: '+=200%', pin: true,
      onUpdate: self => { section.dataset.active = Math.min(2, Math.floor(self.progress * 3)); }});
  }
  function animateIntroWords() {
    nodes('[data-word-reveal]').forEach(paragraph => {
      if (!paragraph.querySelector('.scroll-word')) {
        // Split text nodes only, preserving the heading's explicit line break.
        Array.from(paragraph.childNodes).forEach(node => {
          if (node.nodeType !== 3) return;
          const fragment = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(token => {
            if (!token) return;
            if (/^\s+$/.test(token)) fragment.append(document.createTextNode(token));
            else {
              const word = document.createElement('span');
              word.className = 'scroll-word';
              word.textContent = token;
              fragment.append(word);
            }
          });
          node.replaceWith(fragment);
        });
      }
      const words = nodes('.scroll-word', paragraph);
      engine.set(words, {opacity: 0.15});
      engine.to(words, {
        opacity: 1, duration: 0.18, stagger: 0.055, ease: 'none',
        scrollTrigger: {trigger: paragraph, start: 'clamp(top 85%)',
          end: 'clamp(bottom 40%)', scrub: 0.3, invalidateOnRefresh: true}
      });
    });
  }
  function animateGuide(desktop, reduce) {
    const section = document.querySelector('.hp-guide');
    if (!section) return () => {};
    const wheel = section.querySelector('.guide-wheel');
    const options = nodes('.wheel-option', wheel);
    if(!reduce)section.dataset.guideScroll='';
    const position = {value:reduce?2:0};
    let radius = Math.max(70,(wheel.clientHeight / 2 - (desktop?65:40))*.7);
    const ticks = nodes('.guide-ruler i',section).map(tick=>engine.quickSetter(tick,'scaleX'));
    let scrollDrive, hovered=false;
    engine.set(options,{xPercent:-50,y:0,scaleX:1,scaleY:1,opacity:1});
    const setters = options.map(option=>({
      y:engine.quickSetter(option,'y','px'),xScale:engine.quickSetter(option,'scaleX'),
      yScale:engine.quickSetter(option,'scaleY'),opacity:engine.quickSetter(option,'opacity')
    }));
    const paint = () => {
      const selected = engine.utils.clamp(0,options.length-1,Math.round(position.value));
      section.dataset.guideSelection = selected;
      ticks.forEach((set,i)=>{
        const distance = (i%41)/40-position.value/(options.length-1);
        set(.4+.6*Math.exp(-Math.pow(distance/.045,2)));
      });
      options.forEach((option,i) => {
        const angle = (i-position.value)*Math.PI/4.4;
        const depth = Math.max(.025,Math.cos(angle));
        const exposed = Math.abs(angle)<Math.PI/2;
        setters[i].y(Math.sin(angle)*radius);
        setters[i].xScale(.78+.22*depth);setters[i].yScale(depth);
        setters[i].opacity(exposed?(i===selected?1:.045):0);
        option.style.pointerEvents=exposed?'auto':'none';
        option.classList.toggle('is-selected',i===selected);
        option.setAttribute('aria-pressed',i===selected);
        option.tabIndex = i===selected ? 0 : -1;
      });
    };
    paint();
    if(!reduce)scrollDrive=engine.fromTo(position,{value:0},{value:options.length-1,
      duration:1,ease:'none',onUpdate:paint,
      scrollTrigger:{id:'home-guide-wheel',trigger:section,start:'top top',
        end:()=>'+='+Math.max(800,window.innerHeight*1.3),pin:true,pinSpacing:true,
        scrub:.35,anticipatePin:1,invalidateOnRefresh:true,
        onRefresh:()=>{radius=Math.max(70,(wheel.clientHeight/2-(desktop?65:40))*.7);paint();}}});
    const choose = (index, focus = false) => {
      index = engine.utils.clamp(0,options.length-1,index);
      if(reduce){position.value=index;paint();}
      else{
        const trigger=scrollDrive.scrollTrigger;
        window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*index/(options.length-1),behavior:'instant'});
      }
      if (focus) options[index].focus({preventScroll:true});
    };
    const click = event => {
      const option = event.target.closest('[data-wheel-index]');
      if (option) choose(Number(option.dataset.wheelIndex));
    };
    const key = event => {
      let index = Math.round(position.value);
      if (event.key==='ArrowDown' || event.key==='ArrowRight') index++;
      else if (event.key==='ArrowUp' || event.key==='ArrowLeft') index--;
      else if (event.key==='Home') index=0;
      else if (event.key==='End') index=4;
      else return;
      event.preventDefault();choose(index,true);
    };
    const preview=document.createElement('div');
    preview.className='guide-hover-preview';preview.setAttribute('aria-hidden','true');
    const previewImage=document.createElement('img');previewImage.alt='';
    preview.append(previewImage);document.body.append(preview);
    const xTo=engine.quickTo(preview,'x',{duration:.18,ease:'power3.out'});
    const yTo=engine.quickTo(preview,'y',{duration:.18,ease:'power3.out'});
    const move = event => {
      if(!hovered)return;
      const x=engine.utils.clamp(12,window.innerWidth-272,event.clientX+24);
      const y=engine.utils.clamp(12,window.innerHeight-192,event.clientY+24);
      if(reduce)engine.set(preview,{x,y});else{xTo(x);yTo(y);}
    };
    const over = event => {
      const option=event.target.closest('[data-wheel-index]');
      if(!option || event.pointerType!=='mouse' || !desktop)return;
      if(option.contains(event.relatedTarget))return;
      hovered=true;
      previewImage.src=option.dataset.wheelImage;
      engine.set(preview,{x:engine.utils.clamp(12,window.innerWidth-272,event.clientX+24),
        y:engine.utils.clamp(12,window.innerHeight-192,event.clientY+24)});
      engine.to(preview,{autoAlpha:1,scale:1,duration:reduce?0:.2,overwrite:'auto'});
    };
    const out = event => {
      const option=event.target.closest('[data-wheel-index]');
      if(!option || option.contains(event.relatedTarget))return;
      hovered=false;engine.to(preview,{autoAlpha:0,duration:reduce?0:.15,overwrite:'auto'});
    };
    wheel.addEventListener('click',click);
    wheel.addEventListener('keydown',key);
    wheel.addEventListener('pointerover',over);wheel.addEventListener('pointerout',out);
    wheel.addEventListener('pointermove',move);
    return () => {
      scrollDrive?.scrollTrigger?.kill();scrollDrive?.kill();xTo.tween.kill();yTo.tween.kill();
      delete section.dataset.guideScroll;
      engine.killTweensOf(preview);preview.remove();
      wheel.removeEventListener('pointerover',over);wheel.removeEventListener('pointerout',out);
      wheel.removeEventListener('pointermove',move);
      wheel.removeEventListener('click',click);
      wheel.removeEventListener('keydown',key);
      options.forEach((option,i)=>{option.setAttribute('aria-pressed',i===2);option.tabIndex=i===2?0:-1;option.classList.remove('is-selected');});
    };
  }
  function animateClouds(desktop) {
    const disposers = [];
    nodes('.project-cloud').forEach(section => {
      const field = section.querySelector('.cloud-field');
      const particles = nodes('.cloud-particle',field).filter(tile => getComputedStyle(tile).display !== 'none');
      const height = field.clientHeight;
      // Each tile wraps beyond the clipped edges, preserving a seamless upward flow.
      const floats = particles.map((tile,i) => {
        const size = tile.offsetWidth;
        const travel = height + size;
        const start = height * Number(tile.dataset.cloudSeed) / 100;
        const wrap = engine.utils.wrap(-size,height);
        engine.set(tile,{top:0});
        return engine.fromTo(tile,{y:start},{y:start-travel,
          duration:(desktop?28:38)+(i%7)*3,repeat:-1,ease:'none',paused:true,
          modifiers:{y:value=>wrap(parseFloat(value))+'px'}});
      });
      let visible = false;
      const sync = () => floats.forEach(tween => visible && !document.hidden ? tween.resume() : tween.pause());
      plugin.create({trigger:section,start:'top bottom',end:'bottom top',
        onToggle:self=>{visible=self.isActive;sync();},
        onRefresh:self=>{visible=self.isActive;sync();}});
      engine.fromTo(field,{y:desktop?90:36},{y:desktop?-90:-36,ease:'none',
        scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:.8}});
      document.addEventListener('visibilitychange',sync);
      disposers.push(()=>document.removeEventListener('visibilitychange',sync));
    });
    return () => disposers.forEach(dispose=>dispose());
  }
  document.addEventListener('load', event => {
    if (event.target.matches?.('#main img')) refresh();
  }, true);
  document.addEventListener('toggle', event => {
    if (event.target.matches?.('details')) {
      if (event.target.open) enter(event.target.querySelector('p'), 8);
      refresh();
    }
  }, true);
  document.addEventListener('focusin', event => {
    if (!enabled()) return;
    let element = event.target;
    while (element && element !== document.body) {
      if (element.style.opacity === '0') {
        engine.killTweensOf(element);
        engine.set(element, {clearProps: 'opacity,transform'});
      }
      element = element.parentElement;
    }
  });
  document.fonts?.ready.then(refresh);
  return {cleanup, mount, refresh, enter, image, open, close};
})();
