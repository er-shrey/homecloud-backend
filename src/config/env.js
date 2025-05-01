require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  BASE_DIRECTORY: process.env.BASE_DIRECTORY || "/app/data",
};
