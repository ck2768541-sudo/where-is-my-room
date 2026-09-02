require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const verifyAdminLogin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.log(
        "ADMIN_EMAIL or ADMIN_PASSWORD missing in .env"
      );

      process.exit(1);
    }

    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      console.log("RESULT: Admin email not found in MongoDB");

      await mongoose.connection.close();
      process.exit(0);
    }

    console.log("User found:", user.email);
    console.log("Role:", user.role);
    console.log("Active:", user.isActive);

    const passwordMatches =
      await user.comparePassword(password);

    console.log(
      "Password matches:",
      passwordMatches
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(
      "Verify admin error:",
      error.message
    );

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

verifyAdminLogin();