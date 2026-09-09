import type { Community } from "~/types/database.types";

/**
 * The signed-in user's community.
 *
 * Route middleware needs this on every navigation, so the answer is cached in
 * Nuxt state and fetched once per session: loaded on the server during SSR,
 * handed to the client with the payload, and only re-queried when the user
 * actually picks a community.
 */
export function useMyCommunity() {
   // `null` is a real answer ("signed in, hasn't chosen yet"), so a separate
   // flag tracks whether the question has been asked at all.
   const community = useState<Community | null>("my-community", () => null);
   const loaded = useState<boolean>("my-community:loaded", () => false);

   const client = useSupabaseClient();
   const user = useSupabaseUser();

   /**
    * Reads the user's community, hitting the database only on the first call.
    * Pass `force` after an assignment to pick the new value up.
    */
   async function load(force = false): Promise<Community | null> {
      if (loaded.value && !force) return community.value;

      if (!user.value) {
         community.value = null;
         loaded.value = true;
         return null;
      }

      // One round trip: RLS already limits `profiles` to the caller's own row,
      // and the `.eq()` makes that explicit rather than implied.
      const { data, error } = await client
         .from("profiles")
         .select("communities (id, name, address)")
         .eq("id", user.value.sub)
         .maybeSingle();

      if (error) throw error;

      community.value = data?.communities ?? null;
      loaded.value = true;

      return community.value;
   }

   /**
    * Records the user's one-time choice. The database rejects a second attempt
    * with a check violation, which surfaces here as a plain error message.
    */
   async function assign(communityId: string): Promise<void> {
      if (!user.value) throw new Error("You need to be signed in to join a community.");

      const { error } = await client
         .from("profiles")
         .update({ community_id: communityId })
         .eq("id", user.value.sub);

      if (error) {
         // 23514 is the check violation raised by the enforce_community_immutable
         // trigger — the only way to hit it is a second assignment.
         if (error.code === "23514") {
            throw new Error("You have already joined a community, and that cannot be changed.");
         }
         throw new Error(error.message);
      }

      await load(true);
   }

   /** Clears the cache, e.g. on sign-out, so the next user starts fresh. */
   function reset(): void {
      community.value = null;
      loaded.value = false;
   }

   return { community, loaded, load, assign, reset };
}
