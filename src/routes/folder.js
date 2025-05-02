const express = require("express");
const fs = require("fs");
const path = require("path");
const { BASE_DIRECTORY } = require("../config/env");
const authentication = require("../middlewares/authMiddleware");

const router = express.Router();

// **Create Folder API**
router.post("/create", authentication, (req, res) => {
  const { folderPath, folderName } = req.body;

  if (!folderPath || !folderName) {
    return res
      .status(400)
      .json({ message: "Folder path and folder name are required." });
  }

  // Normalize folderPath to avoid extra slashes
  const normalizedFolderPath = path.join(
    BASE_DIRECTORY,
    folderPath,
    folderName
  );

  // Check if folder already exists
  if (fs.existsSync(normalizedFolderPath)) {
    return res.status(400).json({ message: "Folder already exists." });
  }

  // Create the folder
  fs.mkdir(normalizedFolderPath, { recursive: true }, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to create folder.", error: err.message });
    }

    // Send back the relative path of the newly created folder, replacing backslashes with forward slashes
    const relativePath = `/${path.relative(
      BASE_DIRECTORY,
      normalizedFolderPath
    )}`.replace(/\\/g, "/");

    // Send the response with the relative path (relative to BASE_DIRECTORY)
    res.status(201).json({
      status: "success",
      message: "Folder created successfully.",
      folderPath: relativePath,
    });
  });
});

// **Rename Folder API**
router.put("/rename", authentication, (req, res) => {
  const { oldFolderPath, newFolderName } = req.body;

  if (!oldFolderPath || !newFolderName) {
    return res
      .status(400)
      .json({ message: "Both old path and new folder name are required." });
  }

  const parentFolderPath = path.dirname(oldFolderPath);
  const newFolderPath = path.join(parentFolderPath, newFolderName);

  // Construct full paths using BASE_DIRECTORY
  const fullOldPath = path.join(BASE_DIRECTORY, oldFolderPath);
  const fullNewPath = path.join(BASE_DIRECTORY, newFolderPath);

  // Check if the old folder exists
  if (!fs.existsSync(fullOldPath)) {
    return res.status(404).json({ message: "Folder not found." });
  }

  // Check if a folder with the new name already exists
  if (fs.existsSync(fullNewPath)) {
    return res.status(400).json({ message: "New folder name already exists." });
  }

  // Rename the folder
  fs.rename(fullOldPath, fullNewPath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to rename folder.", error: err.message });
    }

    // Normalize paths to use '/' as separator
    const oldFolderRelativePath = `/${path.relative(
      BASE_DIRECTORY,
      fullOldPath
    )}`.replace(/\\/g, "/");
    const newFolderRelativePath = `/${path.relative(
      BASE_DIRECTORY,
      fullNewPath
    )}`.replace(/\\/g, "/");

    // Return the relative folder paths without full base directory disclosure
    res.status(200).json({
      status: "success",
      message: "Folder renamed successfully.",
      oldFolderPath: oldFolderRelativePath,
      newFolderPath: newFolderRelativePath,
    });
  });
});

module.exports = router;
