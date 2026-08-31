import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { validateStripeConfiguration } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { pool } from "./db";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app = express();
const httpServer = createServer(app);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Behind Render's (or Replit's) reverse proxy: required for secure session
// cookies and correct client IPs in rate limiting.
app.set("trust proxy", 1);

app.use(
  helmet({
    // CSP omitted: the SPA loads Google Fonts, Vimeo embeds, and Stripe
    // redirects; a strict policy needs careful curation. Other helmet
    // defaults (frameguard, nosniff, HSTS, etc.) still apply.
    contentSecurityPolicy: false,
  }),
);
app.use(compression());
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.APP_URL,
      process.env.RENDER_EXTERNAL_URL,
    ].filter(Boolean);
    callback(null, allowedOrigins.includes(origin));
  },
}));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function validateProductionConfiguration() {
  if (process.env.NODE_ENV !== "production") return;
  const appUrl = process.env.APP_URL;
  if (!appUrl || !appUrl.startsWith("https://")) {
    throw new Error("APP_URL must be a canonical HTTPS URL in production");
  }
  for (const name of ["CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"]) {
    if (!process.env[name]) throw new Error(`${name} is required in production`);
  }
  validateStripeConfiguration();
}

app.get("/healthz", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        const errorMsg = 'STRIPE WEBHOOK ERROR: req.body is not a Buffer.';
        console.error(errorMsg);
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Never log response bodies: API responses include PII (user
      // objects, contact submissions, payment details).
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  validateProductionConfiguration();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Unhandled request error:", err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
