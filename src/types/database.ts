// Types de la base Supabase — écrits à la main au format du codegen
// supabase-js (`supabase gen types typescript`), dérivés de la migration
// tracée supabase/migrations/20260708032500_init_games_auth.sql.
// Un futur passage au codegen (MCP `generate_typescript_types`) est un
// remplacement direct de ce fichier.

// Catégories portées par un jeu — miroir byte-for-byte (accents compris)
// de la contrainte CHECK de la table `games` ET des clés i18n
// `games.categories.<id>`.
export type GameCategory = "famille" | "stratégie" | "party";

// « tous » est le pseudo-filtre du catalogue public : jamais stocké en base.
export type CatalogCategoryId = GameCategory | "tous";

export type ProfileRole = "admin" | "client";

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          category: GameCategory;
          title_fr: string;
          title_en: string;
          short_desc_fr: string;
          short_desc_en: string;
          full_desc_fr: string;
          full_desc_en: string;
          image_url: string | null;
          players: string;
          duration: string;
          age: string;
          eco: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: GameCategory;
          title_fr: string;
          title_en: string;
          short_desc_fr: string;
          short_desc_en: string;
          full_desc_fr: string;
          full_desc_en: string;
          image_url?: string | null;
          players: string;
          duration: string;
          age: string;
          eco?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: GameCategory;
          title_fr?: string;
          title_en?: string;
          short_desc_fr?: string;
          short_desc_en?: string;
          full_desc_fr?: string;
          full_desc_en?: string;
          image_url?: string | null;
          players?: string;
          duration?: string;
          age?: string;
          eco?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: ProfileRole;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Raccourcis d'usage courant dans l'application.
export type GameRow = Database["public"]["Tables"]["games"]["Row"];
export type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
export type GameUpdate = Database["public"]["Tables"]["games"]["Update"];
