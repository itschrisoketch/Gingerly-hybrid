Below is a **clean, structured Markdown version** of the API specification, optimized so tools like **Cursor** can clearly understand endpoints, methods, headers, request bodies, and responses for API calls.

You can save this as `gingerly-api.md`.

---

```markdown
# Gingerly App – API Specification

**Version:** 1.0  
**Date:** 26 June 2024  
**Author:** hillarykamau.g@gmail.com  
**Description:** Initial draft  

---

## Base URL
```

/api/v1

```

---

## 1. Authentication

### 1.1 Login
Authenticate a user and obtain access tokens.

**Endpoint**
```

POST /auth/login/

````

**Request Body**
```json
{
  "email": "string",
  "password": "string",
  "login_type": "string"
}
````

**Responses**

* **200**

```json
{
  "access": {
    "refresh_token": "<auth_refresh_token>",
    "token": "<auth_token>"
  },
  "login_type": "<user_type_logging_in>",
  "msg": "<response message>",
  "success": true
}
```

* **400** `{ "error": "email required" }`
* **400** `{ "error": "password required" }`
* **401** `{ "error": "Incorrect username or password." }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

### 1.2 Forgot Password

Request a password reset.

**Endpoint**

```
POST /auth/forgot-password
```

**Request Body**

```json
{
  "msisdn": "string"
}
```

**Responses**

* **200**

```json
{
  "msg": "<response message>",
  "success": true,
  "token": "<password_change_token>"
}
```

* **400** `{ "error": "msisdn required" }`
* **400** `{ "error": "Incorrect phone number. Try again" }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

### 1.3 Forgot Password – OTP Verify

Verify OTP for password reset.

**Endpoint**

```
POST /auth/forgot-password/verify
```

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "otp": "string"
}
```

**Responses**

* **200**

```json
{
  "msg": "<response message>",
  "success": true,
  "token": "<password_change_token>"
}
```

* **400** `{ "error": "otp required" }`
* **400** `{ "error": "Incorrect otp" }`
* **401** `{ "error": "token expired" }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

### 1.4 Change Password

Reset password after OTP verification.

**Endpoint**

```
POST /auth/change-password
```

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "new_password": "string",
  "confirm_password": "string"
}
```

**Responses**

* **200**

```json
{
  "msg": "<response message>",
  "success": true
}
```

* **400** `{ "msg": "password required" }`
* **400** `{ "msg": "confirm_password required" }`
* **400** `{ "msg": "password mismatch" }`
* **401** `{ "msg": "token expired" }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

### 1.5 Verify Account

Verify customer or merchant account using OTP.

**Endpoint**

```
POST /auth/verify-account
```

**Request Body**

```json
{
  "msisdn": "string",
  "otp": "string"
}
```

**Responses**

* **200**

```json
{
  "msg": "<response message>",
  "success": true
}
```

* **400** `{ "msg": "msisdn required" }`
* **400** `{ "msg": "otp required" }`
* **400** `{ "msg": "Invalid OTP. Enter a valid OTP and try again" }`
* **500** `{ "error": "Request failed. Internal Server Error. Try again later." }`

---

### 1.6 Resend Verification OTP

**Endpoint**

```
POST /auth/resend-verification-otp
```

**Request Body**

```json
{
  "msisdn": "string"
}
```

**Responses**

* **200**

```json
{
  "msg": "<response message>",
  "success": true
}
```

* **400** `{ "msg": "msisdn required" }`
* **500** `{ "error": "Request failed. Internal Server Error. Try again later." }`

---

### 1.7 Secure Account

Deactivate a compromised account.

**Endpoint**

```
POST /auth/secure-account
```

**Headers**

```
Authorization: Bearer <access_token>
```

**Responses**

* **200**

```json
{
  "msg": "user account deactivated successfully",
  "success": true
}
```

* **401** `{ "msg": "Unauthorized" }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

## 2. Customer Endpoints

### 2.1 Register Customer

**Endpoint**

```
POST /customers/register
```

**Request Body**

```json
{
  "email": "string",
  "msisdn": "number",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "id_passport": "string"
}
```

**Responses**

* **201**

```json
{
  "msg": "account created successfully",
  "success": true
}
```

* **400** `{ "error": "<field> is required" }`
* **400** `{ "error": "Invalid phone_number/email." }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

### 2.2 Update Customer

**Endpoint**

```
PATCH /customers/update?id=<customer_id>
```

**Headers**

```
Authorization: Bearer <auth_token>
```

**Responses**

* **200**

```json
{
  "msg": "account updated successfully",
  "success": true
}
```

* **401** `{ "error": "Request failed. Unauthorized." }`
* **400** `{ "error": "Request failed. <error>" }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

### 2.3 Get Customer Account

**Endpoint**

```
GET /customers/my-account
```

**Headers**

```
Authorization: Bearer <auth_token>
```

**Responses**

* **200**

```json
{
  "msg": "request successful",
  "success": true,
  "data": {
    "customer": "<customer_details>",
    "account": "<customer_account_details>"
  }
}
```

* **401** `{ "error": "Request failed. Unauthorized." }`
* **404** `{ "error": "customer account not found" }`
* **500** `{ "error": "Something went wrong. Please try again later." }`

---

## 3. Merchant Endpoints

### 3.1 Register Merchant

**Endpoint**

```
POST /merchants/register
```

**Request Body**

```json
{
  "email": "string",
  "msisdn": "number",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "id_passport": "string",
  "tax_pin": "string",
  "erp": "string",
  "erp_name": "string"
}
```

---

### 3.2 Update Merchant

**Endpoint**

```
PATCH /merchants/update?id=<merchant_id>
```

**Headers**

```
Authorization: Bearer <auth_token>
```

---

### 3.3 Get Merchant Account

**Endpoint**

```
GET /merchants/my-account
```

**Headers**

```
Authorization: Bearer <auth_token>
```

---

## Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |
| 503  | Service Unavailable   |

---

## Conventions

* All requests and responses are JSON.
* All parameters are mandatory unless stated otherwise.
* Authentication uses **Bearer tokens**.
* Standard HTTP status codes are used.

```

---

If you want, I can also:
- Convert this into **OpenAPI / Swagger (YAML or JSON)**
- Generate **Cursor-ready API call examples** (fetch / axios)
- Split this into **per-module markdown files** for large repos
```
