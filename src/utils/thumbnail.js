const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { exec } = require("child_process");

const supportedImageTypes = [".jpg", ".jpeg", ".png", ".webp"];
const supportedPdfTypes = [".pdf"];

// Function to generate PDF thumbnail using Poppler (pdftoppm)
const generatePdfThumbnail = async (filePath, thumbPath) => {
  try {
    // Using Poppler's pdftoppm to generate a thumbnail for the first page of the PDF
    const command = `pdftoppm -jpeg -scale-to 200 -f 1 -l 1 ${filePath} ${thumbPath}`;
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err || stderr) {
          reject(`Error generating PDF thumbnail: ${stderr}`);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Error generating PDF thumbnail:", error);
    throw error;
  }
};

const generateThumbnail = async (filePath, baseDirectory) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const maxWidth = 200;
    const maxHeight = 200;

    const originalDir = path.dirname(filePath);
    const thumbnailDir = path.join(originalDir, ".thumbnails");

    // Ensure the .thumbnails directory exists
    fs.mkdirSync(thumbnailDir, { recursive: true });

    // Use the original file name as the thumbnail name
    const thumbName = path.basename(filePath);
    const thumbPath = path.join(thumbnailDir, thumbName);

    // Check if it's an image
    if (supportedImageTypes.includes(fileExtension)) {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // If image is smaller than the max width/height, copy it directly
      if (metadata.width <= maxWidth && metadata.height <= maxHeight) {
        fs.copyFileSync(filePath, thumbPath);
      } else {
        // Resize and save the thumbnail
        await image.resize({ width: maxWidth }).toFile(thumbPath);
      }
    } else if (supportedPdfTypes.includes(fileExtension)) {
      // Generate PDF thumbnail (using Poppler or any other method)
      const pdfThumbPath = path.join(thumbnailDir, `${thumbName}.jpg`);
      await generatePdfThumbnail(filePath, pdfThumbPath);
      return pdfThumbPath;
    }

    return thumbPath;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
};

module.exports = {
  generateThumbnail,
  supportedImageTypes,
  supportedPdfTypes,
};
