const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");

const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate(
        "user",
        "name email phone role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error(
      "Get support tickets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch support requests",
    });
  }
};

const updateSupportTicketStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (
      ![
        "open",
        "in-progress",
        "resolved",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support ticket status",
      });
    }

    const ticket =
      await SupportTicket.findByIdAndUpdate(
        req.params.ticketId,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "user",
        "name email phone role"
      );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message:
          "Support request not found",
      });
    }

    const statusLabel =
      status === "in-progress"
        ? "In Progress"
        : status === "resolved"
        ? "Resolved"
        : "Open";

    await Notification.create({
      user: ticket.user._id,
      title: "Support Request Updated",
      message: `Your support request status is now ${statusLabel}.`,
      type: "support",
      relatedId: ticket._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Support request status updated successfully",
      ticket,
    });
  } catch (error) {
    console.error(
      "Update support ticket status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update support request",
    });
  }
};

module.exports = {
  getAllSupportTickets,
  updateSupportTicketStatus,
};