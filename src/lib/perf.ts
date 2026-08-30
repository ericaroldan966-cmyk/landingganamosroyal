type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let cachedHeavy: boolean | null = null;

function readHints(): NavigatorHints {
  return navigator as NavigatorHints;
}

export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return true;
  const nav = readHints();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (nav.connection?.saveData) return true;
  const net = nav.connection?.effectiveType;
  if (net === '2g' || net === 'slow-2g') return true;
  if ((nav.deviceMemory ?? 8) <= 4) return true;
  if ((nav.hardwareConcurrency ?? 8) <= 4) return true;
  return false;
}

export function isTouchPrimary(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
}

export function shouldUseHeavyEffects(): boolean {
  if (cachedHeavy != null) return cachedHeavy;
  cachedHeavy = !isLowEndDevice() && !isTouchPrimary();
  return cachedHeavy;
}

export function applyPerfHints(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!shouldUseHeavyEffects()) root.classList.add('perf-lite');
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('perf-paused', document.hidden);
  });
}
