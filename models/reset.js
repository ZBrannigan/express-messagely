const db = require("../db");
const ExpressError = require("../expressError");
const User = require("../models/user");
const {TWILIO_TO, TWILIO_FROM, twilioClient}=require("../config");

class Reset{
  static async create(username){
    await db.query(`
      INSERT INTO resets (username)
        VALUES ($1)`,
      [username]);
  }

  static async update(username){
    const code = Reset.makeCode();
    const result = await db.query(`
      UPDATE resets
        SET code = $1, created_at=LOCALTIMESTAMP
        WHERE username=$2
        RETURNING code`,
      [code, username]);

    if(!result.rows[0]){
      throw new ExpressError("User not found", 400);
    }
    
    // const user_to = await User.get(username);

    //const twilioMessage = 
    await twilioClient.messages.create({
      body: `Your secret password-reset code: '${result.rows[0].code}'.
      You can post this to auth/reset-password to reset your password.
      Example: {"code":"000000", "username":"my_username", "password":"my_secret_password"}`,
      from: TWILIO_FROM,
      to: TWILIO_TO//user_to.phone //(tested, it works, at least when the phone is +###########)
    });
  }

  checkCode(){}

  static makeCode(){
    return Math.floor(Math.random()*1000000).toString().padStart(6, "0");
  }
}

module.exports = Reset;