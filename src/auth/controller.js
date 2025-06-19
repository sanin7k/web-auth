const crypto = require("crypto");
const { registerUser, loginUser } = require("./service");
const User = require("./model");
const { sendEmail } = require("./utils/email");

exports.register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    const emailToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
    const html = `<p>Welcome! Click <a href="${verifyURL}">here</a> to verify your email.</p>`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html,
    });

    res.status(201).send({
      message: "User registered. Please verify your email.",
      userId: user._id,
    });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({ error: "Token invalid or expired." });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).send({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email first" });
    }

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "User not found." });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `<p>Click <a href="${resetURL}">here</a> to reset your password. It expires in 15 minutes.</p>`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: message,
    });

    res.json({ message: "Password reset email sent." });
  } catch (err) {
    res.status(500).send({ error: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .send({ error: "Token is invalid or has expired." });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send({ message: "Password has been reset" });
  } catch (err) {
    res.status(500).send({ error: "Server error" });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).send({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).send({ error: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
};
