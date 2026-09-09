<template>
   <main class="page auth-page">
      <logo :height="56" orientation="vertical" />

      <auth-form
         heading="Welcome to Chandabook"
         description="Sign in with Google to see your community. New accounts are created on the first sign-in."
         :pending="pending"
         :error-message="errorMessage"
         @google="signInWithGoogle"
      />
   </main>
</template>

<script setup lang="ts">
useSeoMeta({
   title: "Sign in",
   description: "Sign in to Chandabook.",
});

const { pending, errorMessage, signInWithGoogle } = useGoogleAuth();
</script>

<style lang="scss">
.auth-page {
   flex: 1;
   align-items: center;
   justify-content: center;
   padding-block: px-to-rem(48);
}
</style>
