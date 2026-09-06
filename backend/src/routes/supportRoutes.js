const express = require("express");

const {
  createSupportTicket,
} = require("../controllers/supportController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("owner", "seeker"),
  createSupportTicket
);

module.exports = router;