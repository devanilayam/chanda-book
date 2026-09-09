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
const { message: redirectError } = useAuthRedirectError();

const sessionError = ref<string | null>(null);

const errorMessage = computed(() => redirectError.value ?? sessionError.value);

onMounted(async () => {
   // A refusal arrives in the query string rather than as a failed redirect,
   // so when one is already there, there is no code left to exchange.
   if (redirectError.value) return;

   const { data, error } = await client.auth.getSession();

   if (error || !data.session) {
      sessionError.value = error?.message ?? "We could not complete the sign-in. Please try again.";
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
