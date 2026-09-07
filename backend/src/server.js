require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(
      `Missing required environment variable: ${key}`
    );

    process.exit(1);
  }
}

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `StayRent server running on port ${PORT}`
      );
    });

    process.on(
      "unhandledRejection",
      (reason) => {
        console.error(
          "Unhandled Promise Rejection:",
          reason
        );

        server.close(() => {
          process.exit(1);
        });
      }
    );

    process.on(
      "uncaughtException",
      (error) => {
        console.error(
          "Uncaught Exception:",
          error
        );

        server.close(() => {
          process.exit(1);
        });
      }
    );

    process.on("SIGTERM", () => {
      console.log(
        "SIGTERM received. Shutting down gracefully."
      );

      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(
      "Failed to start StayRent server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();