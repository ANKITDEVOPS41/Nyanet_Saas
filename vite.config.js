import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("@react-google-maps") || id.includes("recharts")) return "vendor-analytics-map";
          return undefined;
        },
      },
    },
  },
});
