const express = require("express");

const {
  createProperty,
  getProperties,
  getPropertyById,
  getOwnerProperties,
  updatePropertyAvailability,
  updateProperty,
  deleteProperty,

  // Admin moderation
  getPendingProperties,
  approveProperty,
  rejectProperty,
} = require("../controllers/propertyController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| SEEKER / OWNER PROPERTY LIST
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  allowRoles("seeker", "owner"),
  getProperties
);

/*
|--------------------------------------------------------------------------
| OWNER PROPERTIES
|--------------------------------------------------------------------------
*/

router.get(
  "/owner/my-properties",
  protect,
  allowRoles("owner"),
  getOwnerProperties
);

/*
|--------------------------------------------------------------------------
| ADMIN MODERATION
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/pending",
  protect,
  allowRoles("admin"),
  getPendingProperties
);

router.patch(
  "/admin/:id/approve",
  protect,
  allowRoles("admin"),
  approveProperty
);

router.patch(
  "/admin/:id/reject",
  protect,
  allowRoles("admin"),
  rejectProperty
);

/*
|--------------------------------------------------------------------------
| SINGLE PROPERTY
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  allowRoles("seeker", "owner"),
  getPropertyById
);

/*
|--------------------------------------------------------------------------
| OWNER UPDATE AVAILABILITY
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/availability",
  protect,
  allowRoles("owner"),
  updatePropertyAvailability
);

/*
|--------------------------------------------------------------------------
| OWNER UPDATE PROPERTY
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  protect,
  allowRoles("owner"),
  updateProperty
);

/*
|--------------------------------------------------------------------------
| OWNER DELETE PROPERTY
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  protect,
  allowRoles("owner"),
  deleteProperty
);

/*
|--------------------------------------------------------------------------
| OWNER CREATE PROPERTY
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  allowRoles("owner"),
  createProperty
);

module.exports = router;