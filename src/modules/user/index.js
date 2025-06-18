const express = require("express");
const {
  register,
  login,
  logout,
  profile,
  getAllUsers,
} = require("./controller");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");

const router = express.Router();

router.get("/all-users", auth, isAdmin, getAllUsers);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", auth, profile);

module.exports = router;
