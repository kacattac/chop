import { defineConfig } from "vite";

// Served from https://<user>.github.io/chop/ via GitHub Pages, so all
// asset URLs need the repo name as a base path instead of the site root.
export default defineConfig({
  base: "/chop/",
});
