require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhone = process.env.ADMIN_PHONE;

    if (
      !adminEmail ||
      !adminPassword ||
      !adminPhone
    ) {
      console.log(
        "ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_PHONE are required in .env"
      );

      process.exit(1);
    }

    await connectDB();

    const existingAdmin = await User.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (existingAdmin) {
      console.log(
        "A user with this email already exists."
      );

      await mongoose.connection.close();
      process.exit(0);
    }

    const existingPhone = await User.findOne({
      phone: adminPhone,
    });

    if (existingPhone) {
      console.log(
        "A user with this phone number already exists."
      );

      await mongoose.connection.close();
      process.exit(0);
    }

    const admin = await User.create({
      name: "StayRent Admin",

      email: adminEmail
        .toLowerCase()
        .trim(),

      phone: adminPhone.trim(),

      password: adminPassword,

      role: "admin",

      seekerType: null,

      isVerified: true,

      isActive: true,
    });

    console.log(
      `Admin created successfully: ${admin.email}`
    );

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Create admin error:",
      error.message
    );

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

createAdmin();