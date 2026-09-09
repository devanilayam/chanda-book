/**
 * Starts Google's OAuth flow.
 *
 * The only way into the app. Google draws no line between signing up and
 * logging in, and Supabase creates the user on the first sign-in either way,
 * so `/login` is the single door and this is what opens it.
 */
export function useGoogleAuth() {
   const client = useSupabaseClient();

   const pending = ref(false);
   const errorMessage = ref<string | null>(null);

   async function signInWithGoogle(): Promise<void> {
      pending.value = true;
      errorMessage.value = null;

      const { error } = await client.auth.signInWithOAuth({
         provider: "google",
         options: {
            // Google returns the browser to this app, not to Supabase's own
            // page, so `/confirm` can trade the code for a session and then
            // hand routing back to the middleware.
            redirectTo: `${window.location.origin}/confirm`,
         },
      });

      // Success redirects the whole page away, so anything below only runs
      // when the handoff itself failed.
      if (error) {
         errorMessage.value = error.message;
         pending.value = false;
      }
   }

   return { pending, errorMessage, signInWithGoogle };
}
