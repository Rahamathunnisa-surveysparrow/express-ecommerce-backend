# Express E-commerce Backend API

This project is a backend system for an e-commerce platform, built with **Node.js**, **Express.js**, **PostgreSQL**, **Sequelize ORM**, and **Redis**. It features user authentication, product and order management, Redis-based caching, background jobs with Bull, email notifications, and business rule enforcement.

---

## Project Features

- User registration and login with JWT authentication
- Product CRUD with soft delete, restore, and pagination
- Customer management with update and delete constraints
- Order placement with stock checks, rollback, and lifecycle updates
- Background jobs using Bull and Redis
- Email notifications for order status changes
- Redis caching for frequent GET endpoints
- Sequelize hooks for data integrity and business logic enforcement
- Comprehensive validations with express-validator

---

## Tech Stack

- Node.js with Express.js
- PostgreSQL (Relational Database)
- Sequelize (ORM)
- Redis (Caching)
- Bull (Queue system for background jobs)
- Mailtrap (SMTP email testing)
- JWT (Authentication)
- express-validator (Request validation)

---

## Folder Structure

express-postgres-ecommerce/

│

├── controllers/ # Business logic for each feature

├── routes/ # Express route definitions

├── models/ # Sequelize models and associations

├── validators/ # Input validation schemas

├── middlewares/ # JWT authentication, validation middleware

├── utils/ # Redis caching, email, pagination helpers

├── bull/

│ ├── queue/ # Bull queues

│ ├── jobs/ # Job definitions

│ └── processors/ # Job processors

├── hooks/ # Sequelize hooks for business logic

├── config/ # Sequelize and DB config

├── scripts/ # Utility scripts (e.g., clean queues)

├── migrations/ # Sequelize CLI migrations

├── server.js # Application entry point

├── .env # Environment variables

└── .gitignore


---

## Authentication

- Users can register and log in using `/api/auth/register` and `/api/auth/login`.
- JWT tokens are issued upon login.
- Protected routes require a valid token in the `Authorization` header.

---

## Caching with Redis

To improve performance for repeated GET requests:
- Responses are cached in Redis with a TTL of 5 minutes.
- On cache miss, data is fetched from PostgreSQL and stored in Redis.
- Applied to:
  - `GET /api/products`
  - `GET /api/customers`

---

## Queue System (Bull + Redis)

- Background jobs manage order lifecycle:
  - Status updates every hour: `pending → processing → shipped → delivered`
- Redis-backed queues:
  - Prevent duplicate emails
  - Restore jobs on order restoration
- One email per status update is sent via Mailtrap

---

## API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/restore/:id`
- `DELETE /api/products/:id` (soft delete)

### Customers

- `GET /api/customers`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `PATCH /api/customers/email/:id`
- `PATCH /api/customers/phone/:id`
- `DELETE /api/customers/:id`

### Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `DELETE /api/orders/:id` (soft delete)

---

## Validations and Business Logic

- All create and update endpoints are validated using `express-validator`.
- Business rules enforced:
  - Customers with undelivered orders cannot be deleted
  - Orders can only be deleted after 1 day
  - Stock is restored on order cancellation
  - No deletion allowed for delivered orders

---

## Development and Testing

- All routes are tested using Postman
- Database state is verified using pgAdmin
- Emails are tested using Mailtrap
- Redis logs and cache hits/misses are logged in the console

---

## Setup Instructions

1. Clone the repository  
2. Create a `.env` file based on `.env.example`  
3. Run `npm install`  
4. Run migrations: `npx sequelize-cli db:migrate`  
5. Start Redis server and run it.
6. Run server: `node server.js`  
7. Run worker: `node bull/index.js`