// Injection dans le gabarit HTML (Sprint 11, Partie A). Pur et testable :
// remplace le bloc <head> de repli par les balises de la route, fixe la langue
// du <html>, et insère le corps rendu dans #root.
export interface InjectInput {
  headHtml: string;
  bodyHtml: string;
  lang: string;
}

const HEAD_BLOCK = /<!--app-head-start-->[\s\S]*?<!--app-head-end-->/;
const ROOT = '<div id="root"></div>';

export function injectPage(template: string, input: InjectInput): string {
  let html = template;
  if (HEAD_BLOCK.test(html)) {
    html = html.replace(HEAD_BLOCK, input.headHtml);
  }
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${input.lang}">`);
  html = html.replace(ROOT, `<div id="root">${input.bodyHtml}</div>`);
  return html;
}
