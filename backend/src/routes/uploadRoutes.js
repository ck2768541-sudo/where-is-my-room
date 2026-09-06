const express = require("express");

const {
  uploadPropertyImages,
  uploadProfilePhoto,
} = require("../controllers/uploadController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/property-images",
  protect,
  allowRoles("owner"),
  upload.array("images", 5),
  uploadPropertyImages
);

router.post(
  "/profile-photo",
  protect,
  allowRoles("owner", "seeker"),
  upload.single("image"),
  uploadProfilePhoto
);

module.exports = router;