import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import fc from "fast-check";
import { MotionGlobalConfig } from "framer-motion";
import InnovationSection from "@/components/InnovationSection";
import LegoTechStackBuilder, { ALL_TECH_MODULES, type TechModule } from "@/components/TechStackMiniGame";
import { catalogs, locales, renderWithIntl, translator } from "../support/intl";
import { elementAnimations, nextFrames, triggerResize } from "../support/browser";

const t = translator("en", "TechStack");
const moduleName = (m: TechModule, locale: "en" | "hi" = "en") => catalogs[locale].TechStack.modules[m.id as keyof typeof catalogs.en.TechStack.modules].name;
const equipButton = (m: TechModule) => screen.getByRole("button", { name: t("actions.equip", { name: moduleName(m) }) });
const removeButton = (m: TechModule) => screen.getByRole("button", { name: t("actions.remove", { name: moduleName(m) }) });
const equipLabels = () =>
  screen.queryAllByRole("button", { name: /^Equip (?!All)/ }).map((b) => b.getAttribute("aria-label"));
const removeLabels = () => screen.queryAllByRole("button", { name: /^Remove / }).map((b) => b.getAttribute("aria-label"));

/** Fakes only timeouts, so framer-motion keeps animating on real animation frames. */
const fakeTimeouts = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

describe("InnovationSection", () => {
  it("opens on the tech stack tab and switches to the P2P methods", async () => {
    const it = translator("en", "Innovation");
    renderWithIntl(<InnovationSection />);
    const stackTab = screen.getByRole("tab", { name: it("tabTechStack") });
    const p2pTab = screen.getByRole("tab", { name: it("tabP2P") });
    expect(stackTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("tab-techStack");
    expect(screen.getByText(t("base.title"))).toBeTruthy();

    fireEvent.click(p2pTab);
    expect(p2pTab.getAttribute("aria-selected")).toBe("true");
    expect(stackTab.getAttribute("aria-selected")).toBe("false");
    await waitFor(() => expect(screen.getByRole("tabpanel").id).toBe("tabpanel-p2p"));
    const panel = screen.getByRole("tabpanel");
    for (const key of ["wifiDirect", "bluetooth", "nfc", "qrDeepLinks"]) {
      expect(within(panel).getByRole("heading", { name: it(`p2p.${key}.title`) })).toBeTruthy();
      expect(within(panel).getByText(it(`p2p.${key}.badge`))).toBeTruthy();
    }

    fireEvent.click(stackTab);
    await waitFor(() => expect(screen.getByRole("tabpanel").id).toBe("tabpanel-techStack"));
  });

  it.each(locales)("labels the tabs in %s", (locale) => {
    renderWithIntl(<InnovationSection />, { locale });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(catalogs[locale].Innovation.heading);
    expect(screen.getByRole("tab", { name: catalogs[locale].Innovation.tabP2P })).toBeTruthy();
  });
});

describe("LegoTechStackBuilder", () => {

  it("starts with every module in the pool and an empty base", () => {
    renderWithIntl(<LegoTechStackBuilder />);
    expect(equipLabels()).toEqual(ALL_TECH_MODULES.map((m) => t("actions.equip", { name: moduleName(m) })));
    expect(removeLabels()).toEqual([]);
    expect(screen.getByText(t("base.selectTech"))).toBeTruthy();
    expect(screen.getByText(t("empty.stageHint"))).toBeTruthy();
    expect(screen.getByRole("button", { name: t("controls.equipAll", { count: ALL_TECH_MODULES.length }) })).toBeTruthy();
    expect(screen.queryByRole("button", { name: t("controls.reset") })).toBeNull();
  });

  it("filters the pool by category", () => {
    renderWithIntl(<LegoTechStackBuilder />);
    fireEvent.click(screen.getByRole("button", { name: t("categories.Storage") }));
    expect(equipLabels()).toEqual(
      ALL_TECH_MODULES.filter((m) => m.category === "Storage").map((m) => t("actions.equip", { name: moduleName(m) })),
    );
    fireEvent.click(screen.getByRole("button", { name: t("categories.All") }));
    expect(equipLabels()).toHaveLength(ALL_TECH_MODULES.length);
  });

  it("stacks a module with a flight animation, levels up, and removes it again", async () => {
    const [flutter, riverpod] = ALL_TECH_MODULES;
    renderWithIntl(<LegoTechStackBuilder />);

    fireEvent.click(equipButton(flutter));
    expect(removeLabels()).toEqual([t("actions.remove", { name: moduleName(flutter) })]);
    expect(screen.getByText(t("base.level", { level: 10 }))).toBeTruthy();
    expect(screen.getByRole("button", { name: t("controls.reset") })).toBeTruthy();

    // The block flies from the pool to the stack; clicks are ignored until it lands
    expect(elementAnimations).toHaveLength(1);
    expect(elementAnimations[0].options).toMatchObject({ duration: 1100, fill: "both" });
    fireEvent.click(removeButton(flutter));
    expect(removeLabels()).toHaveLength(1);
    act(() => elementAnimations[0].finish());

    fireEvent.click(equipButton(riverpod));
    act(() => elementAnimations[elementAnimations.length - 1].finish());
    expect(screen.getByText(t("base.level", { level: 20 }))).toBeTruthy();

    fireEvent.click(removeButton(flutter));
    await nextFrames();
    expect(removeLabels()).toEqual([t("actions.remove", { name: moduleName(riverpod) })]);
    expect(equipLabels()).toContain(t("actions.equip", { name: moduleName(flutter) }));
  });

  it("starts the flight from the block's place in the pool, corrected for the stage scale", () => {
    renderWithIntl(<LegoTechStackBuilder />);
    // Narrow container: the 390px stage is scaled to half size
    const stageBox = document.querySelector<HTMLElement>(".lg\\:w-\\[390px\\]")!;
    Object.defineProperty(stageBox, "clientWidth", { configurable: true, value: 195 });
    triggerResize();
    expect((stageBox.firstElementChild as HTMLElement).style.width).toBe("195px");
    expect((stageBox.querySelector(".origin-top-left") as HTMLElement).style.transform).toBe("scale(0.5)");

    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const inPool = this.querySelector('button[aria-label^="Equip"]') !== null;
      return { left: inPool ? 100 : 0, top: inPool ? 50 : 0, width: 0, height: 0 } as DOMRect;
    });
    fireEvent.click(equipButton(ALL_TECH_MODULES[0]));
    rect.mockRestore();

    const [first] = elementAnimations[0].keyframes as { transform: string }[];
    expect(first.transform).toBe("translate(200px, 100px) scale(1, 1)");
  });

  it("hides the studs covered by a stacked block once it has landed", () => {
    const { container } = renderWithIntl(<LegoTechStackBuilder modules={ALL_TECH_MODULES.slice(0, 1)} />);
    const studs = () => container.querySelectorAll(".flex-1.flex.items-end").length;
    const before = studs(); // 4 on the Flutter block + 6 on the base
    fireEvent.click(equipButton(ALL_TECH_MODULES[0]));
    expect(studs()).toBe(before);
    act(() => elementAnimations[0].finish());
    expect(studs()).toBe(before - 4);
  });

  it("equips every module one after another, then offers a reset", async () => {
    fakeTimeouts();
    const modules = ALL_TECH_MODULES.slice(0, 3);
    renderWithIntl(<LegoTechStackBuilder modules={modules} />);
    fireEvent.click(screen.getByRole("button", { name: t("controls.showAll") }));
    act(() => void vi.advanceTimersByTime(0));
    expect(removeLabels()).toHaveLength(1);
    act(() => void vi.advanceTimersByTime(75));
    expect(removeLabels()).toHaveLength(2);
    act(() => void vi.advanceTimersByTime(75 + 200));
    expect(removeLabels()).toHaveLength(3);

    expect(screen.getByText(t("empty.allEquippedGeneric"))).toBeTruthy();
    expect(screen.queryByRole("button", { name: t("controls.showAll") })).toBeNull();
    expect(screen.queryByRole("button", { name: /Equip All/ })).toBeNull();

    // Both reset buttons clear the stack
    fireEvent.click(screen.getAllByRole("button", { name: t("controls.reset") })[0]);
    await nextFrames();
    expect(removeLabels()).toEqual([]);
    expect(equipLabels()).toHaveLength(3);
    expect(screen.getByText(t("base.selectTech"))).toBeTruthy();
  });

  it("names the category in the empty pool message and stops a pending equip-all on reset", async () => {
    fakeTimeouts();
    renderWithIntl(<LegoTechStackBuilder />);
    fireEvent.click(screen.getByRole("button", { name: t("categories.Security") }));
    fireEvent.click(screen.getByRole("button", { name: t("controls.equipAll", { count: ALL_TECH_MODULES.length }) }));
    act(() => void vi.advanceTimersByTime(ALL_TECH_MODULES.length * 75 + 200));
    expect(screen.getByText(t("empty.allEquipped", { category: t("categories.Security") }))).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: t("controls.reset") })[0]);
    await nextFrames();
    expect(removeLabels()).toEqual([]);

    // Reset part-way through: the remaining blocks never arrive
    fireEvent.click(screen.getByRole("button", { name: t("controls.showAll") }));
    act(() => void vi.advanceTimersByTime(75));
    fireEvent.click(screen.getAllByRole("button", { name: t("controls.reset") })[0]);
    act(() => void vi.advanceTimersByTime(5000));
    await nextFrames();
    expect(removeLabels()).toEqual([]);
  });

  it("only equips what is left when some modules are already stacked", () => {
    fakeTimeouts();
    const modules = ALL_TECH_MODULES.slice(0, 2);
    renderWithIntl(<LegoTechStackBuilder modules={modules} />);
    fireEvent.click(equipButton(modules[1]));
    fireEvent.click(screen.getByRole("button", { name: t("controls.showAll") }));
    act(() => void vi.advanceTimersByTime(0));
    expect(removeLabels()).toEqual(modules.map((m) => t("actions.remove", { name: moduleName(m) })).reverse());
  });

  it("bounces the stack when a block lands", async () => {
    MotionGlobalConfig.skipAnimations = false;
    fakeTimeouts();
    const { container } = renderWithIntl(<LegoTechStackBuilder />);
    const stack = container.querySelector<HTMLElement>(".origin-top-left > .relative.w-full")!;
    fireEvent.click(equipButton(ALL_TECH_MODULES[0]));
    expect(stack.style.transform).toBe("");
    act(() => void vi.advanceTimersByTime(990));
    vi.useRealTimers();
    await act(() => new Promise((resolve) => setTimeout(resolve, 120)));
    expect(stack.style.transform).toMatch(/translateY\(\d/);
  });

  it("moves the light highlight with the pointer", async () => {
    const { container } = renderWithIntl(<LegoTechStackBuilder modules={ALL_TECH_MODULES.slice(0, 1)} />);
    const root = container.firstElementChild as HTMLElement;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect);
    fireEvent.pointerMove(root, { clientX: 50, clientY: 75 });
    // A second move in the same frame is dropped
    fireEvent.pointerMove(root, { clientX: 150, clientY: 25 });
    await act(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
    const highlight = container.querySelector<HTMLElement>(".z-20.pointer-events-none.opacity-60")!;
    expect(highlight.style.background).toContain("25% 75%");
  });

  it("parks a block too wide for the base at its left edge rather than losing it", () => {
    const wide = { ...ALL_TECH_MODULES[0], studs: 7 };
    const { container } = renderWithIntl(<LegoTechStackBuilder modules={[wide]} />);
    fireEvent.click(equipButton(wide));
    const placed = container.querySelector<HTMLElement>("[style*='bottom'][style*='left']")!;
    expect([placed.style.bottom, placed.style.left]).toEqual(["0px", "0px"]);
    expect(removeLabels()).toEqual([t("actions.remove", { name: moduleName(wide) })]);
  });

  it("keeps a block the user equipped while equip-all is still running, without duplicating it", () => {
    fakeTimeouts();
    const modules = ALL_TECH_MODULES.slice(0, 3);
    renderWithIntl(<LegoTechStackBuilder modules={modules} />);
    fireEvent.click(screen.getByRole("button", { name: t("controls.showAll") }));
    act(() => void vi.advanceTimersByTime(0));
    fireEvent.click(equipButton(modules[2])); // before its turn comes
    act(() => void vi.advanceTimersByTime(500));
    expect(removeLabels().sort()).toEqual(modules.map((m) => t("actions.remove", { name: moduleName(m) })).sort());
  });

  it("ignores a landing that completes after the stack was reset", async () => {
    const { container } = renderWithIntl(<LegoTechStackBuilder modules={ALL_TECH_MODULES.slice(0, 1)} />);
    const studs = () => container.querySelectorAll(".flex-1.flex.items-end").length;
    const initial = studs();
    fireEvent.click(equipButton(ALL_TECH_MODULES[0]));
    fireEvent.click(screen.getAllByRole("button", { name: t("controls.reset") })[0]);
    await nextFrames();
    act(() => elementAnimations[0].finish());
    expect(studs()).toBe(initial);
    expect(equipLabels()).toHaveLength(1);
  });

  it("leaves the highlight centred while the builder has no size yet", async () => {
    const { container } = renderWithIntl(<LegoTechStackBuilder modules={ALL_TECH_MODULES.slice(0, 1)} />);
    fireEvent.pointerMove(container.firstElementChild!, { clientX: 50, clientY: 75 });
    await nextFrames(2);
    const highlight = container.querySelector<HTMLElement>(".z-20.pointer-events-none.opacity-60")!;
    expect(highlight.style.background).toContain("50% 50%");
  });

  it.each(locales)("shows %s module names", (locale) => {
    renderWithIntl(<LegoTechStackBuilder />, { locale });
    const tl = translator(locale, "TechStack");
    for (const m of ALL_TECH_MODULES) {
      expect(screen.getByRole("button", { name: tl("actions.equip", { name: moduleName(m, locale) }) })).toBeTruthy();
    }
  });

  it("property: any set of 1-6 stud blocks stacks without overlaps inside the six-stud base", { timeout: 60000 }, () => {
    fakeTimeouts();
    fc.assert(
      fc.property(
        fc.shuffledSubarray(ALL_TECH_MODULES, { minLength: 1 }),
        fc.array(fc.integer({ min: 1, max: 6 }), { minLength: ALL_TECH_MODULES.length, maxLength: ALL_TECH_MODULES.length }),
        (picked, studs) => {
          const modules = picked.map((m, i) => ({ ...m, studs: studs[i] }));
          const view = renderWithIntl(<LegoTechStackBuilder modules={modules} />);
          fireEvent.click(screen.getByRole("button", { name: t("controls.showAll") }));
          act(() => void vi.advanceTimersByTime(modules.length * 75 + 200));

          expect(removeLabels().sort()).toEqual(modules.map((m) => t("actions.remove", { name: moduleName(m) })).sort());
          const cells = new Set<string>();
          for (const block of view.container.querySelectorAll<HTMLElement>("[style*='bottom'][style*='left']")) {
            const row = parseFloat(block.style.bottom) / 78;
            const col = parseFloat(block.style.left) / 65;
            const width = parseFloat((block.firstElementChild as HTMLElement).style.width) / 65;
            expect(col + width).toBeLessThanOrEqual(6);
            for (let c = col; c < col + width; c++) {
              expect(cells.has(`${row}:${c}`)).toBe(false);
              cells.add(`${row}:${c}`);
            }
          }
          expect(cells.size).toBe(modules.reduce((n, m) => n + m.studs, 0));
          view.unmount();
        },
      ),
      { numRuns: 20 },
    );
  });
});
