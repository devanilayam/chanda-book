<template>
   <div class="auth-form">
      <div class="auth-form__intro">
         <h1>{{ props.heading }}</h1>
         <p v-if="props.description">{{ props.description }}</p>
      </div>

      <button
         type="button"
         class="auth-form__google"
         :disabled="props.pending"
         @click="emit('google')"
      >
         <svg class="auth-form__google-mark" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
         </svg>
         {{ props.pending ? "Taking you to Google…" : props.googleLabel }}
      </button>

      <p v-if="props.errorMessage" class="auth-form__error" role="alert">
         {{ props.errorMessage }}
      </p>
   </div>
</template>

<script setup lang="ts">
import type { AuthFormProps } from "./types";

const props = withDefaults(defineProps<AuthFormProps>(), {
   description: undefined,
   pending: false,
   errorMessage: null,
   googleLabel: "Continue with Google",
});

const emit = defineEmits<{
   google: [];
}>();
</script>

<style lang="scss">
.auth-form {
   display: flex;
   flex-direction: column;
   gap: px-to-rem(20);
   width: 100%;
   max-width: px-to-rem(400);
   margin-inline: auto;
   padding: px-to-rem(32);

   border: 1px solid var(--color-border);
   border-radius: px-to-rem(12);
   background: var(--color-surface-raised);

   &__intro {
      text-align: center;

      p {
         color: var(--color-ink-muted);
         font-size: px-to-rem(14);
      }
   }

   &__google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: px-to-rem(10);
      padding: px-to-rem(12);
      font-size: px-to-rem(15);
      font-weight: 600;

      color: var(--color-ink);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: px-to-rem(8);
      cursor: pointer;

      &:disabled {
         cursor: not-allowed;
         opacity: 0.6;
      }

      &:not(:disabled):hover {
         border-color: var(--color-ink-muted);
      }

      &:focus-visible {
         outline: 2px solid var(--color-brand);
         outline-offset: 1px;
      }
   }

   &__google-mark {
      width: px-to-rem(18);
      height: px-to-rem(18);
      flex-shrink: 0;
   }

   &__error {
      padding: px-to-rem(10) px-to-rem(12);
      font-size: px-to-rem(14);

      color: var(--color-danger);
      background: var(--color-danger-soft);
      border-radius: px-to-rem(8);
   }

   @include mobile {
      padding: px-to-rem(24) px-to-rem(20);
   }
}
</style>
