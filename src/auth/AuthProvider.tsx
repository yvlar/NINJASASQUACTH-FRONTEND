// Session Supabase + rôle applicatif (table `profiles`).
// Monté uniquement sous /admin (voir AdminPage) : le site vitrine ne paie
// aucun appel d'authentification. La garde par rôle côté front n'est que de
// l'UX — la barrière réelle est la RLS côté Supabase.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./context";
import type { ProfileRole } from "../types/database";

interface RoleInfo {
  userId: string | null;
  role: ProfileRole | null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Le rôle est associé à l'identité stable de l'utilisateur, pas à l'objet
  // Session. Supabase peut recréer cet objet lors d'un retour de focus ou d'un
  // rafraîchissement de jeton sans que l'utilisateur ait changé.
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({
    userId: null,
    role: null,
  });
  const userId = session?.user.id ?? null;
  const role = roleInfo.userId === userId ? roleInfo.role : null;

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session ?? null);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Seul un vrai SIGNED_OUT doit retirer l'administration de l'arbre React.
      // Certains événements de synchronisation peuvent être transitoires ; les
      // traiter comme une déconnexion détruirait le formulaire en cours.
      if (event === "SIGNED_OUT") {
        setRoleInfo({ userId: null, role: null });
        setSession(null);
        return;
      }

      if (nextSession) setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }
    let active = true;

    supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        // profil absent ou illisible → « client » (jamais de promotion par défaut)
        if (active) {
          setRoleInfo({ userId, role: data?.role ?? "client" });
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ session, role, loading, signIn, signOut }),
    [session, role, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
