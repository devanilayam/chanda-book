<template>
   <main class="page auth-page">
      <logo :height="56" orientation="vertical" />

      <auth-form
         heading="Create your account"
         description="Sign up to join your community on Chandabook."
         submit-label="Sign up"
         password-autocomplete="new-password"
         :pending="pending"
         :error-message="errorMessage"
         @submit="onSignUp"
      >
         <template #footer>
            Already have an account?
            <nuxt-link to="/login">Log in</nuxt-link>
         </template>
      </auth-form>
   </main>
</template>

<script setup lang="ts">
import type { AuthFormSubmitPayload } from "~/components/AuthForm/types";

useSeoMeta({
   title: "Sign up",
   description: "Create your Chandabook account.",
});

const client = useSupabaseClient();

const pending = ref(false);
const errorMessage = ref<string | null>(null);

async function onSignUp({ email, password }: AuthFormSubmitPayload) {
   pending.value = true;
   errorMessage.value = null;

   const { data, error } = await client.auth.signUp({ email, password });

   if (error) {
      errorMessage.value = error.message;
      pending.value = false;
      return;
   }

   // With email confirmation switched off, signUp returns a session and the
   // database trigger has already created the profile. If confirmation is ever
   // turned back on there is no session yet, so say so instead of redirecting
   // into a route the middleware would bounce straight back.
   if (!data.session) {
      pending.value = false;
      errorMessage.value = "Check your inbox to confirm your email, then log in.";
      return;
   }

   await navigateTo("/select-community");
}
</script>

<style lang="scss">
.auth-page {
   flex: 1;
   align-items: center;
   justify-content: center;
   padding-block: px-to-rem(48);
}
</style>
