<template>
   <form class="auth-form" novalidate @submit.prevent="onSubmit">
      <div class="auth-form__intro">
         <h1>{{ props.heading }}</h1>
         <p v-if="props.description">{{ props.description }}</p>
      </div>

      <label class="auth-form__field">
         <span>Email</span>
         <input
            v-model.trim="email"
            type="email"
            name="email"
            autocomplete="email"
            required
            :disabled="props.pending"
            placeholder="you@example.com"
         >
      </label>

      <label class="auth-form__field">
         <span>Password</span>
         <input
            v-model="password"
            type="password"
            name="password"
            :autocomplete="props.passwordAutocomplete"
            required
            :minlength="props.minPasswordLength"
            :disabled="props.pending"
            placeholder="At least 6 characters"
         >
      </label>

      <p v-if="props.errorMessage" class="auth-form__error" role="alert">
         {{ props.errorMessage }}
      </p>

      <button type="submit" class="auth-form__submit" :disabled="props.pending">
         {{ props.pending ? "Working…" : props.submitLabel }}
      </button>

      <p class="auth-form__footer">
         <slot name="footer" />
      </p>
   </form>
</template>

<script setup lang="ts">
import type { AuthFormProps, AuthFormSubmitPayload } from "./types";

const props = withDefaults(defineProps<AuthFormProps>(), {
   description: undefined,
   pending: false,
   errorMessage: null,
   minPasswordLength: 6,
   passwordAutocomplete: "current-password",
});

const emit = defineEmits<{
   submit: [payload: AuthFormSubmitPayload];
}>();

const email = ref("");
const password = ref("");

function onSubmit() {
   if (props.pending) return;
   emit("submit", { email: email.value, password: password.value });
}
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

   &__field {
      display: flex;
      flex-direction: column;
      gap: px-to-rem(6);
      font-size: px-to-rem(14);

      span {
         font-weight: 600;
      }

      input {
         padding: px-to-rem(10) px-to-rem(12);
         font-size: px-to-rem(15);

         color: var(--color-ink);
         background: var(--color-surface);
         border: 1px solid var(--color-border);
         border-radius: px-to-rem(8);

         &:focus-visible {
            outline: 2px solid var(--color-brand);
            outline-offset: 1px;
         }

         &:disabled {
            opacity: 0.6;
         }
      }
   }

   &__error {
      padding: px-to-rem(10) px-to-rem(12);
      font-size: px-to-rem(14);

      color: var(--color-danger);
      background: var(--color-danger-soft);
      border-radius: px-to-rem(8);
   }

   &__submit {
      padding: px-to-rem(12);
      font-size: px-to-rem(15);
      font-weight: 600;

      color: var(--color-on-brand);
      background: var(--color-brand);
      border: none;
      border-radius: px-to-rem(8);
      cursor: pointer;

      &:disabled {
         cursor: not-allowed;
         opacity: 0.6;
      }

      &:not(:disabled):hover {
         background: var(--color-brand-deep);
      }
   }

   &__footer {
      font-size: px-to-rem(14);
      color: var(--color-ink-muted);
      text-align: center;

      a {
         color: var(--color-brand-deep);
         font-weight: 600;
      }
   }

   @include mobile {
      padding: px-to-rem(24) px-to-rem(20);
   }
}
</style>
