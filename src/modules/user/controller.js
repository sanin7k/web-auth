const { registerUser, loginUser } = require("./service");
const User = require("./model");

exports.register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).send({ message: "User created", userId: user._id });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 86400000,
    });
    res.send({ message: "Logged in", userId: user._id });
  } catch (err) {
    res.status(401).send({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).send({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).send({ error: "Server error" });
  }
};
