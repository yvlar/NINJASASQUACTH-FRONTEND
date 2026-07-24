import { useState } from "react";

const BRAND_LOGO_SRC = "/logo_sasquatch_Ninja__7_.png";

interface BrandLogoProps {
  className?: string;
  inverted?: boolean;
}

/**
 * Logo officiel Ninja Sasquatch. Le repli textuel protège la navigation si
 * l'asset n'a pas encore été déployé ou si son chargement échoue.
 */
export default function BrandLogo({
  className = "",
  inverted = false,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        className={`font-brand tracking-[0.02em] ${
          inverted ? "text-cream" : "text-charcoal"
        } ${className}`}
      >
        <span className="text-roux">Ninja </span>Sasquatch
      </span>
    );
  }

  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="Ninja Sasquatch Games"
      className={`block h-auto w-auto object-contain ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
