// Brand assets only. Kept separate from lib/data.ts so the site chrome
// (layout, loaders) doesn't pull the full photo-gallery module graph
// into every page's bundle.
import logo from "@assets/optimized/gw-logo-light-256_1765998189312.webp";
import badge from "@assets/optimized/gw-badge-400_1765998189310.webp";

export const brand = { logo, badge };
