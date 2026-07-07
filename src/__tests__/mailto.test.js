// Test verrou : la construction de l'URL mailto: (D10). La navigation étant
// non implémentée sous jsdom, on verrouille la fonction pure buildMailtoUrl
// elle-même : destinataire CONTACT_EMAIL, sujet et corps encodés, valeurs
// trimées, corps au format « Nom <email>\n\nmessage ».
import { describe, it, expect } from "vitest";
import { buildMailtoUrl } from "../utils/mailto";
import { CONTACT_EMAIL } from "../data/site";

describe("buildMailtoUrl", () => {
  it("construit l'URL exacte : destinataire, sujet et corps encodés", () => {
    const url = buildMailtoUrl(
      {
        name: "Jeanne Tremblay",
        email: "jeanne@example.com",
        message: "Bonjour, j'aimerais découvrir vos jeux.",
      },
      "Contact — Ninja Sasquatch Games",
    );

    const subject = encodeURIComponent("Contact — Ninja Sasquatch Games");
    const body = encodeURIComponent(
      "Jeanne Tremblay <jeanne@example.com>\n\nBonjour, j'aimerais découvrir vos jeux.",
    );
    expect(url).toBe(
      `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`,
    );
  });

  it("trime le nom, l'email et le message avant construction", () => {
    const url = buildMailtoUrl(
      {
        name: "  Jeanne Tremblay  ",
        email: " jeanne@example.com ",
        message: "  Bonjour  ",
      },
      "Sujet",
    );

    const body = encodeURIComponent("Jeanne Tremblay <jeanne@example.com>\n\nBonjour");
    expect(url).toBe(`mailto:${CONTACT_EMAIL}?subject=Sujet&body=${body}`);
  });

  it("encode les caractères réservés du sujet et du corps (&, ?, =, accents)", () => {
    const url = buildMailtoUrl(
      { name: "A & B", email: "a@b.co", message: "Prix ? Qté = 2" },
      "Été & jeux",
    );

    // Aucun caractère réservé brut ne doit subsister après « mailto:...? »
    const query = url.split("?")[1];
    expect(query).toBe(
      `subject=${encodeURIComponent("Été & jeux")}&body=${encodeURIComponent(
        "A & B <a@b.co>\n\nPrix ? Qté = 2",
      )}`,
    );
    expect(url.startsWith(`mailto:${CONTACT_EMAIL}?`)).toBe(true);
  });
});
