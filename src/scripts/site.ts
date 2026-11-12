import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initLoading } from './loading';

gsap.registerPlugin(ScrollTrigger);

let disposeSite: (() => void) | undefined;

export function initSite() {
  disposeSite?.();
  const controller = new AbortController();
  const { signal } = controller;
  const loadingReady = initLoading(signal);
  const header = document.querySelector<HTMLElement>('[data-header]');
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menuToggleSlot = document.querySelector<HTMLElement>('[data-menu-toggle-slot]');
  const menuPanel = document.querySelector<HTMLElement>('[data-menu-panel]');
  const menuLineFirst = menuToggle?.querySelector('.menu-toggle-line-first');
  const menuLineSecond = menuToggle?.querySelector('.menu-toggle-line-second');
  const menuLabelOpen = menuToggle?.querySelector('[data-menu-label-open]');
  const menuLabelClose = menuToggle?.querySelector('[data-menu-label-close]');
  const menuButtonParts = [menuLineFirst, menuLineSecond, menuLabelOpen, menuLabelClose].filter((part): part is Element => Boolean(part));
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis: Lenis | undefined;
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let pointerStart: { x: number; y: number } | undefined;
  let menuAnimation: gsap.core.Timeline | undefined;
  let menuTargetOpen = false;
  let menuRequest: { promise: Promise<boolean>; resolve: (completed: boolean) => void } | undefined;
  let anchorRequest = 0;
  let entranceTimeline: gsap.core.Timeline | undefined;
  const entranceTargets = '.site-header, .hero .eyebrow, .hero-line > span, .hero-intro, [data-hero-photo], .hero-facts';

  const refresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    }, 120);
  };
  document.addEventListener('at:loading-complete', () => {
    if (!menu?.open) lenis?.start();
    refresh();
  }, { signal });

  const setMenuState = (open: boolean, restoreFocus = true): Promise<boolean> => {
    if (!menu || !menuToggle || !menuToggleSlot || !menuPanel) return Promise.resolve(true);
    if (menuTargetOpen === open && menuRequest) return menuRequest.promise;
    if (menuTargetOpen === open && menu.open === open) return Promise.resolve(true);

    menuAnimation?.kill();
    menuRequest?.resolve(false);
    menuTargetOpen = open;
    let resolveRequest!: (completed: boolean) => void;
    const promise = new Promise<boolean>((resolve) => { resolveRequest = resolve; });
    menuRequest = { promise, resolve: resolveRequest };
    const items = menu.querySelectorAll('.mobile-menu-inner > .eyebrow, .mobile-menu nav a, .mobile-menu-inner > .button, .mobile-contact');
    const finish = () => {
      menuAnimation = undefined;
      menuRequest = undefined;
      if (!open) {
        menu.close();
        menuToggleSlot.append(menuToggle);
        document.body.classList.remove('menu-open');
        lenis?.start();
        if (restoreFocus) menuToggle.focus({ preventScroll: true });
      }
      gsap.set([menuPanel, ...items], { clearProps: 'opacity,transform' });
      menu.style.removeProperty('--menu-backdrop-opacity');
      resolveRequest(true);
    };

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (open) {
      const wasClosed = !menu.open;
      lenis?.stop();
      document.body.classList.add('menu-open');
      if (wasClosed) {
        // Move the same button into the modal's top layer, keeping its fixed coordinates.
        // The empty header slot preserves the layout while the dialog is open.
        menu.prepend(menuToggle);
        menu.showModal();
        menuPanel.scrollTop = 0;
        if (!motionPreference.matches) {
          gsap.set(menuPanel, { opacity: 0, y: -18 });
          gsap.set(menu, { '--menu-backdrop-opacity': 0 });
          gsap.set(items, { opacity: 0, y: 18 });
        }
      }
      menuToggle.focus({ preventScroll: true });
    }

    if (motionPreference.matches || !menu.open) {
      if (menuLineFirst) gsap.set(menuLineFirst, { y: open ? 0 : -4, rotation: open ? 45 : 0 });
      if (menuLineSecond) gsap.set(menuLineSecond, { y: open ? 0 : 4, rotation: open ? -45 : 0 });
      if (menuLabelOpen) gsap.set(menuLabelOpen, { opacity: open ? 0 : 1, y: open ? -6 : 0 });
      if (menuLabelClose) gsap.set(menuLabelClose, { opacity: open ? 1 : 0, y: open ? 0 : 6 });
      finish();
      return promise;
    }

    menuAnimation = gsap.timeline({ onComplete: finish });
    if (menuLineFirst) menuAnimation.to(menuLineFirst, { y: open ? 0 : -4, rotation: open ? 45 : 0, duration: .38, ease: 'power3.inOut' }, 0);
    if (menuLineSecond) menuAnimation.to(menuLineSecond, { y: open ? 0 : 4, rotation: open ? -45 : 0, duration: .38, ease: 'power3.inOut' }, 0);
    if (menuLabelOpen) menuAnimation.to(menuLabelOpen, { opacity: open ? 0 : 1, y: open ? -6 : 0, duration: .25, ease: 'power2.inOut' }, 0);
    if (menuLabelClose) menuAnimation.to(menuLabelClose, { opacity: open ? 1 : 0, y: open ? 0 : 6, duration: .25, ease: 'power2.inOut' }, .05);
    if (open) {
      menuAnimation
        .to(menuPanel, { opacity: 1, y: 0, duration: .42, ease: 'power3.out' }, 0)
        .to(menu, { '--menu-backdrop-opacity': 1, duration: .42, ease: 'power3.out' }, 0)
        .to(items, { opacity: 1, y: 0, duration: .4, stagger: .035, ease: 'power2.out' }, .08);
    } else {
      menuAnimation
        .to(items, { opacity: 0, y: -8, duration: .18, ease: 'power1.in' }, 0)
        .to(menuPanel, { opacity: 0, y: -12, duration: .28, ease: 'power2.inOut' }, .04)
        .to(menu, { '--menu-backdrop-opacity': 0, duration: .28, ease: 'power2.inOut' }, .04);
    }
    return promise;
  };

  menuToggle?.addEventListener('click', () => { void setMenuState(!menuTargetOpen); }, { signal });
  menu?.addEventListener('cancel', (event) => {
    event.preventDefault();
    setMenuState(false);
  }, { signal });
  menu?.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element) {
      const link = target.closest('a');
      if (link && !link.getAttribute('href')?.startsWith('#')) void setMenuState(false, false);
    }
  }, { signal });

  // Keep ordinary anchor links functional when JavaScript is unavailable.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', async (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = anchor.getAttribute('href');
      const target = hash && document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      const request = ++anchorRequest;
      if (menu?.open) {
        const closed = await setMenuState(false, false);
        if (!closed || signal.aborted || request !== anchorRequest) return;
      }
      const headerHeight = header?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 20);
      if (window.location.hash !== hash) window.history.pushState(null, '', hash);
      const focusTarget = () => {
        if (!target.matches('a, button, input, select, textarea, [tabindex]')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true, signal });
        }
        target.focus({ preventScroll: true });
      };
      if (lenis && !motionPreference.matches) {
        lenis.scrollTo(top, { duration: 1.05, onComplete: focusTarget });
      } else {
        window.scrollTo({ top, behavior: motionPreference.matches ? 'instant' : 'smooth' });
        focusTarget();
      }
    }, { signal });
  });

  // A small, manual gallery: no timed movement while guests are reading.
  const galleryCleanups: Array<() => void> = [];
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((gallery) => {
    const slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-slide]'));
    const counter = gallery.querySelector<HTMLElement>('[data-gallery-current]');
    const viewport = gallery.querySelector<HTMLElement>('.gallery-viewport');
    let current = 0;
    let transition: gsap.core.Tween | undefined;
    if (slides.length < 2) return;

    const showSlide = (next: number) => {
      transition?.kill();
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        slide.hidden = index !== current;
        slide.setAttribute('aria-hidden', String(index !== current));
        slide.style.removeProperty('opacity');
      });
      if (counter) counter.textContent = String(current + 1).padStart(2, '0');
      if (!motionPreference.matches) transition = gsap.fromTo(slides[current], { opacity: .35 }, { opacity: 1, duration: .45, ease: 'power1.out', clearProps: 'opacity' });
    };

    slides.forEach((slide, index) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'スライド');
      slide.setAttribute('aria-label', `${index + 1} / ${slides.length}`);
      slide.setAttribute('aria-hidden', String(index !== current));
    });
    gallery.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showSlide(current - 1), { signal });
    gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => showSlide(current + 1), { signal });
    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(current + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(current - 1); }
    }, { signal });
    viewport?.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return;
      pointerStart = { x: event.clientX, y: event.clientY };
    }, { signal });
    viewport?.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const x = event.clientX - pointerStart.x;
      const y = event.clientY - pointerStart.y;
      if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.5) showSlide(current + (x < 0 ? 1 : -1));
      pointerStart = undefined;
    }, { signal });
    viewport?.addEventListener('pointercancel', () => { pointerStart = undefined; }, { signal });
    galleryCleanups.push(() => transition?.kill());
  });

  const disclosureCleanups: Array<() => void> = [];
  const finishDisclosures: Array<() => void> = [];
  document.querySelectorAll<HTMLDetailsElement>('.faq-item').forEach((item) => {
    const summary = item.querySelector<HTMLElement>('summary');
    const panel = item.querySelector<HTMLElement>('.faq-panel');
    const content = item.querySelector<HTMLElement>('.faq-answer');
    if (!summary || !panel || !content) return;
    let expanded = item.open;
    let animation: gsap.core.Timeline | undefined;
    const updateState = () => {
      summary.setAttribute('aria-expanded', String(expanded));
      item.dataset.expanded = String(expanded);
      panel.inert = !expanded;
    };
    updateState();

    const setExpanded = (open: boolean) => {
      animation?.kill();
      animation = undefined;
      const currentHeight = item.open ? panel.getBoundingClientRect().height : 0;
      const wasClosed = !item.open;
      expanded = open;
      updateState();
      if (!open && panel.contains(document.activeElement)) summary.focus({ preventScroll: true });
      if (open) item.open = true;

      const finish = () => {
        animation = undefined;
        item.open = expanded;
        gsap.set(panel, { clearProps: 'height' });
        gsap.set(content, { clearProps: 'opacity,transform' });
        refresh();
      };
      if (motionPreference.matches) { finish(); return; }

      gsap.set(panel, { height: currentHeight });
      if (wasClosed && open) gsap.set(content, { opacity: 0, y: -6 });
      animation = gsap.timeline({ onComplete: finish });
      animation
        .to(panel, { height: open ? content.getBoundingClientRect().height : 0, duration: open ? .42 : .34, ease: 'power2.inOut' }, 0)
        .to(content, { opacity: open ? 1 : 0, y: open ? 0 : -6, duration: open ? .3 : .2, ease: 'power2.out' }, open ? .07 : 0);
    };

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      setExpanded(!expanded);
    }, { signal });
    item.addEventListener('toggle', () => {
      if (!animation && item.open !== expanded) {
        expanded = item.open;
        updateState();
        refresh();
      }
    }, { signal });
    const contentObserver = new ResizeObserver(() => {
      if (!expanded) return;
      if (animation) setExpanded(true);
      else refresh();
    });
    contentObserver.observe(content);
    finishDisclosures.push(() => animation?.progress(1));
    disclosureCleanups.push(() => {
      animation?.kill();
      contentObserver.disconnect();
      item.open = expanded;
      delete item.dataset.expanded;
      summary.removeAttribute('aria-expanded');
      panel.inert = false;
      gsap.set(panel, { clearProps: 'height' });
      gsap.set(content, { clearProps: 'opacity,transform' });
    });
  });
  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) return;
    menuAnimation?.progress(1);
    entranceTimeline?.progress(1);
    finishDisclosures.forEach((finish) => finish());
  }, { signal });

  const roomLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-room-link]'));
  const roomObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    roomLinks.forEach((link) => {
      const active = link.dataset.roomLink === visible[0].target.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -45% 0px', threshold: 0 });
  document.querySelectorAll('[data-room-story]').forEach((story) => roomObserver.observe(story));

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true, signal });

  const media = gsap.matchMedia();
  media.add({
    desktop: '(min-width: 1024px)',
    smoothInput: '(hover: hover) and (pointer: fine)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { desktop, smoothInput, reduceMotion } = context.conditions!;
    if (reduceMotion) return;

    let localLenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    if (smoothInput) {
      localLenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, autoRaf: false });
      lenis = localLenis;
      localLenis.on('scroll', ScrollTrigger.update);
      tick = (time: number) => localLenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (menu?.open || document.documentElement.classList.contains('is-loading')) localLenis.stop();
    }

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      if (element.getBoundingClientRect().bottom < 0) return;
      gsap.from(element, {
        y: desktop ? 30 : 16,
        opacity: 0,
        duration: desktop ? .9 : .65,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 94%', once: true },
      });
    });

    if (desktop) {
      gsap.fromTo('.hero-photo > img', { yPercent: -3, scale: 1.07 }, {
        yPercent: 3,
        scale: 1.07,
        ease: 'none',
        scrollTrigger: { trigger: '.hero-photo-wrap', start: 'top bottom', end: 'bottom top', scrub: .7 },
      });
    }

    return () => {
      if (tick) gsap.ticker.remove(tick);
      localLenis?.destroy();
      if (lenis === localLenis) lenis = undefined;
    };
  });

  // Start the entrance only as the loading curtain reveals it, rather than behind it.
  void loadingReady.then(() => {
    if (signal.aborted) return;
    if (window.scrollY < 80 && !motionPreference.matches) {
      entranceTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.site-header', { opacity: 0, duration: .7 }, .05)
        .from('.hero .eyebrow', { opacity: 0, y: 10, duration: .65 }, 0)
        .from('.hero-line > span', { yPercent: 110, duration: 1.15, stagger: .12 }, .08)
        .from('.hero-intro', { opacity: 0, y: 16, duration: .8 }, .32)
        .from('[data-hero-photo]', { clipPath: 'inset(6% 2% 6% 2%)', duration: 1.25 }, .1)
        .from('.hero-facts', { opacity: 0, y: 10, duration: .8 }, .45);
    }
    refresh();
  });

  document.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', refresh, { once: true, signal });
  });
  document.fonts.ready.then(() => { if (!signal.aborted) refresh(); });
  window.addEventListener('load', refresh, { once: true, signal });
  refresh();

  disposeSite = () => {
    controller.abort();
    window.clearTimeout(refreshTimer);
    entranceTimeline?.kill();
    gsap.set(entranceTargets, { clearProps: 'opacity,transform,clipPath' });
    roomObserver.disconnect();
    menuAnimation?.kill();
    menuRequest?.resolve(false);
    disclosureCleanups.forEach((cleanup) => cleanup());
    galleryCleanups.forEach((cleanup) => cleanup());
    media.revert();
    menu?.close();
    if (menuToggle && menuToggleSlot) menuToggleSlot.append(menuToggle);
    gsap.set(menuButtonParts, { clearProps: 'opacity,transform' });
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'メニューを開く');
    if (menu) {
      gsap.set([menuPanel, ...menu.querySelectorAll('.mobile-menu-inner > .eyebrow, .mobile-menu nav a, .mobile-menu-inner > .button, .mobile-contact')].filter(Boolean), { clearProps: 'opacity,transform' });
      menu.style.removeProperty('--menu-backdrop-opacity');
    }
    document.body.classList.remove('menu-open');
    disposeSite = undefined;
  };
  document.addEventListener('astro:before-swap', () => disposeSite?.(), { once: true, signal });
}
