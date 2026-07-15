import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SyncUp",
    short_name: "SyncUp",
    description:
      "No sign-ups. Just create a Sync, share the link, and let everyone vote.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3a32bd",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
