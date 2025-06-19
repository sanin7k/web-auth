const jwt = require("jsonwebtoken");
const User = require("./model");

exports.registerUser = async ({
  username,
  email,
  password,
  confirmPassword,
}) => {
  if (!username || !email || !password || !confirmPassword)
    throw new Error("All fields are required.");
  if (password != confirmPassword)
    throw new Error("Passwords do not match. Please re-enter them.");

  const [existingUsername, existingEmail] = await Promise.all([
    User.findOne({ username }),
    User.findOne({ email }),
  ]);

  if (existingUsername) {
    throw new Error(
      "The username is already taken. Please choose a different one."
    );
  }
  if (existingEmail) {
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({ username, email, password });
  return user;
};

exports.loginUser = async ({ username, email, password }) => {
  const query = username ? { username } : { email };
  const user = await User.findOne(query);
  if (!user) {
    throw new Error("No account found with the provided credentials.");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error("Incorrect password. Please try again.");
  }

  const token = user.isVerified
    ? jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      })
    : undefined;
  return { token, user };
};
