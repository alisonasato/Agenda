import type { NextConfig } from "next";

// GitHub Pages build (.github/workflows/pages.yml): a static export under NEXT_PUBLIC_BASE_PATH.
const pages = process.env.GITHUB_PAGES === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: pages ? "export" : "standalone",
  basePath,
  // Each route becomes <route>/index.html, which Pages serves for <route>/.
  trailingSlash: pages,
  images: { unoptimized: pages },
};

export default nextConfig;
