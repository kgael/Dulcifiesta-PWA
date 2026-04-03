import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js", // 👉 esto ya apunta a src/sw.js

      registerType: "autoUpdate",
      devOptions: { enabled: false },

      manifest: {
        name: "Dulcifiesta",
        short_name: "Dulcifiesta",
        theme_color: "#ec4899",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-144.png", sizes: "144x144", type: "image/png" },
          { src: "/pwa-128.png", sizes: "128x128", type: "image/png" },
          { src: "/pwa-96.png", sizes: "96x96", type: "image/png" },
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
