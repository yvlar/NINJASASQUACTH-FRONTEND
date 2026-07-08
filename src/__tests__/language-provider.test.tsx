// Test verrou : la bascule FR/EN. Le provider doit traduire via t(),
// retourner la clé brute en cas de trou, et synchroniser
// document.documentElement.lang (contrat avec index.html lang="fr").
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import { useLanguage } from "../i18n/useLanguage";

function Probe() {
  const { lang, t, toggleLang } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="home">{t("nav.home")}</span>
      <span data-testid="missing">{t("clé.inexistante")}</span>
      <button onClick={toggleLang}>basculer</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );

describe("LanguageProvider", () => {
  it("démarre en français et synchronise document.documentElement.lang", () => {
    renderProbe();
    expect(screen.getByTestId("lang")).toHaveTextContent("fr");
    expect(screen.getByTestId("home")).toHaveTextContent("Accueil");
    expect(document.documentElement.lang).toBe("fr");
  });

  it("la bascule passe en anglais (chaînes + attribut lang) puis revient", () => {
    renderProbe();
    const toggle = screen.getByRole("button", { name: "basculer" });

    fireEvent.click(toggle);
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("home")).toHaveTextContent("Home");
    expect(document.documentElement.lang).toBe("en");

    fireEvent.click(toggle);
    expect(screen.getByTestId("home")).toHaveTextContent("Accueil");
    expect(document.documentElement.lang).toBe("fr");
  });

  it("une clé manquante est retournée telle quelle (signal visible dans l'UI)", () => {
    renderProbe();
    expect(screen.getByTestId("missing")).toHaveTextContent("clé.inexistante");
  });
});
