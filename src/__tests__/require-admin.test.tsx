// Verrou de la garde d'accès admin (RequireAdmin) : anonyme → login,
// connecté non-admin → accès refusé, admin → contenu. Le rôle vient de la
// table `profiles` (mockée) — la barrière réelle reste la RLS côté Supabase.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import AuthProvider from "../auth/AuthProvider";
import RequireAdmin from "../components/admin/RequireAdmin";
import fr from "../data/translations/fr.json";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

// Cast unique : sous vi.mock, ce module est en réalité le mock complet
// (méthodes __* incluses), pas le client Supabase typé.
const supabase = supabaseClient as unknown as SupabaseMock;

function renderGarde() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <RequireAdmin>
          <p>contenu réservé aux admins</p>
        </RequireAdmin>
      </AuthProvider>
    </LanguageProvider>,
  );
}

beforeEach(() => {
  supabase.__reset();
});

describe("garde RequireAdmin", () => {
  it("présente le login à un visiteur anonyme", async () => {
    renderGarde();

    expect(
      await screen.findByLabelText(fr.admin.login.email),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("contenu réservé aux admins"),
    ).not.toBeInTheDocument();
  });

  it("refuse un compte connecté sans rôle admin", async () => {
    supabase.__setTable("profiles", { data: { role: "client" }, error: null });
    supabase.__emitAuthChange({ user: { id: "client-test" } });
    renderGarde();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      fr.admin.denied,
    );
    expect(
      screen.queryByText("contenu réservé aux admins"),
    ).not.toBeInTheDocument();
  });

  it("rend le contenu pour un admin", async () => {
    supabase.__setTable("profiles", { data: { role: "admin" }, error: null });
    supabase.__emitAuthChange({ user: { id: "admin-test" } });
    renderGarde();

    expect(
      await screen.findByText("contenu réservé aux admins"),
    ).toBeInTheDocument();
  });
});
