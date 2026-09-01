const express = require("express");

const {
  toggleFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("seeker"),
  getFavorites
);

router.patch(
  "/:propertyId",
  protect,
  allowRoles("seeker"),
  toggleFavorite
);

module.exports = router;