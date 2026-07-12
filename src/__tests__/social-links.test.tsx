// Verrous des liens sociaux réels (D12 résolue) : URLs exactes fournies par
// l'utilisateur, nouvel onglet + rel="noreferrer", étiquettes accessibles,
// icônes décoratives masquées, et surtout AUCUN href="#".
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import SocialLinks from "../components/layout/SocialLinks";
import { SOCIAL_LINKS } from "../data/socialLinks";

function renderLinks() {
  return render(
    <LanguageProvider>
      <SocialLinks linkClassName="text-charcoal" />
    </LanguageProvider>,
  );
}

describe("SocialLinks", () => {
  it("expose les trois réseaux réels avec leurs URLs exactes", () => {
    renderLinks();
    const byHref = (href: string) =>
      screen.getByRole("link", {
        name: (_n, el) => el.getAttribute("href") === href,
      });

    expect(byHref("https://www.facebook.com/NinjaSasquatch/")).toBeTruthy();
    expect(byHref("https://www.youtube.com/@JimmyGaulin")).toBeTruthy();
    expect(
      byHref("https://www.linkedin.com/company/107198647/"),
    ).toBeTruthy();
  });

  it("ouvre dans un nouvel onglet avec rel=noreferrer et une étiquette accessible", () => {
    renderLinks();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(SOCIAL_LINKS.length);
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noreferrer");
      expect(link.getAttribute("aria-label")?.length).toBeGreaterThan(0);
    }
  });

  it("ne contient jamais de lien fictif href=\"#\"", () => {
    renderLinks();
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toBe("#");
      expect(link.getAttribute("href")).toMatch(/^https:\/\//);
    }
  });

  it("masque les icônes décoratives aux lecteurs d'écran", () => {
    const { container } = renderLinks();
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(SOCIAL_LINKS.length);
    for (const icon of icons) {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
