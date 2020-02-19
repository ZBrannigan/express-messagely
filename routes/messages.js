const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const Message = require("../models/message");
const User = require("../models/user");
const { ensureLoggedIn } = require("../middleware/auth");
const {TWILIO_TO, TWILIO_FROM, twilioClient}=require("../config");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const message = await Message.get(req.params.id);
      if (message.to_user.username === req.user.username || message.from_user.username === req.user.username) {
        return res.json({message});
      } else {
        throw new ExpressError("Unauthorized", 401);
      }
    } catch (err) {
      return next(err);
    }
  });

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const from_username = req.user.username;
      const {to_username, body} = req.body;

      const message = await Message.create({from_username, to_username, body});

      // const user_to = await User.get(to_username);

      const twilioMessage = await twilioClient.messages.create({
        body:`You just got a message from ${from_username}.`,
        from: TWILIO_FROM,
        to: TWILIO_TO//user_to.phone //(tested, it works, at least when the phone is +###########)
      });

      console.log(twilioMessage.sid);

      return res.json({message});
    } catch (err) {
      return next(err);
    }
  });

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const msg = await Message.get(req.params.id);

      if (msg.to_user.username === req.user.username) {
        if (msg.read_at) {
          throw new ExpressError("Already marked as read", 400);
        }
        const message = await Message.markRead(req.params.id);
        return res.json({message});
      } else {
        throw new ExpressError("Unauthorized", 401);
      }
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;