<template>
   <main class="page home">
      <logo :height="64" orientation="vertical" />
      <h1>Chandabook</h1>
      <p>A Devanilayam project.</p>
   </main>
</template>

<script setup lang="ts">
useSeoMeta({
   title: "Chandabook",
   description: "Chandabook — a Devanilayam project.",
});
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
}
</style>
