// Test verrou : fr.json et en.json doivent avoir exactement la même
// structure de clés. t() retourne la clé en cas de trou, donc une clé
// manquante passe silencieusement à l'exécution — ce test la rend rouge.
import { describe, it, expect } from "vitest";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

// Aplatit un objet de traductions en liste de chemins "a.b.c" triés.
function keyPaths(obj, prefix = "") {
  return Object.entries(obj)
    .flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return value !== null && typeof value === "object"
        ? keyPaths(value, path)
        : [path];
    })
    .sort();
}

describe("Parité des traductions fr/en", () => {
  it("les deux fichiers exposent exactement les mêmes chemins de clés", () => {
    expect(keyPaths(en)).toEqual(keyPaths(fr));
  });

  it("aucune valeur feuille n'est vide", () => {
    for (const messages of [fr, en]) {
      const check = (obj, prefix) => {
        for (const [key, value] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (value !== null && typeof value === "object") {
            check(value, path);
          } else {
            expect(String(value).trim(), `valeur vide pour ${path}`).not.toBe("");
          }
        }
      };
      check(messages, "");
    }
  });
});
