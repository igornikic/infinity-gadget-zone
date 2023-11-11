import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    visualizer({
      template: "treemap", // Use the 'treemap' template
      filename: "bundle-treemap.html",
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Infinity Gadget Zone",
        short_name: "IGZ",
        id: "/",
        start_url: "./",
        scope: ".",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        description:
          "Infinity Gadget Zone is a platform that enables users to sell their products on our website effortlessly. It provides a user-friendly interface for individuals to list their products without any technical knowledge.",
        screenshots: [
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
            label: "IGZ",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "IGZ",
          },
        ],
        icons: [
          {
            src: "/logo.ico",
            sizes: "32x32",
            type: "image/x-icon",
          },
          {
            src: "/maskable_icon_x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "/maskable_icon_x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "/maskable_icon_x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/maskable_icon_x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/maskable_icon_x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // defining cached files formats
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/mocks/setup.js",
    css: true,
    testTimeout: 10000,
  },
});
