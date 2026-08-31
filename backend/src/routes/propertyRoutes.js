const express = require("express");

const {
  createProperty,
  getProperties,
  getPropertyById,
  getOwnerProperties,
  updatePropertyAvailability,
    updateProperty,
      deleteProperty,
} = require("../controllers/propertyController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("seeker", "owner"),
  getProperties
);
router.get(
  "/owner/my-properties",
  protect,
  allowRoles("owner"),
  getOwnerProperties
);

router.get(
  "/:id",
  protect,
  allowRoles("seeker", "owner"),
  getPropertyById
);


router.patch(
  "/:id/availability",
  protect,
  allowRoles("owner"),
  updatePropertyAvailability
);

router.patch(
  "/:id",
  protect,
  allowRoles("owner"),
  updateProperty
);
router.delete(
  "/:id",
  protect,
  allowRoles("owner"),
  deleteProperty
);

router.post(
  "/",
  protect,
  allowRoles("owner"),
  createProperty
);

module.exports = router;