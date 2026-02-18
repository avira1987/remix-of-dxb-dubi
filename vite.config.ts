import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure assets are properly handled
    assetsDir: 'assets',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure proper sourcemaps in production for debugging
    sourcemap: false,
    rollupOptions: {
      output: {
        // Ensure consistent chunk naming
        manualChunks: undefined,
      },
    },
  },
  // برای استقرار در root دامنه (مثلاً https://example.com/) از '/' استفاده کنید.
  // اگر سایت را در زیرپوشه قرار می‌دهید (مثلاً https://example.com/shop/) همان مسیر را بگذارید.
  base: '/',
}));
