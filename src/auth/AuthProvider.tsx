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
  session: Session | null;
  role: ProfileRole | null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Rôle mémorisé AVEC la session qui l'a produit : le rôle exposé est dérivé
  // au rendu (null tant que la session courante n'a pas son rôle), ce qui
  // évite un setState synchrone dans l'effet (règle react-hooks).
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({
    session: null,
    role: null,
  });
  const role = roleInfo.session === session ? roleInfo.role : null;

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return undefined;
    }
    let active = true;

    supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        // profil absent ou illisible → « client » (jamais de promotion par défaut)
        if (active) setRoleInfo({ session, role: data?.role ?? "client" });
      });

    return () => {
      active = false;
    };
  }, [session]);

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
