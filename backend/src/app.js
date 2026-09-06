const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const supportRoutes = require("./routes/supportRoutes");
const adminSupportRoutes = require("./routes/adminSupportRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.ADMIN_FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
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

app.use(helmet());

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use((req, res, next) => {
  if (
    req.body &&
    typeof req.body === "object"
  ) {
    mongoSanitize.sanitize(
      req.body,
      {
        replaceWith: "_",
      }
    );
  }

  next();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StayRent API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/support", supportRoutes);

app.use(
  "/api/admin/support",
  adminSupportRoutes
);

app.use("/api/admin", adminRoutes);

module.exports = app;