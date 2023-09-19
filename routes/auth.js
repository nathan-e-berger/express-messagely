"use strict";

const { authenticateJWT } = require("../middleware/auth");
const { SECRET_KEY } = require("../config.js");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;
  if (!(await User.authenticate(username, password))) {
    throw new UnauthorizedError("Nah ah ah");
  }
  const payload = username;
  const token = jwt.sign(payload, SECRET_KEY);
  return res.send({ token });
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  const { username, password, first_name, last_name, phone } = req.body;
  User.register({ username, password, first_name, last_name, phone });
  const payload = username;
  const token = jwt.sign(payload, SECRET_KEY);
  return res.send({ token });
});


module.exports = router;