const { Customer } = require("../models");
const jwt = require("jsonwebtoken");

const registerCustomer = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Register route hit");

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if customer already exists (including soft-deleted)
    const existing = await Customer.findOne({ where: { email }, paranoid: false });
    if (existing) {
      if (existing.deleted_at) {
        return res.status(400).json({ error: "This email was previously used and deleted, try to restore the account if you like!" });
      }
      return res.status(400).json({ error: "Email already registered, try Logging in!" });
    }

    // Create customer (password will be hashed by model hook)
    const customer = await Customer.create({ name, email, password });
    console.log("New customer created:", customer.toJSON());

    res.status(201).json({
      message: "Customer registered successfully",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        created_at: customer.created_at
      }
    });

  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists, try a different email" });
    }
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login route hit");

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const bcrypt = require("bcrypt");
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful!",
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerCustomer, loginCustomer };
