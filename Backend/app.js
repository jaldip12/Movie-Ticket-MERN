import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";

import { ApiError } from "./src/utils/apierror.js";
import userrouter from "./src/routes/user.routes.js";
import movierouter from "./src/routes/movie.routes.js";
import seatingrouter from "./src/routes/Seating.routes.js";
import showrouter from "./src/routes/show.routes.js";
import cinemarouter from "./src/routes/cinema.routes.js";
import screenrouter from "./src/routes/screen.routes.js";
import bookingrouter from "./src/routes/booking.routes.js";
import uploadrouter from "./src/routes/upload.routes.js";
import adminrouter from "./src/routes/admin.routes.js";
import fnbrouter from "./src/routes/fnb.routes.js";
import couponrouter from "./src/routes/coupon.routes.js";
import reviewrouter from "./src/routes/review.routes.js";
import auditrouter from "./src/routes/audit.routes.js";
import bannerrouter from "./src/routes/banner.routes.js";
import movieNotificationRouter from "./src/routes/movieNotification.routes.js";
import wishlistrouter from "./src/routes/wishlist.routes.js";
import { auditLog } from "./src/middleware/auditLog.middleware.js";

const isDev = process.env.NODE_ENV !== "production";

// Loose limiter on read traffic — a single SPA page load can fire 8+ parallel
// requests, so the cap has to absorb realistic browsing without 429ing the
// home/detail pages. Skip entirely in development.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isDev,
});

// Strict limiter for auth endpoints to slow brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isDev,
});

// Booking POSTs — prevent seat-spam from a single client.
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isDev,
});

const app = express();

// helmet first so security headers ride with every response, including the
// CORS preflight. crossOriginResourcePolicy is loosened to "cross-origin"
// because the SPA on a different origin needs to read JSON responses; CSP
// is left to a reverse-proxy / CDN where per-route policy is easier.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
  })
);
app.use(compression());
app.use(generalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(auditLog);

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

// Tighter limits on authentication + booking writes (no-op in dev).
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/signup", authLimiter);
app.use("/api/v1/users/register", authLimiter);
app.use("/api/v1/bookings", bookingLimiter);

app.use("/api/v1/users", userrouter);
app.use("/api/v1/movies", movierouter);
app.use("/api/v1/seating", seatingrouter);
app.use("/api/v1/shows", showrouter);
app.use("/api/v1/cinemas", cinemarouter);
app.use("/api/v1/screens", screenrouter);
app.use("/api/v1/bookings", bookingrouter);
app.use("/api/v1/uploads", uploadrouter);
app.use("/api/v1/admin", adminrouter);
app.use("/api/v1/fnb", fnbrouter);
app.use("/api/v1/coupons", couponrouter);
app.use("/api/v1/reviews", reviewrouter);
app.use("/api/v1/admin/audit", auditrouter);
app.use("/api/v1/banners", bannerrouter);
app.use("/api/v1/movie-notifications", movieNotificationRouter);
app.use("/api/v1/wishlist", wishlistrouter);

app.use((req, res) => {
  res.status(404).json({ statusCode: 404, success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({
    statusCode: 500,
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

export { app };
