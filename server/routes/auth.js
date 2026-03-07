  const express = require("express");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const User = require("../models/User");

  const router = express.Router();

  // Register
  router.post("/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
        isAdmin: false
      });

      await newUser.save();
      res.json({ message: "User created successfully" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      "SECRETKEY"
    );

    res.json({ token });
  });

  module.exports = router;