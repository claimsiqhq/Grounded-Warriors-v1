import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Public client-side routes (mirrors client/src/App.tsx). Unknown paths
// get the SPA shell with a 404 status so crawlers don't index junk URLs.
const CLIENT_ROUTES: RegExp[] = [
  /^\/$/,
  /^\/about$/,
  /^\/experience$/,
  /^\/retreats$/,
  /^\/retreats\/marmora$/,
  /^\/retreats\/equinox-gathering$/,
  /^\/retreats\/winter-descent$/,
  /^\/retreats\/spring-awakening$/,
  /^\/retreats\/first-responders-veterans$/,
  /^\/events\/mens-dinner$/,
  /^\/events\/train-breath-plunge$/,
  /^\/past-retreats$/,
  /^\/faq$/,
  /^\/team$/,
  /^\/contact$/,
  /^\/coaching$/,
  /^\/registration\/success$/,
  /^\/login$/,
  /^\/member$/,
  /^\/member\/discussions$/,
  /^\/member\/discussions\/\d+$/,
  /^\/member\/resources$/,
  /^\/member\/retreats\/\d+$/,
  /^\/admin$/,
];

export function isKnownClientRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return CLIENT_ROUTES.some((re) => re.test(normalized));
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      setHeaders(res, filePath) {
        // Vite content-hashes everything under /assets — cache forever.
        // Other files (index.html, favicon, manifest, etc.) stay fresh.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=300");
        }
      },
    }),
  );

  app.use("*", (req, res) => {
    const status = isKnownClientRoute(req.baseUrl || req.originalUrl.split("?")[0]) ? 200 : 404;
    res
      .status(status)
      .setHeader("Cache-Control", "no-cache")
      .sendFile(path.resolve(distPath, "index.html"));
  });
}
