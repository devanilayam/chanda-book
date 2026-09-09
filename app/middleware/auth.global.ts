/**
 * Routing rules for the three app features, in one place.
 *
 * Think of it as the door policy: signed-out visitors may only stand in the
 * lobby, everyone signed in must pick a building before going anywhere else,
 * and once they have picked, the selection desk is closed to them for good.
 *
 * `@nuxtjs/supabase` has its own redirect middleware, but it can't express the
 * community gate, so it is switched off in `nuxt.config.ts` and this owns the
 * whole decision.
 */

/**
 * Reachable without signing in. `/` doubles as the signed-out landing page,
 * and `/confirm` has to be open because an OAuth redirect lands there before
 * the session exists — or, when the user backs out at Google, instead of one.
 */
const PUBLIC_ROUTES = ["/", "/login", "/confirm"];

/** Pointless to visit once you have a session. */
const GUEST_ONLY_ROUTES = ["/login"];

const SELECT_COMMUNITY = "/select-community";

export default defineNuxtRouteMiddleware(async (to) => {
   const user = useSupabaseUser();

   if (!user.value) {
      return PUBLIC_ROUTES.includes(to.path) ? undefined : navigateTo("/login");
   }

   if (GUEST_ONLY_ROUTES.includes(to.path)) return navigateTo("/");

   const { load } = useMyCommunity();

   let community;
   try {
      community = await load();
   }
   catch {
      // A failed lookup must not strand the user on a blank page: let the
      // route render and surface the error where it can be retried.
      return undefined;
   }

   if (!community && to.path !== SELECT_COMMUNITY) return navigateTo(SELECT_COMMUNITY);
   if (community && to.path === SELECT_COMMUNITY) return navigateTo("/");

   return undefined;
});
