const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("owner", "seeker"),
  getMyNotifications
);

router.patch(
  "/read-all",
  protect,
  allowRoles("owner", "seeker"),
  markAllNotificationsAsRead
);

router.patch(
  "/:notificationId/read",
  protect,
  allowRoles("owner", "seeker"),
  markNotificationAsRead
);

module.exports = router;