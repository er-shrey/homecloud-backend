const express = require("express");
const path = require("path");
const { BASE_DIRECTORY, PORT } = require("./config/env");

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/thumbnails",
  express.static(path.join(BASE_DIRECTORY, ".Thumbnails"))
);

// Routes
const healthRoute = require("./routes/health");
app.use("/api/health", healthRoute);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

const listRoutes = require("./routes/list");
app.use("/api/list", listRoutes);

const folderRoutes = require("./routes/folder");
app.use("/api/folder", folderRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Welcome to HomeCloud Backend!");
});

// Start Server
const serverPort = PORT || 3000;

app.listen(serverPort, () => {
  console.log(`✅ HomeCloud backend running at http://localhost:${serverPort}`);
});
