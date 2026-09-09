/**
 * Reads a failed sign-in out of the current URL.
 *
 * Supabase reports a refusal or a broken handoff by sending the browser back
 * with `?error=…` rather than by failing the redirect, so any page an OAuth
 * round trip can land on has to look for it. `/confirm` is the intended
 * landing spot, but when Supabase cannot trust the `state` it cannot trust the
 * `redirect_to` carried inside it either, and falls back to the project's Site
 * URL — dropping the user on `/`. Both pages ask this the same question.
 */
export function useAuthRedirectError() {
   const route = useRoute();

   const message = computed<string | null>(() => {
      const { error, error_code: code, error_description: description } = route.query;

      if (!error && !code) return null;

      // Vue Router decodes percent-escapes but leaves `+` alone, and Supabase
      // sends these descriptions form-encoded, so spaces arrive as plus signs.
      const readable = typeof description === "string"
         ? description.replace(/\+/g, " ")
         : null;

      return readable || "We could not complete the sign-in. Please try again.";
   });

   return { message };
}
