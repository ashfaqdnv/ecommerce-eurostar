# E-Commerce Eurostar REST API

## Description

A lightweight e-commerce REST API built with JavaScript and Express. The API runs entirely in memory (no database) and provides user authentication via JWT tokens and a checkout flow with payment-based discounts.

The project follows a layered architecture with Routes, Middleware, Controllers, Services, and Models under the `src` folder.

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ecommerce-eurostar
```

2. Install dependencies:

```bash
npm install
```

## How to Run

Start the server:

```bash
npm start
```

The API will be available at `http://localhost:3000`.

For development with auto-reload:

```bash
npm run dev
```

Optional environment variables:

| Variable     | Default                        | Description              |
|--------------|--------------------------------|--------------------------|
| `PORT`       | `3000`                         | Server port              |
| `JWT_SECRET` | `ecommerce-eurostar-secret`    | Secret for signing JWTs  |

## Rules

### Checkout

- **Payment methods:** Only `cash` or `credit_card` are accepted.
- **Cash discount:** Paying with `cash` applies a **10% discount** on the order subtotal.
- **Authentication:** Only authenticated users (valid JWT token) can perform checkout.

### API

- The API exposes exactly **4 endpoints**: register, login, checkout, and healthcheck.
- All data is stored **in memory** — restarting the server resets users and products to their initial seed values (except newly registered users are lost).

## Existent Data

### Users (seed)

| ID | Email               | Password     | Name           |
|----|---------------------|--------------|----------------|
| 1  | alice@example.com   | password123  | Alice Johnson  |
| 2  | bob@example.com     | password123  | Bob Smith      |
| 3  | carol@example.com   | password123  | Carol Williams |

### Products (seed)

| ID | Name                | Price  | Stock |
|----|---------------------|--------|-------|
| 1  | Wireless Headphones | $79.99 | 50    |
| 2  | Smart Watch         | $199.99| 30    |
| 3  | USB-C Hub           | $34.99 | 100   |

## How to Use the Rest API

Base URL: `http://localhost:3000/api`

### 1. Healthcheck

Verify the API is running.

**Request**

```
GET /api/healthcheck
```

**Response** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-06-15T12:00:00.000Z"
}
```

---

### 2. Register

Create a new user account and receive a JWT token.

**Request**

```
POST /api/register
Content-Type: application/json
```

```json
{
  "email": "newuser@example.com",
  "password": "securepass",
  "name": "New User"
}
```

**Response** `201 Created`

```json
{
  "user": {
    "id": 4,
    "email": "newuser@example.com",
    "name": "New User"
  },
  "token": "<jwt-token>"
}
```

---

### 3. Login

Authenticate an existing user and receive a JWT token.

**Request**

```
POST /api/login
Content-Type: application/json
```

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response** `200 OK`

```json
{
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Johnson"
  },
  "token": "<jwt-token>"
}
```

---

### 4. Checkout

Place an order. Requires a valid JWT token in the `Authorization` header.

**Request**

```
POST /api/checkout
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ],
  "paymentMethod": "cash"
}
```

**Response** `200 OK`

```json
{
  "message": "Checkout completed successfully",
  "order": {
    "items": [
      {
        "productId": 1,
        "name": "Wireless Headphones",
        "unitPrice": 79.99,
        "quantity": 2,
        "lineTotal": 159.98
      },
      {
        "productId": 3,
        "name": "USB-C Hub",
        "unitPrice": 34.99,
        "quantity": 1,
        "lineTotal": 34.99
      }
    ],
    "paymentMethod": "cash",
    "subtotal": 194.97,
    "discount": 19.5,
    "total": 175.47
  },
  "customer": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Johnson"
  }
}
```

**Payment methods**

| Value          | Description                          |
|----------------|--------------------------------------|
| `cash`         | 10% discount applied to subtotal     |
| `credit_card`  | No discount                          |

**Error responses**

| Status | Condition                                      |
|--------|------------------------------------------------|
| 401    | Missing, invalid, or expired JWT token         |
| 400    | Invalid items, payment method, or insufficient stock |
| 404    | Product not found                              |

---

### Example with cURL

```bash
# Healthcheck
curl http://localhost:3000/api/healthcheck

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@example.com\",\"password\":\"password123\"}"

# Checkout with cash (10% discount)
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d "{\"items\":[{\"productId\":1,\"quantity\":1}],\"paymentMethod\":\"cash\"}"
```
