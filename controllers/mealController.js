const { bucket } = require("../config/firebase");
const { analyzeMealImage } = require("../services/groqVisionService");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const uploadMealImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed.",
      });
    }

    const file = req.file;

    // Generate unique filename
    const extension = path.extname(file.originalname);
    const fileName = `meal-images/${uuidv4()}${extension}`;

    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error("Storage Upload Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to upload image.",
      });
    });

    blobStream.on("finish", async () => {
      try {

        // Make image public
        await blob.makePublic();

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        console.log("Image Uploaded:", imageUrl);

        // Analyze image using Groq Vision
        const visionResult = await analyzeMealImage(imageUrl);

        return res.status(200).json({
          success: true,
          message: "Meal analyzed successfully.",
          imageUrl,
          fileName,
          foods: visionResult.foods,
        });

      } catch (err) {

        console.error("========== GROQ ERROR ==========");
console.error(err);
console.error("===============================");

return res.status(500).json({
  success: false,
  message: err.message,
});

        return res.status(500).json({
          success: false,
          message: "Image uploaded but AI analysis failed.",
        });
      }
    });

    blobStream.end(file.buffer);

  } catch (err) {

    console.error("Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  uploadMealImage,
};