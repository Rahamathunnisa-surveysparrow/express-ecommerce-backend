const { Customer } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerCustomer = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Register route hit");

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if customer already exists
    const existing = await Customer.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create customer
    const customer = await Customer.create({ name, email, password: hashedPassword });

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
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerCustomer, loginCustomer };
