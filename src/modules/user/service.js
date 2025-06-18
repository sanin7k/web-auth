const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./model");

exports.registerUser = async ({ username, email, password }) => {
  const existing_username = await User.findOne({ username });
  if (existing_username) throw new Error("Username already exists");
  const existing_email = await User.findOne({ email });
  if (existing_email) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword });
  return user;
};

exports.loginUser = async ({ username, email, password }) => {
  const query = username ? { username } : { email };
  const user = await User.findOne(query);
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return { token, user };
};
