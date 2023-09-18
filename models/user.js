"use strict";

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const db = require("../db.js");
const { NotFoundError, UnauthorizedError } = require("../expressError.js");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username,
                          password,
                          first_name,
                          ast_name,
                          phone,
                          last_login_at,
                          join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp,)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
    FROM users
    WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError("Username not found");
    }

    return await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1
        RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError("Username not found");
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
      FROM users;`);
    return result.rows;
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
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError("Invalid username!");
    }
    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const userResults = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
      WHERE username = $1`,
      [username]
    );
    const user = userResults.rows[0];

    if (!user) {
      throw new NotFoundError("Invalid username!");
    }

    const messageResults = await db.query(
      `SELECT id, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1`,
      [username]
    );
    const messages = messageResults.rows;


    messages.map(m => m.to_user = user);

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const messageResults = await db.query(
      `SELECT id, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1`,
      [username]
    );
    const messages = messageResults.rows;

    messages.map(m => {
      return m.
    });

    const userResults = await db.query(
      `SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1`,
      [username]
    );
    const user = userResults.rows[0];

    messages.map(m => m.from_user = user);

    return messages;
  }
}


module.exports = User;
