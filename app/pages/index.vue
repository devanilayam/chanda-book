<template>
   <main class="page home">
      <logo :height="64" orientation="vertical" />

      <template v-if="user">
         <template v-if="community">
            <p class="home__eyebrow">Your community</p>
            <h1 class="home__community">{{ community.name }}</h1>
         </template>

         <!-- Middleware sends a user with no community to the selection page,
              so reaching here without one means the lookup itself failed. -->
         <template v-else>
            <h1>Welcome back</h1>
            <p>We could not load your community just now. Please refresh the page.</p>
         </template>

         <button type="button" class="home__signout" @click="onSignOut">Sign out</button>
      </template>

      <template v-else>
         <h1>Chandabook</h1>
         <p>A Devanilayam project.</p>

         <div class="home__actions">
            <nuxt-link to="/signup" class="home__action home__action--primary">Sign up</nuxt-link>
            <nuxt-link to="/login" class="home__action">Log in</nuxt-link>
         </div>
      </template>
   </main>
</template>

<script setup lang="ts">
useSeoMeta({
   title: "Chandabook",
   description: "Chandabook — a Devanilayam project.",
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const { community, reset } = useMyCommunity();

async function onSignOut() {
   await client.auth.signOut();
   reset();
   await navigateTo("/login");
}
</script>

<style lang="scss">
.home {
   flex: 1;
   align-items: center;
   justify-content: center;
   text-align: center;
   padding-block: px-to-rem(64);

   p {
      color: var(--color-ink-muted);
   }

   &__eyebrow {
      font-size: px-to-rem(14);
      text-transform: uppercase;
      letter-spacing: px-to-rem(1);
   }

   &__community {
      color: var(--color-brand-deep);
   }

   &__actions {
      display: flex;
      gap: px-to-rem(12);
      flex-wrap: wrap;
      justify-content: center;
   }

   &__action {
      padding: px-to-rem(10) px-to-rem(20);
      font-size: px-to-rem(15);
      font-weight: 600;

      color: var(--color-ink);
      border: 1px solid var(--color-border);
      border-radius: px-to-rem(8);

      &--primary {
         color: var(--color-on-brand);
         background: var(--color-brand);
         border-color: var(--color-brand);
      }
   }

   &__signout {
      padding: px-to-rem(8) px-to-rem(16);
      font-size: px-to-rem(14);

      color: var(--color-ink-muted);
      background: none;
      border: 1px solid var(--color-border);
      border-radius: px-to-rem(8);
      cursor: pointer;

      &:hover {
         color: var(--color-ink);
      }
   }
}
</style>
