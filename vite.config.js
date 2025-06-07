import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  server: {
    watch: {
      // Exclude files or directories from Vite's watcher
      ignored: ["iwajoo/src/lib/data/questions.json"],
    },
  },
});
