<template>
   <main class="page select-community">
      <div class="select-community__intro">
         <h1>Choose your community</h1>
         <p>
            <strong>This choice is permanent.</strong>
            Your community cannot be changed once it is set, so please pick carefully.
         </p>
      </div>

      <p v-if="listError" class="select-community__error" role="alert">
         {{ listError }}
      </p>

      <p v-else-if="pendingList" class="select-community__empty">Loading communities…</p>

      <p v-else-if="!communities?.length" class="select-community__empty">
         No communities have been added yet. Please check back later.
      </p>

      <form v-else @submit.prevent="onConfirm">
         <ul class="select-community__list">
            <li v-for="option in communities" :key="option.id">
               <label
                  :class="[
                     'select-community__option',
                     { 'select-community__option--selected': selectedId === option.id },
                  ]"
               >
                  <input
                     v-model="selectedId"
                     type="radio"
                     name="community"
                     :value="option.id"
                     :disabled="saving"
                  >
                  <span class="select-community__option-body">
                     <span class="select-community__option-name">{{ option.name }}</span>
                     <span class="select-community__option-address">{{ option.address }}</span>
                  </span>
               </label>
            </li>
         </ul>

         <p v-if="saveError" class="select-community__error" role="alert">{{ saveError }}</p>

         <button
            type="submit"
            class="select-community__confirm"
            :disabled="!selectedId || saving"
         >
            {{ saving ? "Joining…" : "Join this community" }}
         </button>
      </form>
   </main>
</template>

<script setup lang="ts">
useSeoMeta({
   title: "Choose your community",
   description: "Select the community you belong to.",
});

const client = useSupabaseClient();
const { assign } = useMyCommunity();

const selectedId = ref<string | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);

const {
   data: communities,
   pending: pendingList,
   error: listFetchError,
} = await useAsyncData("communities", async () => {
   const { data, error } = await client
      .from("communities")
      .select("id, name, address")
      .order("name");

   if (error) throw new Error(error.message);

   return data;
});

const listError = computed(() =>
   listFetchError.value ? "We could not load the list of communities. Please refresh the page." : null,
);

async function onConfirm() {
   if (!selectedId.value || saving.value) return;

   saving.value = true;
   saveError.value = null;

   try {
      await assign(selectedId.value);
      await navigateTo("/");
   }
   catch (error) {
      saveError.value = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      saving.value = false;
   }
}
</script>

<style lang="scss">
.select-community {
   &__intro {
      text-align: center;

      p {
         color: var(--color-ink-muted);
         font-size: px-to-rem(15);
         max-width: px-to-rem(520);
         margin-inline: auto;
      }

      strong {
         color: var(--color-ink);
      }
   }

   &__list {
      display: flex;
      flex-direction: column;
      gap: px-to-rem(12);
      list-style: none;
      margin-bottom: px-to-rem(24);
   }

   &__option {
      display: flex;
      align-items: flex-start;
      gap: px-to-rem(12);
      padding: px-to-rem(16);

      border: 1px solid var(--color-border);
      border-radius: px-to-rem(10);
      background: var(--color-surface-raised);
      cursor: pointer;

      &:has(input:focus-visible) {
         outline: 2px solid var(--color-brand);
         outline-offset: 1px;
      }

      &--selected {
         border-color: var(--color-brand);
         background: var(--color-brand-soft);
      }

      input {
         margin-top: px-to-rem(3);
         accent-color: var(--color-brand);
      }
   }

   &__option-body {
      display: flex;
      flex-direction: column;
      gap: px-to-rem(4);
   }

   &__option-name {
      font-weight: 600;
   }

   &__option-address {
      font-size: px-to-rem(14);
      color: var(--color-ink-muted);
   }

   &__empty {
      color: var(--color-ink-muted);
      text-align: center;
   }

   &__error {
      padding: px-to-rem(10) px-to-rem(12);
      margin-bottom: px-to-rem(16);
      font-size: px-to-rem(14);

      color: var(--color-danger);
      background: var(--color-danger-soft);
      border-radius: px-to-rem(8);
   }

   &__confirm {
      width: 100%;
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
         opacity: 0.5;
      }

      &:not(:disabled):hover {
         background: var(--color-brand-deep);
      }
   }
}
</style>
