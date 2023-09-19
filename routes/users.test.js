"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");

let token;

describe("User Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    let resp = await request(app).post("/auth/login").send({
      username: "test1",
      password: "password"
    });

    token = resp.body._token;
  });

  describe("GET /", function () {
    /** GET / - get list of users.*/
    test("gets a list of all users", async function () {
      let response = await request(app)
        .get("/")
        .send(token);

      expect(response.body).toEqual({
        users: [
          {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1"
          }
        ]
      });
    });
  });
});