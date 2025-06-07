import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    // Note: Adding svelte.config.js to files.ignore will prevent SvelteKit from
    // processing it for routes/components/etc., but will NOT stop the dev server
    // from restarting when this file is changed, as it's a configuration file.
    files: {
      ignore: ["iwajoo/src/lib/data/questions.json"],
    },
  },
};

export default config;
