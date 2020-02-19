/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql:///messagely_test"
  : "postgresql:///messagely";

const SECRET_KEY = process.env.SECRET_KEY || "terces";

const BCRYPT_WORK_FACTOR = 12;

const twilioAccountSID = process.env.TWILIO_AC_SID;
const twilioAuthToken = process.env.TWILIO_AUTH;
const TWILIO_FROM = process.env.TWILIO_FROM;
const TWILIO_TO = process.env.TWILIO_TO;
const twilioClient = require("twilio")(twilioAccountSID, twilioAuthToken);


// client.messages.create({body:"testingtesting",from:TWILIO_FROM,to:TWILIO_TO}).then(message=>console.log(message.sid));

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  TWILIO_FROM,
  TWILIO_TO,
  twilioClient
};