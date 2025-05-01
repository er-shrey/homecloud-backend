require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

module.exports = {
  PORT: process.env.PORT || 3000,
  BASE_DIRECTORY: process.env.BASE_DIRECTORY || "/app/data",
};
