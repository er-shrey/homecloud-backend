const express = require("express");
const app = express();
const { PORT } = require("./config/env");

// Routes
const healthRoute = require("./routes/health");
app.use("/api/health", healthRoute);

// Root
app.get("/", (req, res) => {
  res.send("Welcome to HomeCloud Backend!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ HomeCloud backend running at http://localhost:${PORT}`);
});
