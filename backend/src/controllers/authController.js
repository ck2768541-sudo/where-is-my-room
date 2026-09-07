const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../services/emailService");
const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = 5;
const RESET_WINDOW_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      seekerType,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!["seeker", "owner"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    if (
      role === "seeker" &&
      (typeof seekerType !== "string" ||
        !seekerType.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select seeker type",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const normalizedPhone = phone.trim();

    const existingUser = await User.findOne({
      $or: [
        {
          email: normalizedEmail,
        },
        {
          phone: normalizedPhone,
        },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Email or phone number already registered",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role,
      seekerType:
        role === "seeker"
          ? seekerType.trim()
          : null,
    });

    const token = generateToken(
      user._id,
      user.role
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        seekerType: user.seekerType,
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating account",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token = generateToken(
      user._id,
      user.role
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        seekerType: user.seekerType,
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while logging in",
    });
  }
};

const updateProfilePhoto = async (
  req,
  res
) => {
  try {
    const {
      profilePhoto,
    } = req.body;

    if (
      typeof profilePhoto !== "string" ||
      !profilePhoto.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Profile photo URL is required",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.userId,
        role: {
          $in: [
            "owner",
            "seeker",
          ],
        },
        isActive: true,
      },
      {
        profilePhoto:
          profilePhoto.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Profile photo updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        seekerType: user.seekerType,
        profilePhoto:
          user.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(
      "Update profile photo error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile photo",
    });
  }
};

const forgotPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
    } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    /*
    |--------------------------------------------------------------------------
    | USER ENUMERATION PROTECTION
    |--------------------------------------------------------------------------
    | Email registered hai ya nahi, public response same rahega.
    */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an active account exists with this email, an OTP has been sent.",
      });
    }

    const otp = crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();

    const otpHash = hashOTP(otp);

    const expiresAt = new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    const resetRequest =
      await PasswordReset.create({
        email: normalizedEmail,
        otp: otpHash,
        expiresAt,
        verified: false,
        verifiedAt: null,
        failedAttempts: 0,
      });

    try {
      await sendOTPEmail(
        normalizedEmail,
        otp
      );
    } catch (emailError) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message:
        "OTP sent successfully",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send OTP",
    });
  }
};

const verifyResetOTP = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      otp === undefined ||
      otp === null ||
      !String(otp).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const enteredOTP =
      String(otp).trim();

    if (
      !/^\d{6}$/.test(
        enteredOTP
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const resetRequest =
      await PasswordReset.findOne({
        email: normalizedEmail,
        verified: false,
      });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message:
          "No active OTP found. Please request a new OTP.",
      });
    }

    if (
      new Date() >
      resetRequest.expiresAt
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (
      resetRequest.failedAttempts >=
      MAX_OTP_ATTEMPTS
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(429).json({
        success: false,
        message:
          "Too many invalid OTP attempts. Please request a new OTP.",
      });
    }

    const enteredOTPHash =
      hashOTP(enteredOTP);

    let otpMatches = false;

    try {
      const storedBuffer =
        Buffer.from(
          resetRequest.otp,
          "hex"
        );

      const enteredBuffer =
        Buffer.from(
          enteredOTPHash,
          "hex"
        );

      if (
        storedBuffer.length ===
        enteredBuffer.length
      ) {
        otpMatches =
          crypto.timingSafeEqual(
            storedBuffer,
            enteredBuffer
          );
      }
    } catch (error) {
      otpMatches = false;
    }

    if (!otpMatches) {
      resetRequest.failedAttempts += 1;

      if (
        resetRequest.failedAttempts >=
        MAX_OTP_ATTEMPTS
      ) {
        await PasswordReset.deleteOne({
          _id: resetRequest._id,
        });

        return res.status(429).json({
          success: false,
          message:
            "Too many invalid OTP attempts. Please request a new OTP.",
        });
      }

      await resetRequest.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFIED RESET WINDOW
    |--------------------------------------------------------------------------
    | OTP verify hone ke baad user ko password change karne ke liye
    | limited 10-minute window milega.
    */

    resetRequest.verified = true;
    resetRequest.verifiedAt =
      new Date();

    resetRequest.failedAttempts = 0;

    resetRequest.expiresAt =
      new Date(
        Date.now() +
          RESET_WINDOW_MINUTES *
            60 *
            1000
      );

    await resetRequest.save();

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify OTP",
    });
  }
};

const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
      newPassword,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof newPassword !== "string" ||
      !email.trim() ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and new password are required",
      });
    }

    if (
      newPassword.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const resetRequest =
      await PasswordReset.findOne({
        email: normalizedEmail,
        verified: true,
      });

    if (!resetRequest) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify OTP first",
      });
    }

    if (
      !resetRequest.verifiedAt ||
      new Date() >
        resetRequest.expiresAt
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(403).json({
        success: false,
        message:
          "Password reset session has expired. Please request a new OTP.",
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
        isActive: true,
      }).select("+password");

    if (!user) {
      await PasswordReset.deleteMany({
        email: normalizedEmail,
      });

      return res.status(404).json({
        success: false,
        message:
          "Account not found",
      });
    }

    user.password =
      newPassword;

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | ONE-TIME RESET
    |--------------------------------------------------------------------------
    | Password change hone ke baad reset request destroy.
    */

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfilePhoto,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};