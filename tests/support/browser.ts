/**
 * Stand-ins for the browser APIs jsdom does not implement (matchMedia, IntersectionObserver,
 * ResizeObserver, canvas, Web Animations, scrolling), with controls the tests use to drive them.
 * Installed for every test file by `tests/setup.ts`.
 */
import { act } from "@testing-library/react";
import { vi } from "vitest";

/* ------------------------------------------------------------------ */
/* matchMedia: reduced motion and colour scheme                        */
/* ------------------------------------------------------------------ */

const media = { reducedMotion: false, dark: false };

type Listener = (event: { matches: boolean; media: string }) => void;
const mediaLists: { query: string; listeners: Set<Listener>; last: boolean }[] = [];

function evaluate(query: string) {
  if (query.includes("prefers-reduced-motion")) return media.reducedMotion;
  if (query.includes("prefers-color-scheme: dark")) return media.dark;
  return false;
}

function matchMedia(query: string): MediaQueryList {
  const entry = { query, listeners: new Set<Listener>(), last: evaluate(query) };
  mediaLists.push(entry);
  return {
    media: query,
    get matches() {
      return evaluate(query);
    },
    onchange: null,
    addEventListener: (_: string, listener: Listener) => entry.listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => entry.listeners.delete(listener),
    addListener: (listener: Listener) => entry.listeners.add(listener),
    removeListener: (listener: Listener) => entry.listeners.delete(listener),
    dispatchEvent: () => true,
  } as unknown as MediaQueryList;
}

function notifyMedia() {
  for (const entry of mediaLists) {
    const matches = evaluate(entry.query);
    if (matches === entry.last) continue;
    entry.last = matches;
    entry.listeners.forEach((listener) => listener({ matches, media: entry.query }));
  }
}

/** Switches the OS "reduce motion" preference, notifying every listener (framer-motion, LenisProvider). */
export function setReducedMotion(reduce: boolean) {
  media.reducedMotion = reduce;
  act(() => notifyMedia());
}

/** Switches the OS colour scheme seen by `prefers-color-scheme` queries (next-themes' "system"). */
export function setPrefersDark(dark: boolean) {
  media.dark = dark;
  act(() => notifyMedia());
}

/* ------------------------------------------------------------------ */
/* IntersectionObserver                                                */
/* ------------------------------------------------------------------ */

class MockIntersectionObserver {
  static instances = new Set<MockIntersectionObserver>();
  readonly targets = new Set<Element>();
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
    MockIntersectionObserver.instances.delete(this);
  }
  takeRecords() {
    return [];
  }
  fire(isIntersecting: boolean, only?: Element) {
    const entries = [...this.targets]
      .filter((target) => !only || target === only || target.contains(only) || only.contains(target))
      .map(
        (target) =>
          ({
            target,
            isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
            time: 0,
          }) as IntersectionObserverEntry,
      );
    if (entries.length) this.callback(entries, this as unknown as IntersectionObserver);
  }
}

/**
 * Reports observed elements as entering (or leaving) the viewport. With `only`, just the observers
 * watching that element, its ancestors or its descendants are notified.
 */
export function setIntersecting(isIntersecting: boolean, only?: Element) {
  act(() => {
    for (const observer of [...MockIntersectionObserver.instances]) observer.fire(isIntersecting, only);
  });
}

/** Number of elements currently watched by IntersectionObservers. */
export function observedElementCount() {
  return [...MockIntersectionObserver.instances].reduce((n, o) => n + o.targets.size, 0);
}

/* ------------------------------------------------------------------ */
/* ResizeObserver                                                      */
/* ------------------------------------------------------------------ */

class MockResizeObserver {
  static instances = new Set<MockResizeObserver>();
  readonly targets = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {
    MockResizeObserver.instances.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
    MockResizeObserver.instances.delete(this);
  }
  fire() {
    if (!this.targets.size) return;
    const entries = [...this.targets].map((target) => ({ target, contentRect: target.getBoundingClientRect() }));
    this.callback(entries as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
}

/** Notifies every ResizeObserver that its elements changed size. */
export function triggerResize() {
  act(() => {
    for (const observer of [...MockResizeObserver.instances]) observer.fire();
  });
}

export function resizeObserverCount() {
  return MockResizeObserver.instances.size;
}

/* ------------------------------------------------------------------ */
/* Canvas 2D context                                                   */
/* ------------------------------------------------------------------ */

export type FakeContext2D = Record<
  "clearRect" | "beginPath" | "moveTo" | "lineTo" | "stroke" | "arc" | "fill" | "setTransform",
  ReturnType<typeof vi.fn>
> & { strokeStyle: string; fillStyle: string; lineWidth: number };

export const canvasContexts: FakeContext2D[] = [];

function createContext2D(): FakeContext2D {
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 1,
  };
  canvasContexts.push(ctx);
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Web Animations API (Element.animate)                                */
/* ------------------------------------------------------------------ */

export type FakeAnimation = {
  element: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  onfinish: (() => void) | null;
  cancel: ReturnType<typeof vi.fn>;
  finish: () => void;
};

export const elementAnimations: FakeAnimation[] = [];

/* ------------------------------------------------------------------ */
/* Page scrolling (framer-motion's useScroll reads the scrolling element) */
/* ------------------------------------------------------------------ */

const page = { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };

/** Waits for framer-motion's frame loop (requestAnimationFrame) to flush. */
export async function nextFrames(count = 3) {
  await act(async () => {
    for (let i = 0; i < count; i++) await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
}

/**
 * Scrolls the page to `top`. `scrollHeight` and `clientHeight` describe the document and the
 * viewport, which jsdom (having no layout) reports as 0.
 */
export async function scrollPage(top: number, { scrollHeight = 10000, clientHeight = 800 } = {}) {
  Object.assign(page, { scrollTop: top, scrollHeight, clientHeight });
  Object.defineProperty(window, "scrollY", { configurable: true, value: top });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: clientHeight });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  await nextFrames();
}

/* ------------------------------------------------------------------ */
/* Install / reset                                                     */
/* ------------------------------------------------------------------ */

export function installBrowserMocks() {
  Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: matchMedia });
  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(window, "ResizeObserver", { configurable: true, writable: true, value: MockResizeObserver });
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, writable: true, value: MockResizeObserver });
  const root = document.documentElement;
  Object.defineProperty(document, "scrollingElement", { configurable: true, get: () => root });
  Object.defineProperty(root, "scrollTop", { configurable: true, get: () => page.scrollTop });
  Object.defineProperty(root, "scrollHeight", { configurable: true, get: () => page.scrollHeight });
  Object.defineProperty(root, "clientHeight", { configurable: true, get: () => page.clientHeight });
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn(function getContext(this: HTMLCanvasElement, kind: string) {
    return kind === "2d" ? createContext2D() : null;
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  // Installed on HTMLElement rather than Element: framer-motion only switches to the Web Animations
  // API when Element.prototype itself has `animate`, and this stand-in never plays its keyframes
  HTMLElement.prototype.animate = vi.fn(function animate(
    this: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) {
    const animation: FakeAnimation = {
      element: this,
      keyframes,
      options,
      onfinish: null,
      cancel: vi.fn(),
      finish() {
        this.onfinish?.();
      },
    };
    elementAnimations.push(animation);
    return animation;
  }) as unknown as typeof HTMLElement.prototype.animate;
}

export function resetBrowserMocks() {
  media.reducedMotion = false;
  media.dark = false;
  // Keep the media lists: framer-motion subscribes once per module and must see the reset
  notifyMedia();
  Object.assign(page, { scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  canvasContexts.length = 0;
  elementAnimations.length = 0;
  MockIntersectionObserver.instances.clear();
  MockResizeObserver.instances.clear();
  vi.mocked(window.scrollTo).mockClear();
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
}
