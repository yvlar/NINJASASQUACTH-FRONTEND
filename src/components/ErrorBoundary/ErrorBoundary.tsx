// Garde-fou d'erreur global (D18) : sans lui, toute exception de rendu
// produit un écran blanc. Composant de classe — seul mécanisme React
// capable de capturer les erreurs de rendu ; le repli (ErrorFallback) est
// un composant fonction pour lire la langue courante via useLanguage (le
// boundary est monté SOUS LanguageProvider dans main.tsx).
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Diagnostic en console : l'erreur ne doit plus être avalée en silence.
    console.error("Erreur de rendu capturée :", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
