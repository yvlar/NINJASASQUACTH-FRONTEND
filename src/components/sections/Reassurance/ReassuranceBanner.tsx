// Bandeau de réassurance : trois promesses courtes, toutes reprises de copy
// déjà validé (gameplay stratégique, fait au Québec, 100 % compostable). On ne
// transforme aucune affirmation non vérifiée en déclaration absolue.
import { Brain, MapPin, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";

const ITEMS: { key: string; Icon: LucideIcon }[] = [
  { key: "strategy", Icon: Brain },
  { key: "quebec", Icon: MapPin },
  { key: "eco", Icon: Leaf },
];

export default function ReassuranceBanner() {
  const { t } = useLanguage();

  return (
    <section aria-label={t("reassurance.title")} className="bg-forest py-8">
      <ul className="mx-auto grid max-w-[1280px] list-none grid-cols-[1fr] gap-6 px-4 sm:grid-cols-[repeat(3,1fr)] sm:px-6 lg:px-8">
        {ITEMS.map(({ key, Icon }) => (
          <li key={key} className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream">
              <Icon size={20} aria-hidden />
            </span>
            <span className="font-brand text-base/[1.5] text-cream">
              {t(`reassurance.items.${key}`)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
