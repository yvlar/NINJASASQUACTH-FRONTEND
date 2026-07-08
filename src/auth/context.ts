// Contexte de session Supabase — fichier séparé du provider et du hook
// (même découpage que src/i18n/ : la règle react-refresh/only-export-components
// exige que les fichiers de composants n'exportent que des composants).
import { createContext } from "react";
import type { AuthError, Session } from "@supabase/supabase-js";
import type { ProfileRole } from "../types/database";

export interface AuthContextValue {
  session: Session | null;
  role: ProfileRole | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
