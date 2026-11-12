import { gsap } from 'gsap';

/** Resolves when the curtain starts revealing the page, or on an early release. */
export function initLoading(signal: AbortSignal): Promise<void> {
  const root = document.documentElement;
  const screen = document.querySelector<HTMLElement>('[data-loading-screen]');
  if (!screen || !root.classList.contains('is-loading')) return Promise.resolve();
  const shell = document.querySelector<HTMLElement>('.site-shell');
  if (shell) shell.inert = true;

  const content = screen.querySelector<HTMLElement>('[data-loading-content]');
  const bar = screen.querySelector<HTMLElement>('[data-loading-bar]');
  const counter = screen.querySelector<HTMLElement>('[data-loading-percent]');
  const progressbar = screen.querySelector<HTMLElement>('[data-loading-progress]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const started = Number(root.dataset.loadingStarted) || performance.now();
  const listeners = new AbortController();
  const progress = { value: 0 };
  let progressTween: gsap.core.Tween | undefined;
  let entrance: gsap.core.Tween | undefined;
  let exit: gsap.core.Timeline | undefined;
  let minimumTimer: ReturnType<typeof setTimeout> | undefined;
  let maximumTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let revealing = false;
  let readyToReveal = false;
  let completed = 0;
  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => { resolveReady = resolve; });

  const renderProgress = () => {
    const value = Math.round(progress.value);
    if (bar) bar.style.transform = `scaleX(${progress.value / 100})`;
    if (counter) counter.textContent = String(value).padStart(2, '0');
    progressbar?.setAttribute('aria-valuenow', String(value));
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    listeners.abort();
    signal.removeEventListener('abort', release);
    window.clearTimeout(minimumTimer);
    window.clearTimeout(maximumTimer);
    progressTween?.kill();
    entrance?.kill();
    exit?.kill();
    resolveReady();
  };

  const release = () => {
    if (disposed) return;
    const wasLoading = root.classList.contains('is-loading');
    root.classList.remove('is-loading', 'is-revealing');
    if (shell) shell.inert = false;
    screen.hidden = true;
    dispose();
    if (wasLoading) document.dispatchEvent(new Event('at:loading-complete'));
  };

  const reveal = () => {
    if (disposed || revealing) return;
    const remaining = motionPreference.matches ? 0 : Math.max(0, 700 - (performance.now() - started));
    if (remaining > 0) {
      window.clearTimeout(minimumTimer);
      minimumTimer = window.setTimeout(reveal, remaining);
      return;
    }
    revealing = true;
    window.clearTimeout(maximumTimer);
    if (motionPreference.matches) { release(); return; }
    entrance?.kill();
    exit = gsap.timeline({ onComplete: release });
    if (content) exit.to(content, { opacity: 0, y: -14, duration: .28, ease: 'power2.in' }, 0);
    exit.call(() => {
      root.classList.add('is-revealing');
      resolveReady();
    }, [], .12);
    exit.to(screen, { clipPath: 'inset(0 0 100% 0)', duration: .72, ease: 'power3.inOut' }, .12);
  };

  const advance = () => {
    if (disposed || revealing) return;
    completed += 1;
    const target = completed / 4 * 100;
    progressTween?.kill();
    if (motionPreference.matches) {
      progress.value = target;
      renderProgress();
      if (completed === 4) { readyToReveal = true; reveal(); }
      return;
    }
    progressTween = gsap.to(progress, {
      value: target,
      duration: .28,
      ease: 'power1.out',
      onUpdate: renderProgress,
      onComplete: () => {
        if (completed === 4) { readyToReveal = true; reveal(); }
      },
    });
  };

  const waitForImage = (image: HTMLImageElement | null): Promise<void> => {
    if (!image) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const settle = () => {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', settle);
        listeners.signal.removeEventListener('abort', settle);
        resolve();
      };
      const loaded = () => {
        if (typeof image.decode === 'function') void image.decode().catch(() => {}).then(settle);
        else settle();
      };
      listeners.signal.addEventListener('abort', settle, { once: true });
      if (image.complete) loaded();
      else {
        image.addEventListener('load', loaded, { once: true });
        image.addEventListener('error', settle, { once: true });
      }
    });
  };

  document.addEventListener('at:loading-complete', release, { signal: listeners.signal });
  signal.addEventListener('abort', release, { once: true });
  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) return;
    entrance?.progress(1);
    progressTween?.progress(1);
    if (revealing || readyToReveal) release();
  }, { signal: listeners.signal });
  renderProgress();
  if (!motionPreference.matches && content) entrance = gsap.from(content, { opacity: 0, y: 12, duration: .5, ease: 'power2.out' });

  // Track completed preparations, rather than estimating network byte percentages.
  const domReady = document.readyState !== 'loading' ? Promise.resolve() : new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true, signal: listeners.signal });
  });
  const resources = [
    waitForImage(screen.querySelector<HTMLImageElement>('[data-loading-logo]')),
    waitForImage(document.querySelector<HTMLImageElement>('[data-hero-photo] img')),
    document.fonts.ready.then(() => {}).catch(() => {}),
    domReady,
  ];
  resources.forEach((resource) => { void resource.then(advance); });
  maximumTimer = window.setTimeout(reveal, Math.max(0, 4200 - (performance.now() - started)));
  return ready;
}
