const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
  updateProfilePhoto,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTH RATE LIMITERS
|--------------------------------------------------------------------------
*/

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many registration attempts. Please try again later.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again later.",
  },
});

const verifyOTPLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many OTP verification attempts. Please try again later.",
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many password reset attempts. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  registerLimiter,
  registerUser
);

router.post(
  "/login",
  loginLimiter,
  loginUser
);

router.patch(
  "/profile-photo",
  protect,
  allowRoles("owner", "seeker"),
  updateProfilePhoto
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyOTPLimiter,
  verifyResetOTP
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPassword
);

module.exports = router;