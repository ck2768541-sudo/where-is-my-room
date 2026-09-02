const express = require("express");

const {
  getDashboardStats,
  getUsers,
  getProperties,
  updateUserStatus,
  updatePropertyStatus,
} = require("../controllers/adminController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard-stats",
  protect,
  allowRoles("admin"),
  getDashboardStats
);

router.get(
  "/users",
  protect,
  allowRoles("admin"),
  getUsers
);

router.get(
  "/properties",
  protect,
  allowRoles("admin"),
  getProperties
);

router.patch(
  "/users/:userId/status",
  protect,
  allowRoles("admin"),
  updateUserStatus
);

router.patch(
  "/properties/:propertyId/status",
  protect,
  allowRoles("admin"),
  updatePropertyStatus
);

module.exports = router;