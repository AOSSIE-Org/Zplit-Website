/**
 * Shared test setup: stands in for what jsdom and Vitest cannot run (browser APIs, Next's image
 * optimiser and router) and resets that state between tests.
 */
import { createElement } from "react";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { installBrowserMocks, resetBrowserMocks } from "./support/browser";
import { resetNavigation } from "./support/navigation";

// next/image needs Next's image loader; a plain <img> keeps src and alt observable
vi.mock("next/image", () => ({
  default: ({ src, ...props }: { src: string | { src: string }; priority?: boolean }) => {
    // `priority` only steers Next's preloading; it is not an <img> attribute
    delete props.priority;
    return createElement("img", { src: typeof src === "string" ? src : src.src, ...props });
  },
}));

// The App Router is not mounted in unit tests: report a controllable path and a spy router
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  const { navigation } = await import("./support/navigation");
  return {
    ...actual,
    usePathname: () => navigation.pathname,
    useRouter: () => navigation.router,
    useParams: () => ({ locale: navigation.pathname.split("/")[1] }),
    notFound: () => {
      throw new Error("NEXT_NOT_FOUND");
    },
  };
});

installBrowserMocks();

// Allow for slow workers (coverage instrumentation) before a waitFor gives up
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  // Transitions finish on the next frame, so state changes (and AnimatePresence exits) settle
  // deterministically; tests about a motion itself switch this off
  MotionGlobalConfig.skipAnimations = true;
  resetBrowserMocks();
  resetNavigation();
});

afterEach(() => {
  cleanup();
  // Undo vi.spyOn spies even when a test fails before restoring its own
  vi.restoreAllMocks();
  if (vi.isFakeTimers()) {
    // Let pending animation frames run (jsdom schedules them on an interval) so framer-motion's
    // frame loop is not left waiting for a frame that the real timers will never deliver
    vi.advanceTimersByTime(100);
    vi.useRealTimers();
  }
});
