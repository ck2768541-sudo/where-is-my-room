const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const supportRoutes = require("./routes/supportRoutes");
const adminSupportRoutes = require("./routes/adminSupportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| TRUST PROXY
|--------------------------------------------------------------------------
| Render / production reverse proxy ke liye.
*/
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.NODE_ENV !== "production"
    ? "http://localhost:5173"
    : null,
  process.env.ADMIN_FRONTEND_URL,
  process.env.WEBSITE_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // React Native / mobile requests me browser Origin nahi hota.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
  },

  methods: [
    "GET",
    "POST",
    "PATCH",
    "PUT",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

/*
|--------------------------------------------------------------------------
| SECURITY HEADERS
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb",
  })
);

/*
|--------------------------------------------------------------------------
| NOSQL INJECTION PROTECTION
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  if (
    req.body &&
    typeof req.body === "object"
  ) {
    mongoSanitize.sanitize(req.body, {
      replaceWith: "_",
    });
  }

  next();
});

/*
|--------------------------------------------------------------------------
| GENERAL API RATE LIMIT
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 200,

  standardHeaders: "draft-7",

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

/*
|--------------------------------------------------------------------------
| AUTH RATE LIMIT
|--------------------------------------------------------------------------
| Login / OTP / password reset brute-force protection.
*/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 20,

  standardHeaders: "draft-7",

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StayRent API is running",
  });
});

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use("/api/properties", propertyRoutes);

app.use("/api/uploads", uploadRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/support", supportRoutes);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/admin/support",
  adminSupportRoutes
);

app.use("/api/admin", adminRoutes);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  } else {
    console.error(
      "Server error:",
      err.message
    );
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  return res.status(
    err.status || err.statusCode || 500
  ).json({
    success: false,
    message:
      err.status || err.statusCode
        ? err.message
        : "Internal server error",
  });
});

module.exports = app;