import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: ".svelte-kit/output/static",
      assets: ".svelte-kit/output/static",
      fallback: "index.html",
      precompress: false,
      strict: false,
    }),
    alias: {
      $lib: "./src/lib",
    },
  },
};

export default config;
