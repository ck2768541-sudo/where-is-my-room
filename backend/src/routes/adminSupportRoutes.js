const express = require("express");

const {
  getAllSupportTickets,
  updateSupportTicketStatus,
} = require("../controllers/adminSupportController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("admin"),
  getAllSupportTickets
);

router.patch(
  "/:ticketId/status",
  protect,
  allowRoles("admin"),
  updateSupportTicketStatus
);

module.exports = router;