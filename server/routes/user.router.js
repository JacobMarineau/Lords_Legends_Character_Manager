const express = require("express");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const encryptLib = require("../modules/encryption");
const pool = require("../modules/pool");
const userStrategy = require("../strategies/user.strategy");
const retry = require("async-retry");

const router = express.Router();

router.get("/", rejectUnauthenticated, (req, res) => {
  res.send(req.user);
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const queryText = `
      SELECT id, username, email, is_admin, created_at
      FROM users
      WHERE id = $1;
    `;
    const result = await pool.query(queryText, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
});

router.post("/register", (req, res) => {
  console.log("Full request body:", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const encryptedPassword = encryptLib.encryptPassword(password);
  const queryText = `INSERT INTO "users" (username, password) VALUES ($1, $2) RETURNING id`;
  retry(
    async () => await pool.query(queryText, [username, encryptedPassword]),
    { retries: 3, minTimeout: 1000 }
  )
    .then(() => res.sendStatus(201))
    .catch((err) => {
      console.error("Registration error:", err);
      if (err.code === "23505") {
        res.status(400).json({ message: "Username already exists" });
      } else {
        res.status(500).send("Internal Server Error");
      }
    });
});

router.post("/login", userStrategy.authenticate("local"), (req, res) => {
  res.sendStatus(200);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.sendStatus(200);
  });
});

module.exports = router;
