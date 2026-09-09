const SITE_NAME = "Chandabook";

const ORG_NAME = "Devanilayam";

const SITE_DESCRIPTION = "Chandabook — a Devanilayam project.";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   compatibilityDate: "2025-07-15",
   modules: ["@nuxt/fonts", "@nuxtjs/supabase"],

   ssr: true,

   devtools: { enabled: true },

   // Self-hosted webfonts, same files and metric-override fallbacks as
   // devanilayam_web: each family names an explicit `src`, so builds need no
   // network and a blip can never ship the site in fallback fonts.
   fonts: {
      families: [
         {
            name: "Merriweather",
            src: "/fonts/merriweather-latin-variable.woff2",
            weight: "300 900",
            fallbacks: ["Georgia", "Times New Roman", "serif"],
         },
         {
            name: "Noto Sans",
            src: "/fonts/noto-sans-latin-variable.woff2",
            weight: "100 900",
            fallbacks: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
         },
      ],
   },

   supabase: {
      // The module's own redirect middleware can't express the community gate
      // ("signed in but hasn't chosen yet"), and it would also lock visitors
      // out of `/`, which is the public landing page. `app/middleware/
      // auth.global.ts` owns every routing decision instead.
      redirect: false,
   },

   app: {
      head: {
         title: SITE_NAME,
         // Every page ends up as "<page> | Devanilayam", so the browser tab
         // carries the org name even when only the page title is set.
         titleTemplate: `%s | ${ORG_NAME}`,
         htmlAttrs: {
            lang: "en",
         },
         meta: [
            { name: "author", content: "Mouli Bheemaneti" },
            { name: "description", content: SITE_DESCRIPTION },
            {
               name: "viewport",
               content: "width=device-width, initial-scale=1.0, minimum-scale=1.0",
            },
            { name: "theme-color", content: "#EB730C" },
            { name: "application-name", content: SITE_NAME },
         ],
         link: [
            { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
            { rel: "icon", href: "/favicon-dark.ico", type: "image/x-icon", media: "(prefers-color-scheme: dark)" },
         ],
      },
   },

   css: ["@/assets/scss/main.scss"],

   components: {
      dirs: [
         {
            path: "~/components",
            pattern: "**/*.vue", // Only consider .vue files as components
         },
      ],
   },

   vite: {
      css: {
         preprocessorOptions: {
            scss: {
               additionalData: `
                @use "sass:map";
                @use "sass:math";
                @use "sass:meta";

                @use "@/assets/scss/abstracts" as *;
             `,
            },
         },
      },
   },
});
