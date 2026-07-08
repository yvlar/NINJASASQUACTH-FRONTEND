// Verrous de la session (AuthProvider) et de l'écran de connexion admin :
// identifiants transmis à signInWithPassword, erreur i18n sur échec,
// contenu protégé rendu après succès. Client Supabase 100 % mocké.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import AuthProvider from "../auth/AuthProvider";
import { useAuth } from "../auth/useAuth";
import LoginForm from "../components/admin/LoginForm";
import fr from "../data/translations/fr.json";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

// Cast unique : sous vi.mock, ce module est en réalité le mock complet
// (méthodes __* incluses), pas le client Supabase typé.
const supabase = supabaseClient as unknown as SupabaseMock;

// Aiguillage minimal : la zone protégée n'apparaît qu'avec une session.
function ZoneProtegee() {
  const { session } = useAuth();
  return session ? (
    <p>zone protégée visible</p>
  ) : (
    <LoginForm />
  );
}

function renderLogin() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <ZoneProtegee />
      </AuthProvider>
    </LanguageProvider>,
  );
}

async function remplirEtSoumettre() {
  fireEvent.change(await screen.findByLabelText(fr.admin.login.email), {
    target: { value: "admin@exemple.test" },
  });
  fireEvent.change(screen.getByLabelText(fr.admin.login.password), {
    target: { value: "mot-de-passe" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: fr.admin.login.submit }),
  );
}

beforeEach(() => {
  supabase.__reset();
});

describe("connexion admin", () => {
  it("transmet les identifiants saisis à signInWithPassword", async () => {
    renderLogin();
    await remplirEtSoumettre();

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "admin@exemple.test",
      password: "mot-de-passe",
    });
  });

  it("affiche l'erreur i18n sur échec, sans dévoiler la zone protégée", async () => {
    supabase.__setSignInError({ message: "Invalid login credentials" });
    renderLogin();
    await remplirEtSoumettre();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      fr.admin.login.error,
    );
    expect(screen.queryByText("zone protégée visible")).not.toBeInTheDocument();
  });

  it("révèle la zone protégée après une connexion réussie", async () => {
    renderLogin();
    await remplirEtSoumettre();

    expect(
      await screen.findByText("zone protégée visible"),
    ).toBeInTheDocument();
  });

  it("referme la session au signOut", async () => {
    renderLogin();
    await remplirEtSoumettre();
    await screen.findByText("zone protégée visible");

    await supabase.auth.signOut();

    expect(
      await screen.findByLabelText(fr.admin.login.email),
    ).toBeInTheDocument();
  });
});
