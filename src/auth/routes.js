const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  profile,
  getAllUsers,
  verifyEmail,
} = require("./controller");
const auth = require("./middleware/auth");
const isAdmin = require("./middleware/isAdmin");

const router = express.Router();

router.get("/all-users", auth, isAdmin, getAllUsers);

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", auth, profile);

module.exports = router;
