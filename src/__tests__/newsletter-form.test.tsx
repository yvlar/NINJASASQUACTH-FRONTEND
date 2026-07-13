// Verrous du formulaire de capture courriel (Sprint 12, Partie H). Le succès
// n'apparaît QU'APRÈS confirmation de l'Edge Function ; jamais d'insertion
// Supabase publique (on n'appelle que functions.invoke).
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NewsletterForm from "../components/sections/Newsletter/NewsletterForm";
import LanguageProvider from "../i18n/LanguageProvider";
import fr from "../data/translations/fr.json";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

import { supabase } from "../lib/supabase";
const mock = supabase as unknown as SupabaseMock;

afterEach(() => mock.__reset());

function renderForm() {
  render(
    <LanguageProvider>
      <NewsletterForm source="notify-launch" />
    </LanguageProvider>,
  );
}

const typeEmail = (value: string) =>
  fireEvent.change(screen.getByLabelText(fr.newsletter.emailLabel), {
    target: { value },
  });
const checkConsent = () =>
  fireEvent.click(screen.getByLabelText(fr.newsletter.consent));
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: fr.newsletter.submit }));

describe("NewsletterForm", () => {
  it("rejette un email invalide sans appeler l'Edge Function", () => {
    renderForm();
    typeEmail("pasemail");
    checkConsent();
    submit();

    expect(screen.getByRole("alert")).toHaveTextContent(fr.newsletter.invalidEmail);
    expect(mock.functions.invoke).not.toHaveBeenCalled();
  });

  it("exige le consentement", () => {
    renderForm();
    typeEmail("fan@exemple.com");
    submit();

    expect(screen.getByRole("alert")).toHaveTextContent(
      fr.newsletter.consentRequired,
    );
    expect(mock.functions.invoke).not.toHaveBeenCalled();
  });

  it("appelle l'Edge Function avec le bon payload et affiche le succès APRÈS confirmation", async () => {
    mock.__setInvokeResult({ data: { ok: true }, error: null });
    renderForm();
    typeEmail("  Fan@Exemple.com  ");
    checkConsent();
    submit();

    expect(mock.functions.invoke).toHaveBeenCalledWith("subscribe-kickstarter", {
      body: {
        email: "Fan@Exemple.com",
        locale: "fr",
        source: "notify-launch",
        consent: true,
        consentVersion: "newsletter-v1-2026-07",
        website: "",
      },
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      fr.newsletter.success,
    );
  });

  it("affiche une erreur si l'Edge Function ne confirme pas (jamais de faux succès)", async () => {
    mock.__setInvokeResult({ data: { ok: false }, error: null });
    renderForm();
    typeEmail("fan@exemple.com");
    checkConsent();
    submit();

    expect(await screen.findByText(fr.newsletter.error)).toBeInTheDocument();
    expect(screen.queryByText(fr.newsletter.success)).not.toBeInTheDocument();
  });
});
