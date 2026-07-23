const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { uploadMealImage } = require("../controllers/mealController");

// Upload Meal Image
router.post(
  "/upload",
  upload.single("image"),
  uploadMealImage
);

module.exports = router;