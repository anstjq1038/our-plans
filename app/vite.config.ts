import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/our-plans/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["og.png", "icons/icon-180.png"],
      manifest: {
        name: "우리 계획 — 여행 & 모임",
        short_name: "우리 계획",
        description: "친구들과 함께 짜는 여행·모임 계획",
        lang: "ko",
        start_url: "/our-plans/",
        scope: "/our-plans/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f9f9f7",
        theme_color: "#2a78d6",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // 네트워크 우선: 항상 최신, 오프라인 시 캐시
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: "NetworkFirst",
            options: { cacheName: "app-shell" },
          },
        ],
        navigateFallback: "/our-plans/index.html",
      },
    }),
  ],
});
