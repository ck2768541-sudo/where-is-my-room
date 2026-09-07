const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not configured"
      );
    }

    const authHeader =
      req.headers.authorization;

    if (
      typeof authHeader !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const parts =
      authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (
      !decoded ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true,
    }).select("_id role isActive");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found or inactive",
      });
    }

    req.user = {
      userId:
        user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    console.error(
      "Auth middleware error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to perform this action",
      });
    }

    return next();
  };
};

module.exports = {
  protect,
  allowRoles,
};