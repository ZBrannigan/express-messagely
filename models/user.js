/** User class for message.ly */

const { BCRYPT_WORK_FACTOR } = require("../config")
const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const Message = require("./message");

/** User of the site. */

class User {

  constructor({username, password, first_name, last_name, phone, join_at, last_login_at}) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    this.join_at = join_at;
    this.last_login_at = last_login_at;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   *    **Update: returns --> username
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try{
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const results = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
          VALUES ($1, $2, $3, $4, $5, LOCALTIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING username;`,
        [username, hashedPassword, first_name, last_name, phone]);
      return results.rows[0].username;
    } catch(err) {
      // SQL's unique key constraint
      if (err.routine === "_bt_check_unique") {
        throw new ExpressError("Username already taken", 403);
      }
      // SQL's "required not null" constraint
      if (err.routine === "ExecConstraints") {
        throw new ExpressError("Please include all required fields: {username, password, first_name, last_name, phone}", 400);
      }
      console.error(err.stack);
      throw new ExpressError("Internal Server Error. Please try again.", 500);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(`
      SELECT password FROM users WHERE username = $1;`,
      [username]);
    const user = results.rows[0];
    if (user) {
      return await bcrypt.compare(password, user.password);
    } else {
      return false;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(`
      UPDATE users SET last_login_at = CURRENT_TIMESTAMP
        WHERE username = $1
        RETURNING last_login_at;`,
      [username]);
    if (!results.rows[0]) {
      throw new ExpressError(`Could not find user ${username}`, 404);
    }
    return results.rows[0].last_login_at;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(`
      SELECT username, first_name, last_name FROM users;`);
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users
        WHERE username = $1;`,
      [username]);
    if (!results.rows[0]) {
      throw new ExpressError(`Could not find user ${username}`, 404);
    }
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}, ...]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(`
      SELECT messages.id, users.username, users.first_name, users.last_name, users.phone, body, sent_at, read_at
        FROM users JOIN messages
        ON messages.to_username = users.username
        WHERE messages.from_username = $1;`,
      [username]);

    return results.rows.map(function (data) {
      const to_user = new User(data); 
      const msgInstance = new Message(data);

      return {  ...msgInstance, to_user };
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(`
      SELECT messages.id, users.username, users.first_name, users.last_name, users.phone, body, sent_at, read_at
        FROM users JOIN messages
        ON messages.from_username = users.username
        WHERE messages.to_username = $1;`,
      [username]);

    return results.rows.map(function (data) {
      // const { username, first_name, last_name, phone } = message;
      // const from_user = { username, first_name, last_name, phone };
      const from_user = new User(data); 
      const msgInstance = new Message(data);

      return { ...msgInstance, from_user };
    });
  }
}

module.exports = User;