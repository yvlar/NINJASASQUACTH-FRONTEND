// Test verrou : la validation du formulaire de contact. Les erreurs sont
// stockées comme clés i18n et traduites au rendu ; le mailto: lui-même ne
// peut pas être intercepté sous jsdom (navigation non implémentée), on
// verrouille donc le comportement observable : erreurs puis message de succès.
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContactSection from "../components/sections/Contact";
import LanguageProvider from "../i18n/LanguageProvider";

const renderForm = () =>
  render(
    <LanguageProvider>
      <ContactSection />
    </LanguageProvider>,
  );

describe("Formulaire de contact", () => {
  it("soumission vide : les trois erreurs requises s'affichent en FR", () => {
    renderForm();
    fireEvent.click(
      screen.getByRole("button", { name: "Envoyer le message" }),
    );
    expect(screen.getByText("Veuillez entrer votre nom.")).toBeInTheDocument();
    expect(
      screen.getByText("Veuillez entrer votre adresse email."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Veuillez entrer votre message."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("email invalide : l'erreur de format s'affiche", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Email", { selector: "input" }), {
      target: { value: "pas-un-email" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Envoyer le message" }),
    );
    expect(
      screen.getByText("Veuillez entrer une adresse email valide."),
    ).toBeInTheDocument();
  });

  it("formulaire valide : le message de succès s'affiche et les erreurs disparaissent", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Nom"), {
      target: { value: "Jeanne Tremblay" },
    });
    fireEvent.change(screen.getByLabelText("Email", { selector: "input" }), {
      target: { value: "jeanne@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Bonjour, j'aimerais découvrir vos jeux." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Envoyer le message" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Merci ! Votre logiciel de messagerie va s'ouvrir pour envoyer votre message.",
    );
    expect(
      screen.queryByText("Veuillez entrer votre nom."),
    ).not.toBeInTheDocument();
  });
});
