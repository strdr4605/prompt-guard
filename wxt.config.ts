import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  outDir: "dist",
  manifest: {
    permissions: ["storage"],
    web_accessible_resources: [
      {
        resources: ["assets/*"],
        matches: ["*://chatgpt.com/*", "*://chat.openai.com/*"],
      },
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
