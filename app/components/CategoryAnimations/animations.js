/* ════════════════════════════════════════════════════════════════
   Category Explainer Animations — GSAP timelines
   ─────────────────────────────────────────────────────────────────
   One factory per category. Each returns a gsap.timeline() that loops
   indefinitely. We register them all with IntersectionObserver so
   off-screen cards pause and on-screen ones resume.
   ════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded'); return;
  }
  if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

  // Respect reduced motion: just stop here.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ────────────────────────────────────────────────────────────
     1. ESCORTS — Candleglow
     A candle that flickers; halo breathes; smoke curls and rises.
     ──────────────────────────────────────────────────────────── */
  function buildCandleglow() {
    const root = document.querySelector('#cat-escorts');
    if (!root) return null;

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });

    // halo breathing
    tl.to(root.querySelector('.esc-halo'), {
      scale: 1.08, opacity: 0.85,
      transformOrigin: '50% 50%',
      duration: 1.4, yoyo: true, repeat: -1
    }, 0);

    // flame flicker — irregular skew + scale (additive timeline of jitters)
    const flame = root.querySelector('.esc-flame');
    gsap.set(flame, { transformOrigin: '50% 100%' });
    const flickerTl = gsap.timeline({ repeat: -1 });
    [
      { scaleY: 1.05, scaleX: 0.95, skewX: -2, dur: 0.18 },
      { scaleY: 0.94, scaleX: 1.04, skewX:  3, dur: 0.22 },
      { scaleY: 1.10, scaleX: 0.92, skewX: -3, dur: 0.16 },
      { scaleY: 0.98, scaleX: 1.02, skewX:  1, dur: 0.20 },
      { scaleY: 1.04, scaleX: 0.97, skewX: -1, dur: 0.18 },
    ].forEach(k => flickerTl.to(flame, {
      scaleY: k.scaleY, scaleX: k.scaleX, skewX: k.skewX,
      duration: k.dur, ease: 'sine.inOut'
    }));

    // smoke wisps — drift up and dissipate
    const smokes = root.querySelectorAll('.esc-smoke');
    smokes.forEach((s, i) => {
      gsap.set(s, { y: 0, opacity: 0, scale: 0.8, transformOrigin: '50% 100%' });
      gsap.to(s, {
        y: -36, opacity: 0.6, scale: 1.4,
        duration: 3.6, repeat: -1, delay: i * 1.8,
        ease: 'power1.out',
        onRepeat: () => gsap.set(s, { y: 0, opacity: 0, scale: 0.8 })
      });
      gsap.to(s, {
        opacity: 0, duration: 1.6, repeat: -1, delay: i * 1.8 + 2,
        ease: 'power2.in'
      });
    });

    // monogram fade in/out softly — subtle background poetry
    root.querySelectorAll('.esc-mono').forEach((m, i) => {
      gsap.to(m, {
        opacity: 0.04, duration: 4, repeat: -1, yoyo: true,
        ease: 'sine.inOut', delay: i * 0.8
      });
    });

    return tl;
  }

  /* ────────────────────────────────────────────────────────────
     2. COMPANIONS — Silk Thread
     A gold thread breathes; hearts trace along it.
     ──────────────────────────────────────────────────────────── */
  function buildSilk() {
    const root = document.querySelector('#cat-companions');
    if (!root) return null;

    const thread = root.querySelector('#comp-thread');
    const shimmer = root.querySelector('#comp-thread-shimmer');
    const dots = root.querySelectorAll('.comp-dot');
    const h1 = root.querySelector('.comp-heart-1');
    const h2 = root.querySelector('.comp-heart-2');

    // measure for stroke-dasharray traversal
    const len = shimmer.getTotalLength ? shimmer.getTotalLength() : 220;
    gsap.set(shimmer, { strokeDasharray: `6 ${len}`, strokeDashoffset: 0 });

    // shimmer traveling along the thread
    gsap.to(shimmer, {
      strokeDashoffset: -len, duration: 3.4,
      ease: 'none', repeat: -1
    });

    // breathing thread (subtle stroke pulse)
    gsap.to(thread, {
      strokeWidth: 1.8, duration: 1.6,
      yoyo: true, repeat: -1, ease: 'sine.inOut'
    });

    // pulsing endpoint dots (alternating)
    dots.forEach((d, i) => {
      gsap.to(d, {
        scale: 1.4, transformOrigin: '50% 50%',
        duration: 1.2, yoyo: true, repeat: -1,
        ease: 'sine.inOut', delay: i * 0.6
      });
    });

    // heart travelers — use MotionPathPlugin if available
    if (window.MotionPathPlugin) {
      gsap.set([h1, h2], { opacity: 0 });
      gsap.to(h1, {
        motionPath: { path: '#comp-thread', start: 0, end: 1, align: '#comp-thread', alignOrigin: [0.5, 0.5] },
        opacity: 1, duration: 3.4, repeat: -1, ease: 'sine.inOut',
        keyframes: [
          { opacity: 0, duration: 0.0001 },
          { opacity: 1, duration: 0.6 },
          { opacity: 1, duration: 2.2 },
          { opacity: 0, duration: 0.6 },
        ],
      });
      gsap.to(h2, {
        motionPath: { path: '#comp-thread', start: 1, end: 0, align: '#comp-thread', alignOrigin: [0.5, 0.5] },
        opacity: 1, duration: 3.4, repeat: -1, ease: 'sine.inOut', delay: 1.7,
        keyframes: [
          { opacity: 0, duration: 0.0001 },
          { opacity: 0.65, duration: 0.6 },
          { opacity: 0.65, duration: 2.2 },
          { opacity: 0, duration: 0.6 },
        ],
      });
    } else {
      // fallback: dots just pulse
      gsap.to([h1, h2], { opacity: 0.7, scale: 1.2, yoyo: true, repeat: -1, duration: 1.5, ease: 'sine.inOut' });
    }

    return null;
  }

  /* ────────────────────────────────────────────────────────────
     3. NIGHTLIFE — Pulse Rings
     Concentric rings expand from a martini glass; olive sways.
     ──────────────────────────────────────────────────────────── */
  function buildPulse() {
    const root = document.querySelector('#cat-nightlife');
    if (!root) return null;

    const rings = root.querySelectorAll('.night-ring');
    const glass = root.querySelector('.night-glass');
    const olive = root.querySelector('.night-olive');
    const sparks = root.querySelectorAll('.night-spark');

    // pulse rings — radius + opacity from low to high
    rings.forEach((r, i) => {
      gsap.set(r, { attr: { r: 20 }, opacity: 0.9 });
      gsap.to(r, {
        attr: { r: 90 }, opacity: 0,
        duration: 2.2, repeat: -1, ease: 'power2.out',
        delay: i * 0.55
      });
    });

    // glass bass-pulse
    gsap.to(glass, {
      scale: 1.025, transformOrigin: '130px 130px',
      duration: 0.55, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });

    // olive sway
    gsap.to(olive, {
      x: 1.6, transformOrigin: '138px 93px',
      duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });

    // sparks twinkle
    sparks.forEach((s, i) => {
      gsap.set(s, { opacity: 0.4 });
      gsap.to(s, {
        opacity: 1, scale: 1.4, transformOrigin: '50% 50%',
        duration: 0.6 + i * 0.1, yoyo: true, repeat: -1,
        ease: 'sine.inOut', delay: i * 0.18
      });
    });

    return null;
  }

  /* ────────────────────────────────────────────────────────────
     4. CREATORS — Aperture
     Camera iris opens and closes; central light bursts.
     ──────────────────────────────────────────────────────────── */
  function buildAperture() {
    const root = document.querySelector('#cat-creators');
    if (!root) return null;

    const iris = root.querySelector('.apt-iris');
    const blades = root.querySelectorAll('.apt-blade');
    const glow = root.querySelector('.apt-glow');

    // iris rotates slowly
    gsap.to(iris, { rotation: 360, transformOrigin: '130px 100px', duration: 22, repeat: -1, ease: 'none' });

    // each blade opens and closes by rotating outward
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });
    blades.forEach((b, i) => {
      const baseRot = i * 60;
      gsap.set(b, { rotation: baseRot, transformOrigin: '130px 100px' });
      tl.to(b, { rotation: baseRot + 22, scale: 0.86, transformOrigin: '130px 100px', duration: 1.0 }, 0);
      tl.to(b, { rotation: baseRot, scale: 1, transformOrigin: '130px 100px', duration: 1.0 }, 1.2);
      tl.to(b, { rotation: baseRot - 22, scale: 1.14, transformOrigin: '130px 100px', duration: 1.0 }, 2.4);
      tl.to(b, { rotation: baseRot, scale: 1, transformOrigin: '130px 100px', duration: 1.0 }, 3.6);
    });

    // glow brightens when aperture is most open
    gsap.set(glow, { scale: 1, transformOrigin: '130px 100px', opacity: 0.85 });
    const glowTl = gsap.timeline({ repeat: -1 });
    glowTl.to(glow, { scale: 1.6, opacity: 1, duration: 1, ease: 'power2.out' }, 2.4);
    glowTl.to(glow, { scale: 1, opacity: 0.85, duration: 1, ease: 'power2.in' }, 3.6);
    glowTl.to(glow, { scale: 0.6, opacity: 0.5, duration: 1, ease: 'power2.in' }, 0);
    glowTl.to(glow, { scale: 1, opacity: 0.85, duration: 1, ease: 'power2.out' }, 1.0);

    return tl;
  }

  /* ────────────────────────────────────────────────────────────
     5. RENTALS — Door Light
     Door opens, warm light spills, interior glow visible. Then closes.
     ──────────────────────────────────────────────────────────── */
  function buildDoor() {
    const root = document.querySelector('#cat-rentals');
    if (!root) return null;

    const leaf = root.querySelector('.door-leaf');
    const interior = root.querySelector('.door-interior');
    const spill = root.querySelector('.door-spill');
    const spillPath = spill.querySelector('path');
    const tag = root.querySelector('.door-tag');

    gsap.set(leaf, { rotationY: 0, transformOrigin: '92px 105px' });
    gsap.set(spillPath, { opacity: 0 });
    gsap.set(interior, { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

    // door opens (skew via scaleX + slight rotation)
    tl.to(leaf, { scaleX: 0.3, x: -8, transformOrigin: '92px 105px', duration: 1.2 }, 0.4);
    tl.to(interior, { opacity: 1, duration: 1.0 }, 0.6);
    tl.to(spillPath, { opacity: 1, duration: 1.0 }, 0.6);

    // hold (light dwells)
    tl.to({}, { duration: 1.2 });

    // close
    tl.to(spillPath, { opacity: 0, duration: 0.8 }, '+=0.2');
    tl.to(interior, { opacity: 0, duration: 0.8 }, '<');
    tl.to(leaf, { scaleX: 1, x: 0, transformOrigin: '92px 105px', duration: 1.0 }, '<');

    // gentle pause
    tl.to({}, { duration: 0.8 });

    // key tag sway (separately)
    gsap.to(tag, {
      rotation: 8, transformOrigin: '202px 60px',
      duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });

    return tl;
  }

  /* ────────────────────────────────────────────────────────────
     6. HOTELS — Key Card
     Card rises into reader, LED flips red→green, beam pulses.
     ──────────────────────────────────────────────────────────── */
  function buildKeycard() {
    const root = document.querySelector('#cat-hotels');
    if (!root) return null;

    const card = root.querySelector('.hotel-card');
    const led  = root.querySelector('.hotel-led');
    const halo = root.querySelector('.hotel-led-halo');
    const beam = root.querySelector('.hotel-beam');

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.out' } });

    gsap.set(card, { y: 0 });
    gsap.set(led,  { attr: { fill: '#b84d72' } });
    gsap.set(halo, { opacity: 0, attr: { r: 6 } });
    gsap.set(beam, { attr: { y: 55, height: 0 }, opacity: 0 });

    // card lifts up into reader
    tl.to(card, { y: -90, duration: 1.2, ease: 'power2.inOut' }, 0.5);

    // touch: LED snaps to green
    tl.to(led,  { attr: { fill: '#26d4a0' }, duration: 0.06 }, 1.5);
    tl.to(halo, { opacity: 1, attr: { r: 9 }, duration: 0.4, ease: 'power2.out' }, 1.5);

    // beam pulses upward
    tl.to(beam, { attr: { y: 30, height: 25 }, opacity: 0.7, duration: 0.5, ease: 'power2.out' }, 1.55);
    tl.to(beam, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.1');

    // halo fades
    tl.to(halo, { opacity: 0, duration: 0.6, ease: 'power2.in' }, '<');

    // hold
    tl.to({}, { duration: 1.0 });

    // LED back to idle
    tl.to(led, { attr: { fill: '#b84d72' }, duration: 0.4 });

    // card slides back down
    tl.to(card, { y: 0, duration: 1.0, ease: 'power2.inOut' }, '+=0.3');

    // pause
    tl.to({}, { duration: 0.6 });

    return tl;
  }

  /* ────────────────────────────────────────────────────────────
     7. EVENTS — Champagne pour
     Flute fills with gold; bubbles rise; pop sparkles at top; confetti.
     ──────────────────────────────────────────────────────────── */
  function buildChampagne() {
    const root = document.querySelector('#cat-events');
    if (!root) return null;

    const liquid = root.querySelector('.evt-liquid');
    const bubbles = root.querySelectorAll('.evt-b');
    const pop = root.querySelector('.evt-pop');
    const confetti = root.querySelectorAll('.evt-c');

    // liquid rises
    gsap.set(liquid, { attr: { y: 132, height: 0 } });
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });
    tl.to(liquid, { attr: { y: 50, height: 82 }, duration: 2.2 }, 0.4);
    // hold
    tl.to({}, { duration: 2.0 });
    // dissolve
    tl.to(liquid, { opacity: 0.3, duration: 0.4 });
    tl.set(liquid, { attr: { y: 132, height: 0 }, opacity: 0.85 });

    // bubbles continuously rise
    bubbles.forEach((b, i) => {
      const startY = 122 + (i % 3) * 4;
      const dur = 1.8 + (i * 0.18) % 1.4;
      gsap.set(b, { y: 0, opacity: 0 });
      gsap.fromTo(b, { y: 0, opacity: 0 }, {
        y: -(45 + (i * 7) % 30),
        opacity: 0.9,
        duration: dur, repeat: -1, delay: i * 0.32,
        ease: 'power1.out',
        keyframes: [
          { opacity: 0, duration: 0 },
          { opacity: 0.9, duration: 0.25 },
          { opacity: 0.9, duration: dur - 0.5 },
          { opacity: 0, duration: 0.25 },
        ]
      });
    });

    // pop sparkle at the top — brief flash
    gsap.set(pop, { opacity: 0, scale: 0.6, transformOrigin: '130px 20px' });
    const popTl = gsap.timeline({ repeat: -1 });
    popTl.to({}, { duration: 2.4 });
    popTl.to(pop, { opacity: 1, scale: 1.2, duration: 0.3, ease: 'back.out(2)' });
    popTl.to(pop, { opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.in' }, '+=0.4');
    popTl.to({}, { duration: 2.4 });

    // confetti drifts down
    confetti.forEach((c, i) => {
      const startX = parseFloat(c.getAttribute('x'));
      gsap.set(c, { y: 0, opacity: 0 });
      gsap.to(c, {
        y: 200, x: (i % 2 === 0 ? 10 : -10),
        rotation: (i % 2 === 0 ? 180 : -180), transformOrigin: '50% 50%',
        opacity: 0.7,
        duration: 4.5 + i * 0.5,
        repeat: -1, delay: i * 0.6,
        ease: 'sine.inOut',
        keyframes: [
          { opacity: 0, duration: 0 },
          { opacity: 0.8, duration: 0.5 },
          { opacity: 0.8, duration: 3 },
          { opacity: 0, duration: 1 },
        ]
      });
    });

    return tl;
  }

  /* ────────────────────────────────────────────────────────────
     8. SHOP — Ribbon Untie
     Bow loosens, lid lifts, golden sparkles emerge.
     ──────────────────────────────────────────────────────────── */
  function buildRibbon() {
    const root = document.querySelector('#cat-shop');
    if (!root) return null;

    const lid  = root.querySelector('.shop-lid');
    const bow  = root.querySelector('.shop-bow');
    const ribV = root.querySelector('.shop-rib-v');
    const glow = root.querySelector('.shop-glow');
    const sparks = root.querySelectorAll('.shop-spark');

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

    gsap.set(lid,  { y: 0, rotation: 0, transformOrigin: '130px 100px' });
    gsap.set(bow,  { scale: 1, opacity: 1, transformOrigin: '130px 80px' });
    gsap.set(ribV, { opacity: 1 });
    gsap.set(glow, { opacity: 0 });
    gsap.set(sparks, { opacity: 0, y: 0 });

    // bow untwists & shrinks away
    tl.to(bow, { scale: 0.4, opacity: 0, rotation: -8, duration: 0.9 }, 0.5);
    tl.to(ribV, { opacity: 0.25, duration: 0.6 }, '<');

    // lid lifts
    tl.to(lid, { y: -22, rotation: -6, transformOrigin: '130px 100px', duration: 1.0, ease: 'back.out(1.3)' }, '-=0.5');

    // inside glow & sparkles
    tl.to(glow, { opacity: 1, duration: 0.5 }, '<+0.2');
    sparks.forEach((s, i) => {
      const dx = (i - 2) * 16;
      const dy = -10 - (i % 3) * 6;
      tl.fromTo(s, { opacity: 0, x: 0, y: 0 }, {
        opacity: 1, x: dx, y: dy, duration: 0.7,
        ease: 'power2.out'
      }, `<+${0.05 + i * 0.05}`);
      tl.to(s, { opacity: 0, y: dy - 12, duration: 0.6, ease: 'power2.in' }, '>');
    });

    // hold
    tl.to({}, { duration: 0.9 });

    // close back up
    tl.to(glow, { opacity: 0, duration: 0.5 }, '>');
    tl.to(lid, { y: 0, rotation: 0, duration: 0.8, ease: 'power2.inOut' }, '<');
    tl.to(ribV, { opacity: 1, duration: 0.6 }, '<+0.3');
    tl.to(bow,  { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.2)' }, '<');

    // small pause
    tl.to({}, { duration: 0.6 });

    return tl;
  }

  /* ── LIVE — broadcast waves, blinking record dot, pulsing play ── */
  function buildLive() {
    const root = document.querySelector('#cat-live');
    if (!root) return null;
    const waves = root.querySelectorAll('.lv-wave');
    const dot   = root.querySelector('.lv-dot');
    const play  = root.querySelector('.lv-play');

    // waves emit outward: fade + slight grow, staggered inner→outer
    waves.forEach((w, i) => {
      gsap.set(w, { transformOrigin: '130px 87px' });
      gsap.fromTo(w,
        { opacity: 0, scale: 0.6 },
        { opacity: 0.6, scale: 1.1, duration: 1.4, ease: 'sine.out',
          yoyo: true, repeat: -1, delay: (i % 2) * 0.35 });
    });
    // record dot blink
    if (dot) gsap.to(dot, { opacity: 0.25, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    // play button breathe
    if (play) {
      gsap.set(play, { transformOrigin: '50% 50%' });
      gsap.to(play, { scale: 1.14, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    return gsap.to({}, { duration: 1, repeat: -1 });
  }

  /* ── XJOBS — badge swings on its lanyard, hiring spark twinkles ── */
  function buildXjobs() {
    const root = document.querySelector('#cat-xjobs');
    if (!root) return null;
    const badge = root.querySelector('.xj-badge');
    const spark = root.querySelector('.xj-spark');
    const line  = root.querySelector('.xj-line');

    if (badge) {
      gsap.set(badge, { svgOrigin: '130 46' });
      gsap.fromTo(badge, { rotation: -2.4 },
        { rotation: 2.4, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    if (spark) {
      gsap.set(spark, { transformOrigin: '50% 50%' });
      gsap.to(spark, { scale: 1.25, opacity: 0.5, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    if (line) {
      const len = 28;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, { strokeDashoffset: 0, duration: 1.1, repeat: -1, repeatDelay: 2.2, ease: 'power2.out' });
    }
    return gsap.to({}, { duration: 1, repeat: -1 });
  }

  /* ────────────────────────────────────────────────────────────
     Boot — build all timelines, pause when off-screen
     ──────────────────────────────────────────────────────────── */
  const timelines = [];
  const cards = [
    { id: '#cat-escorts',    build: buildCandleglow },
    { id: '#cat-companions', build: buildSilk },
    { id: '#cat-nightlife',  build: buildPulse },
    { id: '#cat-creators',   build: buildAperture },
    { id: '#cat-rentals',    build: buildDoor },
    { id: '#cat-hotels',     build: buildKeycard },
    { id: '#cat-events',     build: buildChampagne },
    { id: '#cat-shop',       build: buildRibbon },
    { id: '#cat-live',       build: buildLive },
    { id: '#cat-xjobs',      build: buildXjobs },
  ];

  cards.forEach(c => {
    try {
      const tl = c.build();
      if (tl) timelines.push({ id: c.id, tl });
    } catch (e) {
      console.warn('Animation failed for', c.id, e);
    }
  });

  // Pause animations on cards that scroll out of view (perf).
  // GSAP's all-tweens approach is broad; we just pause whole-timeline
  // tweens by walking gsap.globalTimeline children whose target lies
  // inside an off-screen card.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const action = e.isIntersecting ? 'play' : 'pause';
        // Pause/resume all tweens whose target lives inside this card
        const tweens = gsap.getTweensOf(e.target.querySelectorAll('*'));
        tweens.forEach(t => t[action]());
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.cat-card').forEach(c => io.observe(c));
  }
})();
