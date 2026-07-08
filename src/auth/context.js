// Contexte de session Supabase — fichier séparé du provider et du hook
// (même découpage que src/i18n/ : la règle react-refresh/only-export-components
// exige que les fichiers de composants n'exportent que des composants).
import { createContext } from "react";

export const AuthContext = createContext(null);
