# 🛒 Express E-commerce Backend API

This is a backend project for an e-commerce platform, built with **Node.js**, **Express.js**, **PostgreSQL**, **Sequelize ORM**, and **Redis** for caching frequent reads.

---

## 📦 Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** (Relational Database)
- **Sequelize** (ORM)
- **Redis** (In-memory caching)
- **JWT** for authentication
- **express-validator** for request validation

---

## 📁 Folder Structure

express-postgres-ecommerce/
│
├── controllers/ # All business logic

├── models/ # Sequelize models

├── routes/ # Express route definitions

├── middlewares/ # Custom middlewares (auth, validation, etc.)

├── utils/ # Utility files like Redis client

├── config/ # DB and Sequelize config

├── server.js # Entry point

├── .env # Environment variables (not committed)

├── .gitignore

└── README.md

---

## 🔐 Authentication

- Users can **register** and **log in**.
- JWT is used for secure authentication.
- Protected routes are accessible only with valid tokens.

---

## 🚀 Caching with Redis

To optimize repeated read operations (like listing all products or customers), Redis is used:

- **First request** → Fetches from PostgreSQL and caches the result in Redis
- **Next requests** → Directly served from Redis (faster)
- Redis TTL (time to live) is set to 5 minutes (300 seconds)

This greatly improves performance for endpoints like:
- `GET /api/products`
- `GET /api/customers`

---

## 🔄 API Endpoints (Examples)

### Auth

- `POST /api/auth/register`  
- `POST /api/auth/login`

### Products

- `GET /api/products`
- `POST /api/products` (requires JWT)

### Customers

- `GET /api/customers`
- `GET /api/customers/:id`

### Orders

- `POST /api/orders`
- `GET /api/orders/:id`
