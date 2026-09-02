require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const resetAdminPassword = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
      process.exit(1);
    }

    await connectDB();

    const admin = await User.findOne({
      email: adminEmail.toLowerCase().trim(),
    }).select("+password");

    if (!admin) {
      console.log("Admin account not found.");
      await mongoose.connection.close();
      process.exit(1);
    }

    admin.role = "admin";
    admin.isActive = true;
    admin.isVerified = true;
    admin.password = adminPassword;

    await admin.save();

    console.log("Admin password reset successfully");
    console.log(`Admin email: ${admin.email}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(
      "Reset admin password error:",
      error.message
    );

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

resetAdminPassword();