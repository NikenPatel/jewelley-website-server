# Admin Panel Setup

## Overview

The admin panel provides a secure way to manage products on the jewellery website.

## Authentication

Admin routes require a signed-in admin JWT in the `Authorization` header.
Set a strong JWT secret in the `.env` file:

```
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_KEY=your_secure_admin_signup_key_here
```

You can also use the existing `ADMIN_KEY` as the admin signup key if
`ADMIN_SIGNUP_KEY` is not set.

### Create Admin Account

```
POST /api/auth/signup
Content-Type: application/json
Body: {
  "name": "Admin",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "admin",
  "adminKey": "your_secure_admin_signup_key_here"
}
```

### Sign In

```
POST /api/auth/signin
Content-Type: application/json
Body: {
  "email": "admin@example.com",
  "password": "secret123"
}
```

Use the returned `token` for admin requests:

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

All admin endpoints are prefixed with `/api/admin/`

### Products Management

#### Get All Products

```
GET /api/admin/products
Headers: Authorization: Bearer your_jwt_token
```

#### Get Single Product

```
GET /api/admin/products/:id
Headers: Authorization: Bearer your_jwt_token
```

#### Create Product

```
POST /api/admin/products
Headers: Authorization: Bearer your_jwt_token
Content-Type: application/json
Body: { product data }
```

#### Update Product

```
PUT /api/admin/products/:id
Headers: Authorization: Bearer your_jwt_token
Content-Type: application/json
Body: { updated product data }
```

#### Delete Product

```
DELETE /api/admin/products/:id
Headers: Authorization: Bearer your_jwt_token
```

### Dashboard Stats

```
GET /api/admin/dashboard/stats
Headers: Authorization: Bearer your_jwt_token
```

## Example Requests (using cURL)

### Get all products

```bash
curl -H "Authorization: Bearer your_jwt_token" http://localhost:8000/api/admin/products
```

### Create a product

```bash
curl -X POST http://localhost:8000/api/admin/products \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ring", "description": "Gold Ring"}'
```

### Update a product

```bash
curl -X PUT http://localhost:8000/api/admin/products/:id \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"price": 5000}'
```

### Delete a product

```bash
curl -X DELETE http://localhost:8000/api/admin/products/:id \
  -H "Authorization: Bearer your_jwt_token"
```

## Security Notes

- Always use a strong JWT secret in production
- Keep the admin signup key private
- Add rate limiting to prevent brute force attacks
- Enable HTTPS in production

## collection

Users
Admins
Products
Categories
SubCategories
Collections
Orders
Customers
Coupons
Reviews
Wishlist
Vendors
Banners
Notifications
Payments
Settings

## Main Dashboard Cards

Total Revenue
Total Orders
Total Customers
Total Products
Pending Orders
Low Stock Products
Today's Sales
Monthly Sales
