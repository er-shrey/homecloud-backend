const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { exec } = require("child_process");

const supportedImageTypes = [".jpg", ".jpeg", ".png", ".webp"];
const supportedPdfTypes = [".pdf"];

// Function to generate PDF thumbnail using Poppler (pdftoppm)
const generatePdfThumbnail = (filePath, thumbPathWithoutExt) => {
  return new Promise((resolve, reject) => {
    const command = `pdftoppm -jpeg -singlefile "${filePath}" "${thumbPathWithoutExt}"`;

    exec(command, (error, stdout, stderr) => {
      const finalThumbPath = `${thumbPathWithoutExt}.jpg`;
      if (fs.existsSync(finalThumbPath)) {
        resolve(finalThumbPath); // thumbnail generated even if error occurred
      } else {
        console.error("Error generating PDF thumbnail:", stderr || error);
        resolve(null);
      }
    });
  });
};

const generateThumbnail = async (filePath, baseDirectory) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const maxWidth = 200;
    const maxHeight = 200;

    // Get relative path from baseDirectory
    const relativeFilePath = path.relative(baseDirectory, filePath);
    const originalDir = path.dirname(relativeFilePath);
    const thumbnailDir = path.join(originalDir, ".thumbnails");

    // Ensure the .thumbnails directory exists
    const absoluteThumbnailDir = path.join(baseDirectory, thumbnailDir);
    fs.mkdirSync(absoluteThumbnailDir, { recursive: true });

    // Use the original file name as the thumbnail name
    const thumbName = path.basename(filePath);
    const relativeThumbPath = path.join(thumbnailDir, thumbName);
    const absoluteThumbPath = path.join(baseDirectory, relativeThumbPath);

    // Check if it's an image
    if (supportedImageTypes.includes(fileExtension)) {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // If image is smaller than the max width/height, copy it directly
      if (metadata.width <= maxWidth && metadata.height <= maxHeight) {
        fs.copyFileSync(filePath, absoluteThumbPath);
      } else {
        // Resize and save the thumbnail
        await image.resize({ width: maxWidth }).toFile(absoluteThumbPath);
      }
    } else if (supportedPdfTypes.includes(fileExtension)) {
      // Generate PDF thumbnail (using Poppler or any other method)
      const relativePdfThumbPath = path.join(thumbnailDir, `${thumbName}`);
      const absolutePdfThumbPath = path.join(
        baseDirectory,
        relativePdfThumbPath
      );
      await generatePdfThumbnail(filePath, absolutePdfThumbPath);
      return relativePdfThumbPath + ".jpg";
    }
    return relativeThumbPath;
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
