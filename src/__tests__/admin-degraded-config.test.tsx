// Garde de configuration de l'administration (Prompt 5, item 10) : sans
// VITE_SUPABASE_URL/ANON_KEY, /admin ne doit faire AUCUN appel réseau — ni
// Auth (getSession/onAuthStateChange), ni Storage, ni PostgREST — et afficher
// un message clair localisé, jamais un chargement infini ni une erreur DNS.
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import AdminPage from "../components/admin/AdminPage";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";
import { supabase } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: false };
});

const mock = supabase as unknown as SupabaseMock;

afterEach(() => mock.__reset());

describe("/admin sans configuration Supabase", () => {
  it("affiche le message localisé et ne monte pas l'authentification", () => {
    render(
      <LanguageProvider>
        <AdminPage />
      </LanguageProvider>,
    );

    expect(screen.getByText(fr.admin.notConfigured)).toBeInTheDocument();
    // Aucun appel réseau : ni Auth, ni Storage, ni PostgREST.
    expect(mock.auth.getSession).not.toHaveBeenCalled();
    expect(mock.auth.onAuthStateChange).not.toHaveBeenCalled();
    expect(mock.storage.from).not.toHaveBeenCalled();
    expect(mock.from).not.toHaveBeenCalled();
    // Pas de formulaire de connexion (donc pas de chargement infini derrière).
    expect(
      screen.queryByLabelText(fr.admin.login.email),
    ).not.toBeInTheDocument();
  });

  it("localise le message en anglais", () => {
    render(
      <LanguageProvider initialLang="en">
        <AdminPage />
      </LanguageProvider>,
    );
    expect(screen.getByText(en.admin.notConfigured)).toBeInTheDocument();
  });
});
