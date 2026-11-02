import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import fc from "fast-check";
import MeshCanvas from "@/components/footer/MeshCanvas";
import { canvasContexts, nextFrames, setIntersecting, setReducedMotion, triggerResize } from "../support/browser";

function renderMesh({ width = 800, height = 400 } = {}) {
  const view = render(
    <div data-testid="parent">
      <MeshCanvas />
    </div>,
  );
  const parent = view.getByTestId("parent");
  Object.defineProperty(parent, "clientWidth", { configurable: true, value: width });
  Object.defineProperty(parent, "clientHeight", { configurable: true, value: height });
  const canvas = parent.querySelector("canvas")!;
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0 } as DOMRect);
  const ctx = canvasContexts[canvasContexts.length - 1];
  return { ...view, parent, canvas, ctx };
}

/** Dots drawn in the last frame: every `fill()` is one device. */
const dotsDrawn = (ctx: (typeof canvasContexts)[number]) => ctx.fill.mock.calls.length;
const pointer = (type: string, x = 0, y = 0) => new PointerEvent(type, { clientX: x, clientY: y, bubbles: true });

describe("MeshCanvas", () => {
  it("is a decorative canvas behind the footer content", () => {
    const { canvas } = renderMesh();
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.className).toContain("pointer-events-none");
  });

  it("sizes itself to its parent and draws one dot per device", () => {
    const { canvas, ctx } = renderMesh({ width: 1700, height: 1000 });
    triggerResize();
    expect(canvas.width).toBe(1700);
    expect(canvas.style.width).toBe("1700px");
    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(dotsDrawn(ctx)).toBe(90); // 1700×1000 / 17000 = 100 devices, capped at 90
  });

  it("renders sharply on high-density screens, capping the pixel ratio at 2", () => {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    const { canvas, ctx } = renderMesh({ width: 400, height: 300 });
    triggerResize();
    expect([canvas.width, canvas.height]).toEqual([800, 600]);
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
  });

  it("treats an unknown pixel ratio as 1", () => {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 0 });
    const { canvas } = renderMesh({ width: 400, height: 300 });
    triggerResize();
    expect(canvas.width).toBe(400);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
  });

  it("re-seeds the devices on resize, leaving the running loop to draw them", async () => {
    const { parent, ctx } = renderMesh({ width: 800, height: 400 });
    triggerResize();
    setIntersecting(true);
    await nextFrames();
    Object.defineProperty(parent, "clientWidth", { configurable: true, value: 1600 });
    Object.defineProperty(parent, "clientHeight", { configurable: true, value: 800 });
    const clears = ctx.clearRect.mock.calls.length;
    triggerResize();
    expect(ctx.clearRect.mock.calls.length).toBe(clears); // no extra synchronous frame
    ctx.fill.mockClear();
    await nextFrames(1);
    expect(ctx.fill.mock.calls.length).toBe(Math.floor((1600 * 800) / 17000));
  });

  it("animates only while on screen", async () => {
    const { ctx } = renderMesh();
    triggerResize();
    const still = ctx.clearRect.mock.calls.length;
    await nextFrames();
    expect(ctx.clearRect.mock.calls.length).toBe(still);

    setIntersecting(true);
    await nextFrames();
    const running = ctx.clearRect.mock.calls.length;
    expect(running).toBeGreaterThan(still);

    setIntersecting(false);
    await nextFrames(1);
    const stopped = ctx.clearRect.mock.calls.length;
    await nextFrames();
    expect(ctx.clearRect.mock.calls.length).toBe(stopped);
  });

  it("links the pointer to nearby devices and sends a pulse on click", async () => {
    const { parent, ctx } = renderMesh();
    triggerResize();
    setIntersecting(true);
    await nextFrames();

    act(() => {
      parent.dispatchEvent(pointer("pointermove", 400, 200));
    });
    ctx.moveTo.mockClear();
    await nextFrames();
    expect(ctx.moveTo.mock.calls.some(([x, y]) => x === 400 && y === 200)).toBe(true);

    act(() => {
      parent.dispatchEvent(pointer("pointerdown", 100, 50));
    });
    ctx.arc.mockClear();
    await nextFrames(1);
    // The pulse ring is centred where the click landed and grows each frame
    const ring = ctx.arc.mock.calls.filter(([x, y]) => x === 100 && y === 50);
    expect(ring.length).toBeGreaterThan(0);
    expect(ring[0][2]).toBeGreaterThan(4);

    act(() => {
      parent.dispatchEvent(pointer("pointerleave"));
    });
    ctx.moveTo.mockClear();
    await nextFrames();
    // The pointer's links are gone once it leaves
    expect(ctx.moveTo.mock.calls.some(([x, y]) => x === 400 && y === 200)).toBe(false);
  });

  it("lets pulses fade out over time", async () => {
    const { parent, ctx } = renderMesh();
    triggerResize();
    setIntersecting(true);
    act(() => {
      parent.dispatchEvent(pointer("pointerdown", 100, 50));
    });
    // alpha 0.7 × 0.955^n drops below 0.02 after ~78 frames
    await nextFrames(90);
    ctx.arc.mockClear();
    await nextFrames(1);
    expect(ctx.arc.mock.calls.filter(([x, y]) => x === 100 && y === 50)).toHaveLength(0);
  });

  it("draws a single still frame for reduced motion, redrawing only on pointer moves", async () => {
    setReducedMotion(true);
    const { parent, ctx } = renderMesh();
    triggerResize();
    setIntersecting(true);
    const frames = ctx.clearRect.mock.calls.length;
    await nextFrames();
    expect(ctx.clearRect.mock.calls.length).toBe(frames);

    act(() => {
      parent.dispatchEvent(pointer("pointermove", 10, 10));
    });
    expect(ctx.clearRect.mock.calls.length).toBe(frames + 1);
    act(() => {
      parent.dispatchEvent(pointer("pointerleave"));
    });
    expect(ctx.clearRect.mock.calls.length).toBe(frames + 2);

    ctx.arc.mockClear();
    act(() => {
      parent.dispatchEvent(pointer("pointerdown", 10, 10));
    });
    expect(ctx.arc).not.toHaveBeenCalled(); // no pulse
  });

  it("stops listening and observing when unmounted", () => {
    const { parent, ctx, unmount } = renderMesh();
    triggerResize();
    unmount();
    const calls = ctx.clearRect.mock.calls.length;
    parent.dispatchEvent(pointer("pointermove", 10, 10));
    triggerResize();
    expect(ctx.clearRect.mock.calls.length).toBe(calls);
  });

  it("does nothing without a 2D context", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { parent } = renderMesh();
    expect(() => triggerResize()).not.toThrow();
    expect(parent.querySelector("canvas")!.width).toBe(300); // default canvas size, untouched
    getContext.mockRestore();
  });

  it("property: any canvas size gets 24–90 devices, all drawn inside it as they move", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 50, max: 2500 }), fc.integer({ min: 50, max: 1500 }), async (width, height) => {
        const { ctx, unmount } = renderMesh({ width, height });
        triggerResize();
        const expected = Math.min(90, Math.max(24, Math.floor((width * height) / 17000)));
        expect(dotsDrawn(ctx)).toBe(expected);

        setIntersecting(true);
        await nextFrames(3);
        ctx.fill.mockClear();
        ctx.arc.mockClear();
        await nextFrames(1);
        const dots = ctx.arc.mock.calls.slice(-expected);
        for (const [x, y] of dots) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(width);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(height);
        }
        unmount();
      }),
      { numRuns: 20 },
    );
  });
});
