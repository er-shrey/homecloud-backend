const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const { BASE_DIRECTORY } = require("../config/env");
const authentication = require("../middlewares/authMiddleware");
const {
  generateThumbnail,
  supportedImageTypes,
  supportedPdfTypes,
} = require("../utils/thumbnail");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = req.body.folderPath || ""; // Expect folderPath in the form-data body
    const fullPath = path.join(BASE_DIRECTORY, folderPath);
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // use original filename
  },
});

const upload = multer({ storage });

// Middleware to parse the form data and file upload
router.post("/", authentication, upload.single("file"), async (req, res) => {
  try {
    // Ensure folderPath is in the request body (form data)
    const folderPath = req.body.folderPath || "";
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: "folderPath is required in form data.",
      });
    }

    const uploadedFilePath = req.file.path;

    // Check and generate thumbnail (async but awaited)
    let thumbnailUrl = null;
    const allSupportedThumbTypes = [
      ...supportedImageTypes,
      ...supportedPdfTypes,
    ];
    if (
      allSupportedThumbTypes.includes(
        path.extname(uploadedFilePath).toLowerCase()
      )
    ) {
      const thumbPath = await generateThumbnail(
        uploadedFilePath,
        BASE_DIRECTORY
      );
      if (thumbPath) {
        const publicUrl = thumbPath
          .replace(BASE_DIRECTORY, "")
          .replace(/\\/g, "/");
        thumbnailUrl = `/${publicUrl}`;
      }
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      file: req.file.filename,
      path: folderPath,
      thumbnail: thumbnailUrl,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;
