/**
 * Database types for the Supabase schema in `docs/supabase-queries.md`.
 *
 * Hand-written to mirror the shape `supabase gen types typescript` produces.
 * Once the Supabase CLI is wired up, regenerate this file rather than editing
 * it by hand:
 *
 *    bunx supabase gen types typescript --project-id <ref> > app/types/database.types.ts
 *
 * `@nuxtjs/supabase` picks this path up by default, so `useSupabaseClient()`
 * is typed against it with no extra wiring.
 */

export interface Database {
   public: {
      Tables: {
         communities: {
            Row: {
               id: string;
               name: string;
               address: string;
            };
            Insert: {
               id?: string;
               name: string;
               address: string;
            };
            Update: {
               id?: string;
               name?: string;
               address?: string;
            };
            Relationships: [];
         };
         profiles: {
            Row: {
               id: string;
               community_id: string | null;
               created_at: string;
            };
            Insert: {
               id: string;
               community_id?: string | null;
               created_at?: string;
            };
            Update: {
               id?: string;
               community_id?: string | null;
               created_at?: string;
            };
            Relationships: [
               {
                  foreignKeyName: "profiles_community_id_fkey";
                  columns: ["community_id"];
                  isOneToOne: false;
                  referencedRelation: "communities";
                  referencedColumns: ["id"];
               },
               {
                  foreignKeyName: "profiles_id_fkey";
                  columns: ["id"];
                  isOneToOne: true;
                  referencedRelation: "users";
                  referencedColumns: ["id"];
               },
            ];
         };
      };
      Views: Record<never, never>;
      Functions: Record<never, never>;
      Enums: Record<never, never>;
      CompositeTypes: Record<never, never>;
   };
}

/** A single row of `public.communities`. */
export type Community = Database["public"]["Tables"]["communities"]["Row"];
