'use strict';
(() => {
  const gsap = window.gsap;
  if (!gsap || !window.IntersectionObserver) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = new Map();
  const selector = '.button,.laser-box';
  function sync(button, state) {
    const visible = state.visible && !document.hidden &&
      (!button.closest('dialog') || button.closest('dialog').open);
    if (reduced.matches) {
      state.tween?.kill();
      state.tween = null;
      button.style.removeProperty('--laser-angle');
      return;
    }
    // Keep the laser independent from reveal tweens that overwrite the button.
    if (visible && !state.tween) state.tween = gsap.fromTo(state.rotor,
      {angle:0}, {angle:360,duration:3.2,repeat:-1,ease:'none',paused:true,
        onUpdate:()=>button.style.setProperty('--laser-angle',state.rotor.angle+'deg')});
    if (visible) state.tween?.resume();
    else state.tween?.pause();
  }
  const viewport = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = buttons.get(entry.target);
      if (!state) return;
      state.visible = entry.isIntersecting;
      sync(entry.target, state);
    });
  });
  function register(root) {
    const found = root.matches?.(selector) ? [root] : [];
    found.push(...root.querySelectorAll(selector));
    found.forEach(button => {
      if (buttons.has(button)) return;
      buttons.set(button, {visible:false,tween:null,rotor:{angle:0}});
      viewport.observe(button);
    });
  }
  // Dynamic views and dialog contents share the effect without retaining removed buttons.
  const changes = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'attributes') {
        record.target.querySelectorAll(selector).forEach(button => {
          const state = buttons.get(button);
          if (state) sync(button, state);
        });
      } else record.addedNodes.forEach(node => {
        if (node.nodeType === 1) register(node);
      });
    });
    buttons.forEach((state, button) => {
      if (!button.isConnected) {
        state.tween?.kill();
        viewport.unobserve(button);
        buttons.delete(button);
      }
    });
  });
  register(document);
  changes.observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  const syncAll = () => buttons.forEach((state,button) => sync(button,state));
  reduced.addEventListener('change',syncAll);
  document.addEventListener('visibilitychange',syncAll);
})();
