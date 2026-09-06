<!-- eslint-disable vue/no-multiple-template-root -->
<template>
   <slot />
   <MyFooter />
</template>

<style lang="scss">
#__nuxt {
   min-height: 100%;
   display: flex;
   flex-direction: column;

   main {
      flex: 1;
   }
}
</style>
