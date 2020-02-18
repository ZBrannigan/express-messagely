const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get("/", async function (req, res, next) {
  try {
    return res.json({ users: await User.all() })
  } catch (err) {
    return next(err);
  }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      return res.json({ user: await User.get(req.params.username)});
    } catch(err) {
      return next(err);
    }
  }
)


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      return res.json({ messages: await User.messagesTo(req.params.username)});
    } catch (err) {
      return next(err);
    }
  })

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      return res.json({ messages: await User.messagesFrom(req.params.username)});
    } catch (err) {
      return next(err);
    }
  })

module.exports = router;