const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API!");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const customerRoutes = require("./routes/customerRoutes");
app.use("/api/customers", customerRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Default error handler (optional)
app.use((req, res) => {
  res.status(404).send('Route not found');
});