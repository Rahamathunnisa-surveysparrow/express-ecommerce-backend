const express = require("express");
const app = express();
require("dotenv").config();
const syncProductsToElasticsearch = require('./elasticsearch/syncProducts');

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

// app.use('/api', require('./routes/searchRoutes'));

const PORT = process.env.PORT || 5000;


app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Sync Elasticsearch index after server starts
  await syncProductsToElasticsearch();
});


// Default error handler (optional)
app.use((req, res) => {
  res.status(404).send('Route not found');
});

/*
TERMINAL COMMANDS

NAV: shaik.rahamathunnisa@SSLAP0339 express-postgres-ecommerce %

  Terminal 1: Redis:
      ./redis-7.2.4/src/redis-server

  Terminal 2: Elastic Search:
      cd ~/elasticsearch-8.13.0
      ./bin/elasticsearch

  Terminal 3: Bull Worker:
      node bull/index.js

  Terminal 4: Main server:
      node server.js

  Terminal 5: psql: (optional)
    psql -U postgres -d ecommerce_db
*/