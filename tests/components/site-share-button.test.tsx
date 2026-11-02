import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import SiteShareButton from "@/components/footer/SiteShareButton";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { catalogs, renderWithIntl, translator } from "../support/intl";
import { setPrefersDark } from "../support/browser";

/** Stand-in for the share dialog library, recording how the site drives it. */
const share = vi.hoisted(() => {
  class FakeShareDialog {
    static instances: FakeShareDialog[] = [];
    options: Record<string, unknown>;
    updateOptions = vi.fn();
    openModal = vi.fn();
    closeModal = vi.fn();
    destroy = vi.fn();
    constructor(options: Record<string, unknown>) {
      this.options = options;
      FakeShareDialog.instances.push(this);
    }
  }
  return { FakeShareDialog, exportsDefault: true };
});

vi.mock("@aossie-org/social-share-button", () => ({
  get default() {
    return share.exportsDefault ? share.FakeShareDialog : undefined;
  },
}));

const t = translator("en", "Share");
const dialogs = share.FakeShareDialog.instances;

function renderButton(locale: "en" | "hi" = "en") {
  return renderWithIntl(
    <ThemeProvider>
      <SiteShareButton className="share" />
    </ThemeProvider>,
    { locale },
  );
}

beforeEach(() => {
  dialogs.length = 0;
  share.exportsDefault = true;
  delete window.SocialShareButton;
  localStorage.clear();
});

describe("SiteShareButton", () => {
  it("builds a hidden share dialog with the site's networks, theme and translated labels", async () => {
    renderButton();
    const button = screen.getByRole("button", { name: t("trigger") });
    expect(button.getAttribute("title")).toBe(t("trigger"));
    expect(button.className).toBe("share");
    await waitFor(() => expect(dialogs).toHaveLength(1));
    const { options } = dialogs[0];
    expect(options).toMatchObject({
      showButton: false,
      platforms: ["whatsapp", "twitter", "linkedin", "telegram", "email"],
      theme: "light",
      labels: { share: t("share"), close: t("close"), copy: t("copy"), copied: t("copied"), copyFailed: t("copyFailed"), urlLabel: t("urlLabel") },
    });
    expect((options.container as HTMLElement).hidden).toBe(true);
  });

  it("opens the dialog for the current page", async () => {
    document.title = "Zplit test page";
    renderButton();
    await waitFor(() => expect(dialogs).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: t("trigger") }));
    expect(dialogs[0].updateOptions).toHaveBeenCalledWith({ url: window.location.href, title: "Zplit test page" });
    expect(dialogs[0].openModal).toHaveBeenCalledTimes(1);
  });

  it("rebuilds the dialog in dark mode when the site theme changes", async () => {
    renderButton();
    await waitFor(() => expect(dialogs).toHaveLength(1));
    setPrefersDark(true);
    await waitFor(() => expect(dialogs).toHaveLength(2));
    expect(dialogs[0].destroy).toHaveBeenCalled();
    expect(dialogs[1].options.theme).toBe("dark");
  });

  it("uses Hindi labels on Hindi pages", async () => {
    renderButton("hi");
    expect(screen.getByRole("button", { name: catalogs.hi.Share.trigger })).toBeTruthy();
    await waitFor(() => expect(dialogs).toHaveLength(1));
    expect(dialogs[0].options.labels).toMatchObject({ share: catalogs.hi.Share.share, close: catalogs.hi.Share.close });
  });

  it("falls back to the global the library sets when its module has no default export", async () => {
    share.exportsDefault = false;
    window.SocialShareButton = share.FakeShareDialog as never;
    renderButton();
    await waitFor(() => expect(dialogs).toHaveLength(1));
  });

  it("does nothing when the library is unavailable", async () => {
    share.exportsDefault = false;
    renderButton();
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    fireEvent.click(screen.getByRole("button", { name: t("trigger") }));
    expect(dialogs).toHaveLength(0);
  });

  it("waits for the theme before building, and ignores clicks until then", async () => {
    // Outside a ThemeProvider the resolved theme is unknown
    renderWithIntl(<SiteShareButton className="share" />);
    fireEvent.click(screen.getByRole("button", { name: t("trigger") }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(dialogs).toHaveLength(0);
  });

  it("destroys the dialog on unmount, and never builds one that loads after unmounting", async () => {
    const { unmount } = renderButton();
    await waitFor(() => expect(dialogs).toHaveLength(1));
    unmount();
    expect(dialogs[0].destroy).toHaveBeenCalled();

    const second = renderButton();
    second.unmount(); // before the dynamic import resolves
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(dialogs).toHaveLength(1);
  });
});
