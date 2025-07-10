const express = require("express");
const app = express();
require("dotenv").config();

// MIDDLEWARE: Required to read JSON body
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce Back-end API! This is just some random text to display :)");
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

app.use('/api', require('./routes/searchRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Default error handler (optional)
app.use((req, res) => {
  res.status(404).send('Route not found');
});

/*
TERMINAL COMMANDS

NAV: shaik.rahamathunnisa@SSLAP0339 express-postgres-ecommerce %

  Terminal: psql:
    psql -U postgres -d ecommerce_db

  Terminal: node:
    node server.js

  Terminal: bull:
    node bull/index.js

  Terminal: Redis:
    ./redis-7.2.4/src/redis-server

*/