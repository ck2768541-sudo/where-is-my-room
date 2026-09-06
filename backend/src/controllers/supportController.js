const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");

const createSupportTicket = async (req, res) => {
  try {
    const { problemType, message } = req.body;

    if (!problemType || !message) {
      return res.status(400).json({
        success: false,
        message: "Problem type and message are required",
      });
    }

    const user = await User.findOne({
      _id: req.user.userId,
      isActive: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    if (!["owner", "seeker"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or seeker can create support requests",
      });
    }

    const ticket = await SupportTicket.create({
      user: user._id,
      role: user.role,
      problemType,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit support request",
    });
  }
};

module.exports = {
  createSupportTicket,
};