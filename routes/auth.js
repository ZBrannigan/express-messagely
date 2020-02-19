const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const User = require("../models/user");
const Reset = require("../models/reset");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
      await User.updateLoginTimestamp(username);
      let _token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ _token });
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    return next(err);
  }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login! (**Done in User.register**)
 */
router.post("/register", async function(req, res, next) {
  try {
    const username = await User.register(req.body);
    let _token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ _token });
  } catch (err) {
    return next(err);
  }
});


/**
 * GET /reset-password
 * 
 * {username} => code to reset password is sent to phone
 * 
 * Does not modify actual password, just asks for a reset method
 */

 router.get("/reset-password", async function(req, res, next) {
  try {
    await Reset.update(req.body.username);
    return res.json({message:"Message sent"});
  } catch(err) {
    next(err);
  }
 });


 module.exports = router;