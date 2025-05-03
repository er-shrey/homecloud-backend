const express = require("express");
const { BASE_DIRECTORY, PORT } = require("./config/env");

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: "10gb" }));
app.use(express.urlencoded({ extended: true, limit: "10gb" }));

// Static files
app.use(
  "/api/files",
  express.static(BASE_DIRECTORY, {
    dotfiles: "allow",
  })
);

// Routes
const healthRoute = require("./routes/health");
app.use("/api/health", healthRoute);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

const listRoutes = require("./routes/list");
app.use("/api/list", listRoutes);

const folderRoutes = require("./routes/folder");
app.use("/api/folder", folderRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Welcome to HomeCloud Backend!");
});

// Start Server
const serverPort = PORT || 3000;

app.listen(serverPort, () => {
  console.log(`✅ HomeCloud backend running at http://localhost:${serverPort}`);
});
