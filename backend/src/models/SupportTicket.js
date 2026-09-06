const mongoose = require("mongoose");

const supportTicketSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      role: {
        type: String,
        enum: ["owner", "seeker"],
        required: true,
      },

      problemType: {
        type: String,
        enum: [
          "account",
          "property",
          "payment",
          "technical",
          "other",
        ],
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },

      status: {
        type: String,
        enum: [
          "open",
          "in-progress",
          "resolved",
        ],
        default: "open",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);