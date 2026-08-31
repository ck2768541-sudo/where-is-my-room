const express = require("express");

const {
  uploadPropertyImages,
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

module.exports = router;