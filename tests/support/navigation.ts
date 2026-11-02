/**
 * State behind the `next/navigation` mock in `tests/setup.ts`: the current browser path
 * (locale-prefixed, as Next reports it) and a router whose calls the tests inspect.
 */
import { vi } from "vitest";

export const navigation = {
  pathname: "/en",
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  },
};

/** Sets the path Next reports, e.g. `/en` (home) or `/hi/privacy`. */
export function setPathname(pathname: string) {
  navigation.pathname = pathname;
}

export function resetNavigation() {
  navigation.pathname = "/en";
  Object.values(navigation.router).forEach((fn) => fn.mockReset());
}
