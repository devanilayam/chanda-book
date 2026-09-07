<template>
   <main class="page auth-page">
      <logo :height="56" orientation="vertical" />

      <auth-form
         heading="Welcome back"
         description="Log in to see your community."
         submit-label="Log in"
         :pending="pending"
         :error-message="errorMessage"
         @submit="onLogIn"
      >
         <template #footer>
            New to Chandabook?
            <nuxt-link to="/signup">Create an account</nuxt-link>
         </template>
      </auth-form>
   </main>
</template>

<script setup lang="ts">
import type { AuthFormSubmitPayload } from "~/components/AuthForm/types";

useSeoMeta({
   title: "Log in",
   description: "Log in to Chandabook.",
});

const client = useSupabaseClient();
const { reset } = useMyCommunity();

const pending = ref(false);
const errorMessage = ref<string | null>(null);

async function onLogIn({ email, password }: AuthFormSubmitPayload) {
   pending.value = true;
   errorMessage.value = null;

   const { error } = await client.auth.signInWithPassword({ email, password });

   if (error) {
      errorMessage.value = error.message;
      pending.value = false;
      return;
   }

   // Drop anything cached for a previously signed-in user before the
   // middleware decides where this one belongs.
   reset();

   await navigateTo("/");
}
</script>
