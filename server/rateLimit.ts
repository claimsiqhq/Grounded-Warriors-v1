import rateLimit from "express-rate-limit";

// Login, register, password reset: protects against credential stuffing
// and email-abuse (each forgot-password call can send an email).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

// Public form submissions (contact, newsletter, coaching, checkout):
// prevents spam floods and SendGrid/Flodesk cost abuse.
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." },
});
