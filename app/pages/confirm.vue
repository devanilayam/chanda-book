<template>
   <main class="page auth-page confirm">
      <logo :height="56" orientation="vertical" />

      <p v-if="errorMessage" class="confirm__error" role="alert">
         {{ errorMessage }}
         <nuxt-link to="/login">Back to log in</nuxt-link>
      </p>

      <p v-else>Signing you in…</p>
   </main>
</template>

<script setup lang="ts">
/**
 * Landing spot for OAuth redirects.
 *
 * The Supabase browser client exchanges the `?code=` in the URL for a session
 * on its own, so this page only has to wait for that to land and then send the
 * user on: `/` is enough, because the global middleware still decides between
 * the home page and the community picker.
 */

useSeoMeta({
   title: "Signing in",
   robots: "noindex",
});

const client = useSupabaseClient();
const { reset } = useMyCommunity();

const errorMessage = ref<string | null>(null);

onMounted(async () => {
   // Google reports a refusal in the query string rather than by failing the
   // redirect, so read that before asking about the session.
   const { error: oauthError, error_description: description } = useRoute().query;

   if (oauthError) {
      errorMessage.value = typeof description === "string"
         ? description
         : "Google sign-in was cancelled.";
      return;
   }

   const { data, error } = await client.auth.getSession();

   if (error || !data.session) {
      errorMessage.value = error?.message ?? "We could not complete the sign-in. Please try again.";
      return;
   }

   // Whoever was signed in before is gone; drop their cached community so the
   // middleware looks this user's own up.
   reset();

   await navigateTo("/");
});
</script>

<style lang="scss">
.confirm {
   text-align: center;

   &__error {
      display: flex;
      flex-direction: column;
      gap: px-to-rem(8);
      max-width: px-to-rem(400);

      color: var(--color-danger);

      a {
         color: var(--color-brand-deep);
         font-weight: 600;
      }
   }
}
</style>
