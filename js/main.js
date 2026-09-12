// Gemcore Construction - Hero Architectural Tab Switcher & Multi-Phase Scroll Controller

document.addEventListener('DOMContentLoaded', () => {
  const heroImg = document.getElementById('hero-drawing-image');
  const tabButtons = document.querySelectorAll('.hero-tab-btn');
  const heroTabs = document.getElementById('hero-tabs-container');
  const heroCta = document.getElementById('hero-cta');
  const heroDrawing = document.getElementById('hero-drawing-container');
  const heroBgStage0 = document.getElementById('hero-bg-stage0');
  const heroBgStage1 = document.getElementById('hero-bg-stage1');
  const heroBgStage2 = document.getElementById('hero-bg-stage2');
  const heroBgStage3 = document.getElementById('hero-bg-stage3');
  const heroBgOverlay = document.getElementById('hero-bg-overlay');
  const heroTitleWrapper = document.getElementById('hero-title-wrapper');
  const heroGemcoreTitle = document.getElementById('hero-gemcore-title');
  const gemcoreH1 = document.getElementById('gemcore-h1');
  const gemcoreSubRow = document.getElementById('gemcore-subtitle-row');
  const heroAboutTitle = document.getElementById('hero-about-title');
  const heroServicesTitle = document.getElementById('hero-services-title');
  const heroWorkTitle = document.getElementById('hero-work-title');
  const heroAboutPanel = document.getElementById('hero-about-panel');
  const heroServicesPanel = document.getElementById('hero-services-panel');
  const heroWorkPanel = document.getElementById('hero-work-panel');
  const heroContactTitle = document.getElementById('hero-contact-title');
  const heroContactPanel = document.getElementById('hero-contact-panel');
  const heroTrack = document.getElementById('hero-scroll-track');
  const serviceCards = Array.from(document.querySelectorAll('#services-cards .service-card'));
  const servicesColumn = document.getElementById('services-cards');
  const workStrip = document.getElementById('work-strip');
  const heroFounder = document.getElementById('hero-founder');
  const aboutDetailCard = document.querySelector('.about-detail-card');
  const navHomeLink = document.getElementById('nav-home-link');
  const navTouchLink = document.getElementById('nav-touch-link');
  const navAboutLink = document.getElementById('nav-about-link');
  const navServicesLink = document.getElementById('nav-services-link');
  const navWorkLink = document.getElementById('nav-work-link');
  const navContactLink = document.getElementById('nav-contact-link');

  const navItems = [
    navHomeLink,
    navAboutLink,
    navServicesLink,
    navWorkLink,
    navContactLink
  ];


  // 1. Tab switching logic with smooth crossfade
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetSrc = btn.getAttribute('data-img');
      const allDrawingImgs = document.querySelectorAll('.hero-drawing-image, #hero-drawing-image');

      if (targetSrc) {
        allDrawingImgs.forEach(img => {
          if (img.getAttribute('src') !== targetSrc) {
            img.style.opacity = '0.15';
            setTimeout(() => {
              img.src = targetSrc;
              img.onload = () => {
                img.style.opacity = '1';
              };
              setTimeout(() => {
                img.style.opacity = '1';
              }, 80);
            }, 150);
          }
        });
      }
    });
  });

  // Helper clamp
  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  // 2. Multi-Phase Scroll Controller
  //
  // The sticky hero plays five stages as the track scrolls. Each stage owns a
  // giant title, a frosted detail panel, and (from stage 2 on) a time-lapse
  // background that crossfades over the one before it. A stage holds from its
  // own `start` until the next stage's `start`, so retiming the sequence is
  // just a matter of moving these numbers.
  //
  // Starts sit 0.20 apart: each stage crossfades over MORPH, then holds for the
  // remainder. The backgrounds walk the build in order, so the whole track reads
  // as one time-lapse from bare ground to finished estate.
  const MORPH = 0.11;      // progress span of each title/panel/background crossfade
  const PANEL_LAG = 0.03;  // panels trail their title into view by this much

  const stages = [
    { title: heroGemcoreTitle,  panel: null,               bg: null,         start: 0.00 },
    { title: heroAboutTitle,    panel: heroAboutPanel,     bg: null,         start: 0.20, slideUp: true },
    { title: heroServicesTitle, panel: null, /* cards drive it, see D2 */ bg: heroBgStage1, start: 0.40 },
    { title: heroWorkTitle,     panel: null, /* strip drives it, see D3 */ bg: heroBgStage2, start: 0.60 },
    { title: heroContactTitle,  panel: heroContactPanel,   bg: heroBgStage3, start: 0.80, slideUp: true, panelLag: 0.015 }
  ];

  // Unscaled ink widths of the two headings that share their band with a card:
  // ABOUT's detail card sits in the left column, CONTACT's form in the right, so
  // each heading slides away from its card. The shift depends on how wide the
  // type actually renders, so measure it once per resize — the Range rect comes
  // back scaled by the title wrapper, so divide that scale back out.
  let aboutInkWidth = 0;
  let contactInkWidth = 0;
  function measureAboutInk() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = (heroTrack ? (heroTrack.offsetHeight - window.innerHeight) : 1) || 1;
    const scale = Math.max(0.62, 1 - clamp(scrollY / maxScroll, 0, 1) * 0.30);
    const inkOf = el => {
      if (!el) return 0;
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width / scale;
    };
    aboutInkWidth = inkOf(heroAboutTitle);
    contactInkWidth = inkOf(heroContactTitle);
  }

  // Right edge of the ABOUT detail card: the nav's own inset plus the 446px nav
  // width it is matched to. The gap tightens below 1024px, where the heading
  // would otherwise be pushed past the right edge of the window.
  const ABOUT_NAV_WIDTH = 446;
  const aboutCardRight = () => (window.innerWidth >= 1024 ? 64 : 40) + ABOUT_NAV_WIDTH;
  const aboutHeadingGap = () => (window.innerWidth >= 1024 ? 40 : 24);

  // Left edge of the CONTACT form, which is right-aligned: viewport minus the
  // panel's own inset minus the card's max-w-lg width.
  const CONTACT_CARD_WIDTH = 512;
  const contactCardLeft = () =>
    document.documentElement.clientWidth - (window.innerWidth >= 1024 ? 64 : 40) - CONTACT_CARD_WIDTH;

  function updateScrollVisuals() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = (heroTrack ? (heroTrack.offsetHeight - window.innerHeight) : (window.innerHeight * 6)) || (window.innerHeight * 6);
    const progress = clamp(scrollY / maxScroll, 0, 1);

    // --- A. OPENING-MOMENT FURNITURE (tab bar + CTA/blurb) ---
    // Both belong to the "GEMCORE" hero only and are gone before ABOUT begins.
    // Every value here is a function of scroll position, so the fade tracks the
    // scroll rather than snapping when a threshold is crossed.
    const smoothstep = t => t * t * (3 - 2 * t);

    if (heroTabs) {
      const tabT = clamp(progress / 0.08, 0, 1);
      const tabOut = smoothstep(tabT);
      heroTabs.style.opacity = (1 - tabOut).toFixed(3);
      heroTabs.style.transform = `translate3d(0, ${(tabOut * 35).toFixed(1)}px, 0)`;
      heroTabs.style.pointerEvents = tabOut < 0.8 ? 'auto' : 'none';
    }

    if (heroCta) {
      // Holds for the first sliver of scroll, then eases out across a wider band
      // (~0.02 -> 0.16) so it drifts away with the scroll instead of blinking off.
      const ctaT = clamp((progress - 0.02) / 0.14, 0, 1);
      const ctaOut = smoothstep(ctaT);
      heroCta.style.opacity = (1 - ctaOut).toFixed(3);
      heroCta.style.transform = `translate3d(0, ${(ctaOut * 44).toFixed(1)}px, 0)`;
      heroCta.style.pointerEvents = ctaOut < 0.85 ? 'auto' : 'none';
    }

    // --- B. HERO DRAWING SWIPE UP-LEFT OFF SCREEN ---
    if (heroDrawing) {
      const swipeProgress = clamp((progress - 0.05) / 0.15, 0, 1);
      const moveY = -swipeProgress * 145; // vh (completely off screen)
      const moveX = -swipeProgress * 8;   // vw (subtle left drift)
      const scale = 1 - swipeProgress * 0.15;
      const drawingOpacity = clamp(1 - swipeProgress * 1.15, 0, 1);
      heroDrawing.style.transform = `translate3d(${moveX.toFixed(2)}vw, ${moveY.toFixed(2)}vh, 0) scale(${scale.toFixed(3)})`;
      heroDrawing.style.opacity = drawingOpacity.toFixed(3);
    }

    // --- C. TITLE WRAPPER SCALING ---
    // The upward drift is capped in px. As vh, it outgrew the type's own shrink
    // on tall viewports and walked the later stage headings up into the nav
    // (iPad Pro portrait had CONTACT 19px above the nav's bottom edge). 50px is
    // 6vh of an 833px-tall window, so shorter viewports are unaffected.
    if (heroTitleWrapper) {
      const titleScale = Math.max(0.62, 1 - progress * 0.30);
      const titleY = -progress * Math.min(window.innerHeight * 0.06, 50);
      heroTitleWrapper.style.transform = `scale(${titleScale.toFixed(3)}) translate3d(0, ${titleY.toFixed(1)}px, 0)`;
    }

    // --- D. STAGE CROSSFADES: titles, panels & time-lapse backgrounds ---
    // "GEMCORE" -> "ABOUT US" -> "OUR SERVICES" -> "OUR WORK" -> "CONTACT US"
    stages.forEach((stage, i) => {
      const next = stages[i + 1];
      const FADE_DUR = 0.04;

      // Entrance: from stage.start to stage.start + FADE_DUR
      const enter = i === 0 ? 1 : clamp((progress - stage.start) / FADE_DUR, 0, 1);

      // Exit: completes before next stage starts so titles never overlap
      const exitStart = next ? (next.start - FADE_DUR - 0.01) : 1;
      const exit = next ? clamp((progress - exitStart) / FADE_DUR, 0, 1) : 0;

      if (stage.title) {
        const titleOpacity = enter * (1 - exit);
        // Stage titles rest higher than GEMCORE to clear the top nav. They are
        // 20% smaller than the wordmark, so the extra lift below is what the
        // shorter glyph box gives back. Mobile has the nav at the bottom and the
        // container at 1.75rem, so it gets a smaller lift before clipping.
        // The lift has to shrink as the window narrows: the nav keeps its height
        // while the type shrinks with vw, so a flat -70 ran the later headings
        // (which drift up with the wrapper) into the nav band below ~1280px.
        // 1280 and up is untouched.
        const vw = window.innerWidth;
        const restY = i === 0 ? 0
          : vw < 640 ? 0
          : vw < 768 ? 4       // title container sits 16px higher in this band
          : vw < 1024 ? -18
          : vw < 1280 ? -62
          : -70;
        const titleY = restY + (1 - enter) * 30 - exit * 30;

        // ABOUT and CONTACT each share their band with a card, so nudge the
        // heading out of that card's column. The translate lives inside the
        // scaled wrapper, hence the divide.
        let titleX = 0;
        if (window.innerWidth >= 768) {
          const scale = Math.max(0.62, 1 - progress * 0.30);
          const cw = document.documentElement.clientWidth;
          const mid = cw / 2;
          const EDGE = 16;   // never push the type off its own side of the window
          if (stage.title === heroAboutTitle && aboutInkWidth) {
            const w = aboutInkWidth * scale;
            const need = Math.max(0, aboutCardRight() + aboutHeadingGap() - (mid - w / 2));
            const room = Math.max(0, cw - EDGE - (mid + w / 2));
            titleX = Math.min(need, room) / scale;
          } else if (stage.title === heroContactTitle && contactInkWidth) {
            // Mirror of ABOUT: the form is right-aligned, so CONTACT slides left.
            // Below ~1024 the heading is wider than the space beside the card, so
            // the clamp keeps it on screen and it just tucks behind the card.
            const w = contactInkWidth * scale;
            const need = Math.max(0, (mid + w / 2) - (contactCardLeft() - aboutHeadingGap()));
            const room = Math.max(0, (mid - w / 2) - EDGE);
            titleX = -Math.min(need, room) / scale;
          }
        }

        stage.title.style.opacity = titleOpacity.toFixed(3);
        stage.title.style.transform =
          `translate3d(${titleX.toFixed(1)}px, ${titleY.toFixed(1)}px, 0)`;
      }

      if (stage.panel) {
        const isMobileContact = (stage.panel === heroContactPanel && window.innerWidth < 640);
        const lag = isMobileContact ? 0.045 : (stage.panelLag !== undefined ? stage.panelLag : PANEL_LAG);
        const span = isMobileContact ? 0.055 : (0.08 - lag);
        const panelIn = clamp((progress - stage.start - lag) / span, 0, 1);
        const panelExitStart = next ? (next.start - 0.05) : 1;
        const panelExit = next ? clamp((progress - panelExitStart) / 0.05, 0, 1) : 0;

        // On desktop the ABOUT card is a nav dropdown: the panel itself holds
        // still and the card rolls down out of the pill (see D1a below).
        const aboutAsDropdown =
          stage.panel === heroAboutPanel && aboutDetailCard && window.innerWidth >= 768;

        if (aboutAsDropdown) {
          stage.panel.style.opacity = (1 - panelExit).toFixed(3);
          stage.panel.style.transform = 'none';
          stage.panel.style.pointerEvents = (panelIn > 0.6 && panelExit < 0.5) ? 'auto' : 'none';
        } else if (stage.slideUp) {
          if (panelIn <= 0) {
            stage.panel.style.opacity = '0';
            stage.panel.style.visibility = 'hidden';
            stage.panel.style.pointerEvents = 'none';
            stage.panel.style.transform = 'translate3d(0, 100vh, 0)';
          } else {
            stage.panel.style.visibility = 'visible';
            const eased = 1 - Math.pow(1 - panelIn, 3);
            const enterY = (1 - eased) * 60;
            const panelOpacity = clamp(panelIn * 1.8, 0, 1) * (1 - panelExit);
            const fadeTarget = stage.panel.firstElementChild || stage.panel;
            stage.panel.style.opacity = panelOpacity.toFixed(3);
            fadeTarget.style.opacity = '1';
            stage.panel.style.transform = `translate3d(0, ${(enterY - panelExit * 18).toFixed(1)}px, 0)`;
            stage.panel.style.pointerEvents = (panelIn > 0.5 && panelExit < 0.5) ? 'auto' : 'none';
          }
        } else {
          const panelOpacity = panelIn * (1 - panelExit);
          const panelY = (1 - panelIn) * 35 - panelExit * 25;
          stage.panel.style.opacity = panelOpacity.toFixed(3);
          stage.panel.style.transform = `translate3d(0, ${panelY.toFixed(1)}px, 0)`;
          stage.panel.style.pointerEvents = panelOpacity > 0.3 ? 'auto' : 'none';
        }
      }

      // Backgrounds are stacked, so each one only ever fades in over the last.
      if (stage.bg) {
        stage.bg.style.opacity = enter.toFixed(3);
      }
    });

    // --- D2. SERVICES ---
    // Mobile gets one vertical column that scrolls up through the viewport;
    // desktop keeps the pinned scatter, each card on its own stagger. The
    // breakpoint here must match the 640px one in styles.css.
    if (servicesColumn && heroServicesPanel) {
      const sStart = stages[2].start;   // 0.40
      const isColumn = window.innerWidth < 640;

      if (isColumn) {
        const sEnd = stages[3].start;   // 0.60

        heroServicesPanel.style.opacity = (progress >= sStart - 0.02 && progress < sEnd) ? '1' : '0';
        heroServicesPanel.style.pointerEvents = (progress >= sStart + 0.01 && progress < sEnd - 0.02) ? 'auto' : 'none';
        heroServicesPanel.style.transform = 'none';

        // Start just below the fold, finish just above it, so every card passes through.
        const sub = clamp((progress - sStart) / (sEnd - sStart), 0, 1);
        const colH = servicesColumn.scrollHeight;
        const from = window.innerHeight * 0.92;
        const to = -colH - window.innerHeight * 0.08;
        servicesColumn.style.transform =
          'translate3d(0, ' + (from + (to - from) * sub).toFixed(1) + 'px, 0)';

        // Column cards are visible by default in CSS; drop any scatter leftovers.
        serviceCards.forEach(card => {
          card.style.opacity = '';
          card.style.transform = '';
        });
      } else {
        const n = serviceCards.length;

        // Mount only during the SERVICES window; fully hidden by 0.585, before WORK.
        heroServicesPanel.style.opacity = (progress >= sStart - 0.02 && progress < 0.585) ? '1' : '0';
        heroServicesPanel.style.pointerEvents = (progress >= sStart + 0.01 && progress < 0.57) ? 'auto' : 'none';
        heroServicesPanel.style.transform = 'none';
        servicesColumn.style.transform = 'none';

        serviceCards.forEach((card, i) => {
          const frac = i / (n - 1 || 1);

          // Staggered entrance between 0.40 and 0.47
          const inAt = sStart + frac * 0.055;
          const inEased = smoothstep(clamp((progress - inAt) / 0.035, 0, 1));

          // Exit begins at 0.515 and glides clear off the top by 0.575
          const outAt = 0.515 + frac * 0.025;
          const outEased = smoothstep(clamp((progress - outAt) / 0.035, 0, 1));

          const y = (1 - inEased) * 4 - outEased * 125; // vh
          card.style.opacity = (inEased * (1 - outEased)).toFixed(3);
          card.style.transform =
            'translate(var(--sc-tx, 0px), ' + y.toFixed(2) + 'vh) scale(' +
            (0.94 + inEased * 0.06).toFixed(3) + ')';
        });
      }
    }

    // --- D3. OUR WORK STRIP (ENTERS FROM BOTTOM-LEFT WITH DELAY) ---
    // Enters from bottom-left after "OUR WORK" title appears, preventing any overlap
    if (workStrip && heroWorkPanel) {
      // Delay entrance: starts at 0.625, eases into position by 0.67
      const workIn = clamp((progress - 0.625) / 0.045, 0, 1);
      const easedIn = 1 - Math.pow(1 - workIn, 3); // cubic ease-out
      const enterX = (1 - easedIn) * -28; // -28vw (from bottom-left)
      const enterY = (1 - easedIn) * 55;  // +55vh (from bottom-left)

      // Exit cleanly before Contact begins at 0.80
      const workExit = clamp((progress - 0.765) / 0.03, 0, 1);
      const panelOpacity = clamp(workIn * 1.5, 0, 1) * (1 - workExit);

      heroWorkPanel.style.opacity = panelOpacity.toFixed(3);
      heroWorkPanel.style.transform = `translate3d(${enterX.toFixed(1)}vw, ${(enterY - workExit * 15).toFixed(1)}vh, 0)`;
      heroWorkPanel.style.pointerEvents = (workIn > 0.7 && workExit < 0.3) ? 'auto' : 'none';

      // Horizontal tracking across the strip once resting in position
      const sub = clamp((progress - 0.665) / (0.765 - 0.665), 0, 1);
      const travel = Math.max(0, workStrip.scrollWidth - window.innerWidth);
      workStrip.style.transform = `translate3d(${(-sub * travel).toFixed(1)}px, 0, 0)`;
    }

    // --- D1a. ABOUT DETAIL CARD AS A NAV DROPDOWN (desktop) ---
    // The card is parked under the nav pill and revealed top-down, so it reads
    // as a menu unrolling out of the nav rather than a panel sliding in. The
    // clip is what sells it — the nav (z-30) covers whatever is still tucked up.
    if (aboutDetailCard) {
      if (window.innerWidth >= 768) {
        const aStart = stages[1].start;                  // 0.20
        const open = smoothstep(clamp((progress - aStart - PANEL_LAG) / 0.05, 0, 1));
        const shut = smoothstep(clamp((progress - (stages[2].start - 0.05)) / 0.05, 0, 1));
        const reveal = open * (1 - shut);
        const hidden = ((1 - reveal) * 100).toFixed(1);
        aboutDetailCard.style.clipPath = `inset(0 0 ${hidden}% 0 round 0.75rem)`;
        aboutDetailCard.style.transform =
          `translate3d(0, ${(-(1 - reveal) * 14).toFixed(1)}px, 0)`;
      } else {
        aboutDetailCard.style.clipPath = '';
        aboutDetailCard.style.transform = '';
      }
    }

    // --- D1b. FOUNDER CARD (mobile) ---
    // On desktop the card sits beside the ABOUT copy and is always visible.
    // On mobile it stacks underneath, so bring it in on continued scroll
    // through the second half of the ABOUT band rather than all at once.
    if (heroFounder && window.innerWidth < 768) {
      const aStart = stages[1].start;   // 0.20
      const aEnd = stages[2].start;     // 0.40
      const sub = clamp((progress - aStart) / (aEnd - aStart), 0, 1);
      const reveal = smoothstep(clamp((sub - 0.45) / 0.3, 0, 1));
      heroFounder.style.opacity = reveal.toFixed(3);
      heroFounder.style.transform = `translate3d(0, ${((1 - reveal) * 22).toFixed(1)}px, 0)`;
    } else if (heroFounder) {
      // Desktop: the panel now holds a flat opacity for the dropdown, so the
      // founder needs its own fade — otherwise it snaps in at the stage start.
      // It trails the card unrolling out of the nav.
      const aStart = stages[1].start;   // 0.20
      const rise = smoothstep(clamp((progress - aStart - 0.06) / 0.05, 0, 1));
      const leave = smoothstep(clamp((progress - (stages[2].start - 0.05)) / 0.05, 0, 1));
      const reveal = rise * (1 - leave);
      heroFounder.style.opacity = reveal.toFixed(3);
      heroFounder.style.transform = `translate3d(0, ${((1 - reveal) * 26).toFixed(1)}px, 0)`;
    }

    // --- E. SLOW BACKGROUND PUSH-IN ACROSS THE WHOLE TRACK ---
    const bgScale = 1 + progress * 0.04;
    [heroBgStage0, heroBgStage1, heroBgStage2, heroBgStage3].forEach(bg => {
      if (bg) {
        bg.style.transform = `scale(${bgScale.toFixed(3)})`;
      }
    });

    // --- F. DYNAMIC GRADIENT OVERLAY (REDUCED OPACITY, REMOVED COMPLETELY IN FINAL PHASE) ---
    if (heroBgOverlay) {
      // Stage 4 (final phase completed villa) starts at 0.80.
      // As scroll approaches and enters Stage 4, fade the overlay to 0.
      const finalPhaseEnter = clamp((progress - 0.74) / MORPH, 0, 1);
      const overlayOpacity = 1 - finalPhaseEnter;
      heroBgOverlay.style.opacity = overlayOpacity.toFixed(3);
    }

    // --- F2. NAV CONTRAST ON THE FINAL PHASE ---
    // The overlay above is gone by the CONTACT stage and the finished-villa
    // photo puts bright sky behind the nav, so darken the nav pills there.
    document.body.classList.toggle('nav-on-light', progress > 0.72);

    // --- G. ACTIVE SECTION NAV BUTTON (DARKER BUTTON IN VIEW) ---
    // Hide HOME from the first section (progress <= 0.05)
    const isFirstSection = progress <= 0.05;
    if (navHomeLink) {
      navHomeLink.classList.toggle('is-hidden', isFirstSection);
    }

    // GET IN TOUCH only points at the CONTACT stage, so retire it once the
    // contact form is the thing on screen — it starts leaving as CONTACT's
    // title crossfades in.
    if (navTouchLink) {
      navTouchLink.classList.toggle('is-hidden', progress >= stages[4].start - 0.02);
    }

    let activeIndex = -1;
    if (progress >= 0.79) {
      activeIndex = 4; // CONTACT
    } else if (progress >= 0.59) {
      activeIndex = 3; // WORK
    } else if (progress >= 0.39) {
      activeIndex = 2; // SERVICES
    } else if (progress >= 0.19) {
      activeIndex = 1; // ABOUT
    } else if (!isFirstSection) {
      activeIndex = 0; // HOME
    } else {
      activeIndex = -1;
    }

    navItems.forEach((item, idx) => {
      if (item) {
        if (idx === activeIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });
  }

  // 3. Navigation Routing
  function scrollToStage(index, instant = false) {
    const stage = stages[index];
    if (!stage || !heroTrack) return;

    const maxScroll = (heroTrack.offsetHeight - window.innerHeight) || (window.innerHeight * 6);
    const stageTargets = [
      0.00,  // GEMCORE
      0.27,  // ABOUT
      0.47,  // SERVICES
      0.68,  // WORK (strip settled in position from bottom-left)
      0.90   // CONTACT (contact card fully slid up)
    ];
    const target = stageTargets[index] !== undefined ? stageTargets[index] : stage.start;

    if (instant) {
      document.documentElement.scrollTop = maxScroll * target;
      window.scrollTo(0, maxScroll * target);
      updateScrollVisuals();
    } else {
      window.scrollTo({ top: maxScroll * target, behavior: 'smooth' });
    }
  }
  window.scrollToStage = scrollToStage;

  // HOME is the one destination that isn't a stage hold - it goes to the very top.
  if (navHomeLink) {
    navHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // [element id, stage index]
  [
    ['nav-about-link', 1],
    ['nav-services-link', 2],
    ['nav-work-link', 3],
    ['nav-contact-link', 4],
    ['nav-touch-link', 4]
  ].forEach(([id, stageIndex]) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToStage(stageIndex);
    });
  });

  // Panel CTAs and the footer nav carry the target stage on the element.
  // data-stage="0" means the opening hero, i.e. scroll all the way to the top.
  document.querySelectorAll('[data-stage]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = Number(el.getAttribute('data-stage'));
      if (idx <= 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        scrollToStage(idx);
      }
    });
  });

  // 3b. Hero Contact Form Handling
  const heroContactForm = document.getElementById('hero-contact-form');
  const heroContactSuccess = document.getElementById('hero-contact-success');
  const heroContactReset = document.getElementById('hero-contact-reset');

  if (heroContactForm) {
    heroContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(heroContactForm);
      const fname = formData.get('fname') || '';
      const lname = formData.get('lname') || '';
      const fullName = `${fname} ${lname}`.trim();
      const contact = formData.get('contact') || '';
      const email = formData.get('email') || '';
      const message = formData.get('message') || '';

      const subject = encodeURIComponent(`Project Inquiry — ${fullName || 'Website Contact'}`);
      const body = encodeURIComponent(`First Name: ${fname}\nLast Name: ${lname}\nContact: ${contact}\nEmail: ${email}\n\nMessage:\n${message}`);

      // Smooth switch to success confirmation
      if (heroContactSuccess) {
        heroContactForm.style.display = 'none';
        heroContactSuccess.classList.remove('hidden');
        heroContactSuccess.classList.add('flex');
      }

      // Open email client with pre-filled content
      window.location.href = `mailto:gemcoreconstruction1@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  if (heroContactReset && heroContactForm && heroContactSuccess) {
    heroContactReset.addEventListener('click', () => {
      heroContactForm.reset();
      heroContactForm.style.display = 'block';
      heroContactSuccess.classList.add('hidden');
      heroContactSuccess.classList.remove('flex');
    });
  }

  // 4. Optimized RAF Scroll Listener
  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateScrollVisuals();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  // 5. Width-lock subtitle to ~90% of GEMCORE H1 width (reduced a bit)
  function syncSubtitleWidth() {
    if (gemcoreH1 && gemcoreSubRow) {
      const w = gemcoreH1.offsetWidth;
      if (w > 0) {
        gemcoreSubRow.style.maxWidth = Math.round(w * 0.90) + 'px';
      }
    }
  }

  window.addEventListener('resize', () => {
    syncSubtitleWidth();
    measureAboutInk();
    updateScrollVisuals();
  }, { passive: true });

  // 6. Card Zoom Lightbox Modal (Click to zoom on service cards and work cards)
  const zoomModal = document.getElementById('card-zoom-modal');
  const zoomBackdrop = document.getElementById('card-zoom-backdrop');
  const zoomCloseBtn = document.getElementById('card-zoom-close');
  const zoomPrevBtn = document.getElementById('card-zoom-prev');
  const zoomNextBtn = document.getElementById('card-zoom-next');
  const zoomImg = document.getElementById('card-zoom-img');
  const zoomBadge = document.getElementById('card-zoom-badge');
  const zoomCategory = document.getElementById('card-zoom-category');
  const zoomTitle = document.getElementById('card-zoom-title');
  const zoomDesc = document.getElementById('card-zoom-desc');

  let zoomItems = [];
  let currentZoomIndex = 0;

  function openCardZoom(items, index) {
    if (!zoomModal || !items || !items.length) return;
    zoomItems = items;
    currentZoomIndex = clamp(index, 0, items.length - 1);
    updateZoomDisplay();
    zoomModal.classList.add('is-open');
    zoomModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeCardZoom() {
    if (!zoomModal) return;
    zoomModal.classList.remove('is-open');
    zoomModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function updateZoomDisplay() {
    if (!zoomItems.length) return;
    const item = zoomItems[currentZoomIndex];
    if (zoomImg) {
      zoomImg.src = item.img;
      zoomImg.alt = item.title;
    }
    if (zoomBadge) zoomBadge.textContent = item.num;
    if (zoomCategory) zoomCategory.textContent = item.category;
    if (zoomTitle) zoomTitle.textContent = item.title;
    if (zoomDesc) zoomDesc.textContent = item.desc;

    if (zoomPrevBtn) zoomPrevBtn.style.display = zoomItems.length > 1 ? 'flex' : 'none';
    if (zoomNextBtn) zoomNextBtn.style.display = zoomItems.length > 1 ? 'flex' : 'none';
  }

  function prevZoomCard() {
    if (zoomItems.length <= 1) return;
    currentZoomIndex = (currentZoomIndex - 1 + zoomItems.length) % zoomItems.length;
    updateZoomDisplay();
  }

  function nextZoomCard() {
    if (zoomItems.length <= 1) return;
    currentZoomIndex = (currentZoomIndex + 1) % zoomItems.length;
    updateZoomDisplay();
  }

  // Setup Service Cards Click to Zoom
  const serviceCardsElements = Array.from(document.querySelectorAll('.service-card'));
  const serviceZoomData = serviceCardsElements.map(card => ({
    img: card.querySelector('img')?.getAttribute('src') || '',
    num: card.querySelector('.service-card-num')?.textContent?.trim() || '',
    title: card.querySelector('.service-card-title')?.textContent?.trim() || '',
    desc: card.querySelector('.service-card-desc')?.textContent?.trim() || '',
    category: 'ARCHITECTURAL DRAFTING'
  }));

  serviceCardsElements.forEach((card, idx) => {
    card.addEventListener('click', () => {
      openCardZoom(serviceZoomData, idx);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardZoom(serviceZoomData, idx);
      }
    });
  });

  // Setup Work Cards Click to Zoom
  const workCardsElements = Array.from(document.querySelectorAll('.work-card'));
  const workZoomData = workCardsElements.map(card => ({
    img: card.querySelector('img')?.getAttribute('src') || '',
    num: card.querySelector('.work-card-num')?.textContent?.trim() || '',
    title: card.querySelector('.work-card-title')?.textContent?.trim() || '',
    desc: card.querySelector('.work-card-desc')?.textContent?.trim() || '',
    category: 'VILLA CONSTRUCTION STAGE'
  }));

  workCardsElements.forEach((card, idx) => {
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Zoom ${card.querySelector('.work-card-title')?.textContent?.trim() || 'Work Stage'}`);
    card.addEventListener('click', () => {
      openCardZoom(workZoomData, idx);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardZoom(workZoomData, idx);
      }
    });
  });

  // Lightbox event listeners
  if (zoomCloseBtn) zoomCloseBtn.addEventListener('click', closeCardZoom);
  if (zoomBackdrop) zoomBackdrop.addEventListener('click', closeCardZoom);
  if (zoomPrevBtn) zoomPrevBtn.addEventListener('click', prevZoomCard);
  if (zoomNextBtn) zoomNextBtn.addEventListener('click', nextZoomCard);

  window.addEventListener('keydown', (e) => {
    if (!zoomModal || !zoomModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeCardZoom();
    } else if (e.key === 'ArrowLeft') {
      prevZoomCard();
    } else if (e.key === 'ArrowRight') {
      nextZoomCard();
    }
  });

  // 7. Team carousel (ABOUT stage) — arrows and dots page through the members.
  // Slide count comes from the DOM, so adding a .founder-card figure plus a
  // matching .founder-dot button is all a new team member needs.
  const teamStage = document.querySelector('.founder-stage');
  if (teamStage) {
    const teamSlides = Array.from(teamStage.querySelectorAll('.founder-card'));
    const teamDots = Array.from(document.querySelectorAll('.founder-dot'));
    const teamPrev = document.querySelector('.founder-nav-prev');
    const teamNext = document.querySelector('.founder-nav-next');
    let teamIndex = Math.max(0, teamSlides.findIndex(s => s.classList.contains('is-active')));

    // A single member has nothing to page through, so the arrows and dots
    // retire themselves. They come back on their own as soon as a second
    // .founder-card figure (and its dot) is added to the markup.
    const teamControls = teamSlides.length > 1;
    document.querySelectorAll('.founder-nav, .founder-dots').forEach(el => {
      el.hidden = !teamControls;
    });

    function showTeamMember(next) {
      if (!teamSlides.length) return;
      // Wrap both ways so the arrows never dead-end.
      teamIndex = (next % teamSlides.length + teamSlides.length) % teamSlides.length;
      teamSlides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === teamIndex);
        slide.setAttribute('aria-hidden', i === teamIndex ? 'false' : 'true');
      });
      teamDots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === teamIndex);
        dot.setAttribute('aria-selected', i === teamIndex ? 'true' : 'false');
      });
    }

    if (teamPrev) teamPrev.addEventListener('click', () => showTeamMember(teamIndex - 1));
    if (teamNext) teamNext.addEventListener('click', () => showTeamMember(teamIndex + 1));
    teamDots.forEach((dot, i) => dot.addEventListener('click', () => showTeamMember(i)));

    // Arrow keys work once a control inside the carousel has focus.
    teamStage.closest('.founder-carousel').addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showTeamMember(teamIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showTeamMember(teamIndex + 1); }
    });

    showTeamMember(teamIndex);
  }

  // 8. Client Quotes / References Carousel (Our Work Stage)
  const quoteSlides = Array.from(document.querySelectorAll('.work-quote-slide'));
  const quoteDots = Array.from(document.querySelectorAll('.work-quote-dot'));
  const quotePrevBtn = document.getElementById('work-quote-prev');
  const quoteNextBtn = document.getElementById('work-quote-next');
  const quoteCard = document.querySelector('.work-quote-card');
  let currentQuoteIndex = 0;
  let quoteTimer = null;

  function showQuote(index) {
    if (!quoteSlides.length) return;
    currentQuoteIndex = (index + quoteSlides.length) % quoteSlides.length;

    quoteSlides.forEach((slide, i) => {
      const active = i === currentQuoteIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    quoteDots.forEach((dot, i) => {
      const active = i === currentQuoteIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function nextQuote() {
    showQuote(currentQuoteIndex + 1);
  }

  function prevQuote() {
    showQuote(currentQuoteIndex - 1);
  }

  function startQuoteTimer() {
    stopQuoteTimer();
    quoteTimer = setInterval(nextQuote, 6000);
  }

  function stopQuoteTimer() {
    if (quoteTimer) {
      clearInterval(quoteTimer);
      quoteTimer = null;
    }
  }

  if (quotePrevBtn) {
    quotePrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevQuote();
      startQuoteTimer();
    });
  }

  if (quoteNextBtn) {
    quoteNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextQuote();
      startQuoteTimer();
    });
  }

  quoteDots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      showQuote(i);
      startQuoteTimer();
    });
  });

  if (quoteCard) {
    quoteCard.addEventListener('mouseenter', stopQuoteTimer);
    quoteCard.addEventListener('mouseleave', startQuoteTimer);
    quoteCard.addEventListener('touchstart', stopQuoteTimer, { passive: true });
    quoteCard.addEventListener('touchend', startQuoteTimer, { passive: true });
  }

  startQuoteTimer();
  window.showQuote = showQuote;

  // Initial trigger
  syncSubtitleWidth();
  measureAboutInk();
  updateScrollVisuals();
});
