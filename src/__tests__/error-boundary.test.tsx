// Verrou D18 : toute exception de rendu doit afficher un repli i18n au lieu
// d'un écran blanc. (Limite assumée : le throw à l'import de lib/supabase.ts
// — env manquante — précède le montage React et reste un fail-fast.)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import fr from "../data/translations/fr.json";

function Bombe(): never {
  throw new Error("boum");
}

describe("garde-fou d'erreur (ErrorBoundary)", () => {
  beforeEach(() => {
    // React consigne l'erreur capturée sur console.error — silencé pour
    // garder la sortie de test lisible.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("affiche le repli i18n quand un enfant lève une exception au rendu", () => {
    render(
      <LanguageProvider>
        <ErrorBoundary>
          <Bombe />
        </ErrorBoundary>
      </LanguageProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      fr.errors.boundary.title,
    );
    expect(
      screen.getByRole("button", { name: fr.errors.boundary.reload }),
    ).toBeInTheDocument();
  });

  it("rend les enfants tels quels quand rien ne lève", () => {
    render(
      <LanguageProvider>
        <ErrorBoundary>
          <p>contenu sain</p>
        </ErrorBoundary>
      </LanguageProvider>,
    );
    expect(screen.getByText("contenu sain")).toBeInTheDocument();
  });
});
