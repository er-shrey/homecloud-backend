const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { BASE_DIRECTORY } = require("../config/env");
const authentication = require("../middlewaares/authMiddleware");
const {
  generateThumbnail,
  supportedImageTypes,
  supportedPdfTypes,
} = require("../utils/thumbnail");

const BASE_DIR = path.resolve(BASE_DIRECTORY);

const allSupportedThumbTypes = [...supportedImageTypes, ...supportedPdfTypes];
const FALLBACK_ROUTE_PREFIX = "/fallbacks/thumbnail";

const fallbackThumbnails = {
  ".zip": "zip_thumbnail.png",
  ".exe": "exe_thumbnail.png",
  folder: "folder_thumbnail.png",
  default: "unknown_file_thumbnail.png",
};

// Utility to check if a path is within BASE_DIR
const isPathSafe = (targetPath) => {
  const resolved = path.resolve(BASE_DIR, "." + targetPath);
  return resolved.startsWith(BASE_DIR);
};

// Generate thumbnail URL from path
const getThumbnailUrl = (relativePath, itemName, isDirectory) => {
  const baseName = path.parse(itemName).name;
  const ext = path.extname(itemName).toLowerCase();
  const thumbnailDir = path.join(BASE_DIR, relativePath, ".thumbnails");

  // Check for supported thumbnails
  let expectedThumbPath;
  if (allSupportedThumbTypes.includes(ext)) {
    if (ext === ".pdf") {
      expectedThumbPath = `${baseName}${ext}.jpg`;
    } else {
      expectedThumbPath = `${baseName}.jpg`;
    }
    const thumbnailPath = path.join(thumbnailDir, expectedThumbPath);
    if (fs.existsSync(thumbnailPath)) {
      const thumbnailRelativePath = path
        .join(relativePath, ".thumbnails", expectedThumbPath)
        .replace(/\\/g, "/");
      return `${thumbnailRelativePath}`;
    }
  }

  // Fallbacks for known types
  if (isDirectory) {
    return `${FALLBACK_ROUTE_PREFIX}/${fallbackThumbnails.folder}`;
  } else if (ext in fallbackThumbnails) {
    return `${FALLBACK_ROUTE_PREFIX}/${fallbackThumbnails[ext]}`;
  } else {
    return `${FALLBACK_ROUTE_PREFIX}/${fallbackThumbnails.default}`;
  }
};

// GET /api/list?path=/folderA
router.get("/", authentication, async (req, res) => {
  try {
    const relPath = req.query.path || "/";
    if (!isPathSafe(relPath)) {
      return res.status(400).json({ error: "Invalid path." });
    }

    const fullPath = path.join(BASE_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Path not found." });
    }

    const entries = (
      await fs.promises.readdir(fullPath, { withFileTypes: true })
    ).filter((entry) => entry.name !== ".thumbnails");

    const items = await Promise.all(
      entries.map(async (entry) => {
        const itemPath = path.join(fullPath, entry.name);
        const stat = await fs.promises.stat(itemPath);
        const isDirectory = stat.isDirectory();

        return {
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
          size: entry.isFile() ? stat.size : undefined,
          lastModified: stat.mtime,
          thumbnail: getThumbnailUrl(relPath, entry.name, isDirectory),
        };
      })
    );

    res.json({
      path: relPath,
      items,
    });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to list directory." });
  }
});

module.exports = router;
