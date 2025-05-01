const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { BASE_DIRECTORY } = require("../config/env");

const BASE_DIR = path.resolve(BASE_DIRECTORY);
const THUMBNAIL_ROUTE_PREFIX = "/thumbnails"; // static mount

// Utility to check if a path is within BASE_DIR
const isPathSafe = (targetPath) => {
  const resolved = path.resolve(BASE_DIR, "." + targetPath);
  return resolved.startsWith(BASE_DIR);
};

// Generate thumbnail URL from path
const getThumbnailUrl = (relativePath, itemName) => {
  const thumbnailPath = path.join(
    BASE_DIR,
    relativePath,
    ".Thumbnails",
    itemName
  );
  const fallback = "/fallbacks/file.png"; // you can change this

  if (fs.existsSync(thumbnailPath)) {
    return `${THUMBNAIL_ROUTE_PREFIX}${path
      .join(relativePath, itemName)
      .replace(/\\/g, "/")}`;
  } else {
    return fallback;
  }
};

// GET /api/list?path=/folderA
router.get("/", async (req, res) => {
  try {
    const relPath = req.query.path || "/";
    if (!isPathSafe(relPath)) {
      return res.status(400).json({ error: "Invalid path." });
    }

    const fullPath = path.join(BASE_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Path not found." });
    }

    const entries = await fs.promises.readdir(fullPath, {
      withFileTypes: true,
    });

    const items = await Promise.all(
      entries.map(async (entry) => {
        const itemPath = path.join(fullPath, entry.name);
        const stat = await fs.promises.stat(itemPath);

        return {
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
          size: entry.isFile() ? stat.size : undefined,
          lastModified: stat.mtime,
          thumbnail: getThumbnailUrl(relPath, entry.name),
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
