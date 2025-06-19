const express = require("express");
const routes = require("./routes");

module.exports = function initAuthModule({ jwtSecret }) {
  if (jwtSecret) {
    process.env.JWT_SECRET = jwtSecret;
  }
  if (!process.env.JWT_SECRET) throw new Error("jwtSecret is required");

  const router = express.Router();
  router.use("/auth", routes);

  return router;
};

module.exports.middleware = {
  auth: require("./middleware/auth"),
  isAdmin: require("./middleware/isAdmin"),
};
