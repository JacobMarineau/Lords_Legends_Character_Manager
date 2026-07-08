import { defineConfig } from "vite";

// Vite serves this folder (where index.html lives). In dev it proxies API
// calls to the Saturn server on :5050; production builds emit to ./dist.
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5050",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
