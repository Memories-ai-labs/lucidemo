import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), svgr({ include: "**/*.svg?react" }), tsconfigPaths()],
  build: {
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
