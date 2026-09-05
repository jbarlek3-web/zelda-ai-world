import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../../..");
const viteConfig = readFileSync(resolve(projectRoot, "vite.config.ts"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");

describe("Aurastria PWA contract", () => {
  it("declares standalone portrait install metadata and an app-shell fallback", () => {
    expect(viteConfig).toContain('name: "Aurastria: Spirits of the First Dawn"');
    expect(viteConfig).toContain('display: "standalone"');
    expect(viteConfig).toContain('orientation: "portrait-primary"');
    expect(viteConfig).toContain('start_url: "/"');
    expect(viteConfig).toContain('navigateFallback: "/index.html"');
    expect(viteConfig).toContain('globPatterns: ["**/*.{js,css,html,svg,woff2,png,webp}"]');
  });

  it("keeps the mobile viewport and theme contract in the HTML shell", () => {
    expect(indexHtml).toContain("<title>Aurastria: Spirits of the First Dawn</title>");
    expect(indexHtml).toContain("viewport-fit=cover");
    expect(indexHtml).toContain('name="theme-color" content="#08251e"');
    expect(indexHtml).toContain('rel="icon" href="/pwa-icon.svg"');
  });

  it("supports native install prompts and non-native fallback guidance", () => {
    expect(homeSource).toContain("beforeinstallprompt");
    expect(homeSource).toContain("Add to Home Screen");
    expect(homeSource).toContain("Install App");
  });

  it("produces the generated offline shell after a production build", () => {
    expect(existsSync(resolve(projectRoot, "dist/public/manifest.webmanifest"))).toBe(true);
    expect(existsSync(resolve(projectRoot, "dist/public/sw.js"))).toBe(true);
    const manifest = JSON.parse(readFileSync(resolve(projectRoot, "dist/public/manifest.webmanifest"), "utf8")) as {
      display?: string;
      start_url?: string;
      name?: string;
    };
    expect(manifest.name).toBe("Aurastria: Spirits of the First Dawn");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(readFileSync(resolve(projectRoot, "dist/public/sw.js"), "utf8")).toContain("workbox");
  });
});
