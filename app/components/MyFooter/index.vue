<template>
   <footer class="my-footer">
      <logo :height="24" />

      <div class="my-footer__bottom">
         <p>
            © {{ currentYear }} Devanilayam. All features copyleft-reserved.
            All sacred texts remain in the public domain.
         </p>
         <p class="my-footer__credits">
            Built with love for the spiritual community
         </p>
      </div>
   </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style lang="scss">
.my-footer {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: px-to-rem(16);
   flex-shrink: 0;
   align-self: stretch;
   padding: px-to-rem(24) px-to-rem(24) px-to-rem(48);

   border-top: 1px solid var(--color-border);
   background: var(--color-surface);

   &__bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: px-to-rem(8);

      font-size: px-to-rem(14);
      color: var(--color-ink-muted);
      text-align: center;
      max-width: px-to-rem(640);
   }

   &__credits {
      font-size: px-to-rem(13);
   }

   @include mobile {
      padding: px-to-rem(20) px-to-rem(12) px-to-rem(32);

      &__bottom {
         font-size: px-to-rem(13);
      }

      &__credits {
         font-size: px-to-rem(12);
      }
   }
}
</style>
