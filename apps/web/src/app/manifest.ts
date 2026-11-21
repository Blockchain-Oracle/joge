import type { MetadataRoute } from "next";

/**
 * The installable app: it opens on the rounds, night first, with the vermilion hanko as its icon (Next's
 * manifest file convention; icons drawn by scripts/icons.ts).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jōge 上下",
    short_name: "Jōge",
    description: "Bet up or down, in minutes. Guess the price, split the pot, on Bitcoin Cash.",
    start_url: "/rounds",
    scope: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
