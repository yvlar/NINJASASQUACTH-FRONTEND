// Types de la base Supabase — écrits à la main au format du codegen
// supabase-js (`supabase gen types typescript`), dérivés des migrations
// tracées sous supabase/migrations/. Un passage au codegen (MCP
// `generate_typescript_types`) reste un remplacement direct de ce fichier ;
// on conserve toutefois ici les UNIONS des colonnes sous contrainte CHECK
// (category, theme_key, campaign_status) que le codegen ne sait pas déduire
// (une CHECK n'est pas un enum Postgres) — elles miroir byte-for-byte la
// migration et sont verrouillées par les tests de contrat.

// Catégories portées par un jeu — miroir byte-for-byte (accents compris)
// de la contrainte CHECK de la table `games` ET des clés i18n
// `games.categories.<id>`.
export type GameCategory = "famille" | "stratégie" | "party";

// « tous » est le pseudo-filtre du catalogue public : jamais stocké en base.
export type CatalogCategoryId = GameCategory | "tous";

// Clé de thème CONTRÔLÉE (jamais une classe Tailwind ni un hex) — miroir de
// la contrainte CHECK games_theme_key_valid.
export type GameThemeKey =
  | "brand"
  | "heroes-rising"
  | "burgle-jack"
  | "flickle-mania";

// Statut de campagne Kickstarter — miroir de la contrainte CHECK
// games_campaign_status_valid.
export type CampaignStatus = "none" | "coming-soon" | "live" | "completed";

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
          tagline_fr: string | null;
          tagline_en: string | null;
          short_desc_fr: string;
          short_desc_en: string;
          full_desc_fr: string;
          full_desc_en: string;
          how_to_play_fr: string | null;
          how_to_play_en: string | null;
          rules_summary_fr: string | null;
          rules_summary_en: string | null;
          image_url: string | null;
          players: string;
          duration: string;
          age: string;
          players_min: number | null;
          players_max: number | null;
          duration_min: number | null;
          duration_max: number | null;
          minimum_age: number | null;
          complexity: string | null;
          mechanics: string[] | null;
          game_languages: string[] | null;
          theme_key: GameThemeKey | null;
          campaign_status: CampaignStatus;
          kickstarter_url: string | null;
          rules_pdf_fr: string | null;
          rules_pdf_en: string | null;
          featured_order: number | null;
          coming_soon: boolean;
          slug: string | null;
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
          tagline_fr?: string | null;
          tagline_en?: string | null;
          short_desc_fr: string;
          short_desc_en: string;
          full_desc_fr: string;
          full_desc_en: string;
          how_to_play_fr?: string | null;
          how_to_play_en?: string | null;
          rules_summary_fr?: string | null;
          rules_summary_en?: string | null;
          image_url?: string | null;
          players: string;
          duration: string;
          age: string;
          players_min?: number | null;
          players_max?: number | null;
          duration_min?: number | null;
          duration_max?: number | null;
          minimum_age?: number | null;
          complexity?: string | null;
          mechanics?: string[] | null;
          game_languages?: string[] | null;
          theme_key?: GameThemeKey | null;
          campaign_status?: CampaignStatus;
          kickstarter_url?: string | null;
          rules_pdf_fr?: string | null;
          rules_pdf_en?: string | null;
          featured_order?: number | null;
          coming_soon?: boolean;
          slug?: string | null;
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
          tagline_fr?: string | null;
          tagline_en?: string | null;
          short_desc_fr?: string;
          short_desc_en?: string;
          full_desc_fr?: string;
          full_desc_en?: string;
          how_to_play_fr?: string | null;
          how_to_play_en?: string | null;
          rules_summary_fr?: string | null;
          rules_summary_en?: string | null;
          image_url?: string | null;
          players?: string;
          duration?: string;
          age?: string;
          players_min?: number | null;
          players_max?: number | null;
          duration_min?: number | null;
          duration_max?: number | null;
          minimum_age?: number | null;
          complexity?: string | null;
          mechanics?: string[] | null;
          game_languages?: string[] | null;
          theme_key?: GameThemeKey | null;
          campaign_status?: CampaignStatus;
          kickstarter_url?: string | null;
          rules_pdf_fr?: string | null;
          rules_pdf_en?: string | null;
          featured_order?: number | null;
          coming_soon?: boolean;
          slug?: string | null;
          eco?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_media: {
        Row: {
          id: string;
          game_id: string;
          storage_path: string;
          media_type: string;
          alt_fr: string | null;
          alt_en: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          storage_path: string;
          media_type?: string;
          alt_fr?: string | null;
          alt_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          storage_path?: string;
          media_type?: string;
          alt_fr?: string | null;
          alt_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_media_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
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
export type GameMediaRow = Database["public"]["Tables"]["game_media"]["Row"];
export type GameMediaInsert =
  Database["public"]["Tables"]["game_media"]["Insert"];
export type GameMediaUpdate =
  Database["public"]["Tables"]["game_media"]["Update"];
