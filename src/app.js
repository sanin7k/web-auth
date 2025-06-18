const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const userModule = require("./modules/user");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api/user", userModule);

module.exports = app;
