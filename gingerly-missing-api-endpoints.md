# Gingerly API – Missing Endpoints Specification

**Date:** 30 January 2026
**Purpose:** Documents all backend API endpoints required by the frontend that are NOT yet in the current API specification.
**Current API Base URL:** `/api/v1`

---

## What Already Exists

The current API spec (`gingerly-api.md`) covers **13 endpoints**:

| # | Method | Endpoint | Status |
|---|--------|----------|--------|
| 1 | POST | `/auth/login/` | Exists |
| 2 | POST | `/auth/forgot-password` | Exists |
| 3 | POST | `/auth/forgot-password/verify` | Exists |
| 4 | POST | `/auth/change-password` | Exists |
| 5 | POST | `/auth/verify-account` | Exists |
| 6 | POST | `/auth/resend-verification-otp` | Exists |
| 7 | POST | `/auth/secure-account` | Exists |
| 8 | POST | `/customers/register` | Exists |
| 9 | PATCH | `/customers/update?id=<id>` | Exists |
| 10 | GET | `/customers/my-account` | Exists |
| 11 | POST | `/merchants/register` | Exists |
| 12 | PATCH | `/merchants/update?id=<id>` | Exists |
| 13 | GET | `/merchants/my-account` | Exists |

---

## What Is Missing

The frontend requires approximately **80+ additional endpoints** across 10 domains. Each section below documents the missing endpoints with method, path, request/response formats, and the frontend page that requires it.

---

## 1. Authentication (Missing)

### 1.1 Refresh Token

Refresh an expired access token without requiring re-login.

```
POST /auth/refresh-token
```

**Request Body**
```json
{
  "refresh_token": "string"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Token refreshed successfully",
  "access": {
    "token": "<new_auth_token>",
    "refresh_token": "<new_refresh_token>"
  }
}
```

**Used by:** All authenticated pages (automatic token refresh)

---

### 1.2 Logout

Invalidate the current session and tokens server-side.

```
POST /auth/logout
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Logged out successfully"
}
```

**Used by:** Dashboard sidebar, settings page

---

## 2. Properties

> **Used by:** `/dashboard/landlord/properties`, `/dashboard/landlord` (overview), analytics

### 2.1 List Properties

```
GET /properties
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `type` | string | No | Filter by type: `apartment`, `house`, `condo`, `commercial` |
| `status` | string | No | Filter by status: `active`, `inactive` |
| `search` | string | No | Search by name or address |
| `sort_by` | string | No | Sort field: `name`, `created_at`, `occupancy_rate` |
| `sort_order` | string | No | `asc` or `desc` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Properties retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "apartment | house | condo | commercial",
      "address": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string",
      "total_units": 12,
      "occupied_units": 10,
      "occupancy_rate": 83.3,
      "status": "active",
      "landlord_id": "string",
      "landlord_name": "string",
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2024-04-20T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "items_per_page": 20
  }
}
```

---

### 2.2 Get Property Details

```
GET /properties/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Property retrieved successfully",
  "data": {
    "id": "string",
    "name": "string",
    "type": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string",
    "total_units": 12,
    "occupied_units": 10,
    "occupancy_rate": 83.3,
    "status": "active",
    "landlord_id": "string",
    "landlord_name": "string",
    "amenities": ["Swimming Pool", "Fitness Center", "Laundry"],
    "units": [
      {
        "id": "string",
        "unit_number": "3B",
        "bedrooms": 2,
        "bathrooms": 1,
        "sq_ft": 850,
        "floor": 3,
        "rent_amount": 1200,
        "status": "occupied | vacant | maintenance",
        "tenant_id": "string | null"
      }
    ],
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-04-20T00:00:00Z"
  }
}
```

---

### 2.3 Create Property

```
POST /properties
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "name": "string",
  "type": "apartment | house | condo | commercial",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "total_units": 12
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Property created successfully",
  "data": {
    "id": "string"
  }
}
```

---

### 2.4 Update Property

```
PUT /properties/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "name": "string",
  "type": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "total_units": 12,
  "status": "active | inactive"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Property updated successfully"
}
```

---

### 2.5 Delete Property

```
DELETE /properties/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Property deleted successfully"
}
```

---

## 3. Units

> **Used by:** `/dashboard/landlord/properties` (property details), `/dashboard/tenant/home`

### 3.1 List Units for Property

```
GET /properties/{property_id}/units
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `occupied`, `vacant`, `maintenance` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Units retrieved successfully",
  "data": [
    {
      "id": "string",
      "unit_number": "3B",
      "bedrooms": 2,
      "bathrooms": 1,
      "sq_ft": 850,
      "floor": 3,
      "rent_amount": 1200,
      "status": "occupied",
      "tenant_id": "string | null",
      "tenant_name": "string | null"
    }
  ]
}
```

---

### 3.2 Create Unit

```
POST /properties/{property_id}/units
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "unit_number": "string",
  "bedrooms": 2,
  "bathrooms": 1,
  "sq_ft": 850,
  "floor": 3,
  "rent_amount": 1200
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Unit created successfully",
  "data": { "id": "string" }
}
```

---

### 3.3 Update Unit

```
PUT /properties/{property_id}/units/{unit_id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "unit_number": "string",
  "bedrooms": 2,
  "bathrooms": 1,
  "sq_ft": 850,
  "floor": 3,
  "rent_amount": 1200,
  "status": "occupied | vacant | maintenance"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Unit updated successfully"
}
```

---

### 3.4 Delete Unit

```
DELETE /properties/{property_id}/units/{unit_id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Unit deleted successfully"
}
```

---

## 4. Tenants

> **Used by:** `/dashboard/landlord/tenants`, tenant onboarding, landlord overview

### 4.1 List Tenants

```
GET /tenants
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |
| `status` | string | No | `active`, `pending`, `overdue`, `inactive` |
| `property_id` | string | No | Filter by property |
| `search` | string | No | Search by name, email, or phone |
| `sort_by` | string | No | `name`, `move_in`, `lease_end`, `rent` |
| `sort_order` | string | No | `asc` or `desc` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Tenants retrieved successfully",
  "data": [
    {
      "id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "phone": "string",
      "avatar": "string | null",
      "property_id": "string",
      "property_name": "string",
      "unit_id": "string",
      "unit_number": "string",
      "rent_amount": 1200,
      "status": "active | pending | overdue | inactive",
      "lease_start": "2024-01-01",
      "lease_end": "2024-12-31",
      "move_in_date": "2024-01-01",
      "rating": 4.8,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ],
  "summary": {
    "total": 42,
    "active": 38,
    "pending": 2,
    "overdue": 2
  },
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 42,
    "items_per_page": 20
  }
}
```

---

### 4.2 Get Tenant Details

```
GET /tenants/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Tenant retrieved successfully",
  "data": {
    "id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "avatar": "string | null",
    "id_passport": "string",
    "property_id": "string",
    "property_name": "string",
    "unit_id": "string",
    "unit_number": "string",
    "rent_amount": 1200,
    "security_deposit": 1200,
    "status": "active",
    "lease_start": "2024-01-01",
    "lease_end": "2024-12-31",
    "move_in_date": "2024-01-01",
    "autopay_enabled": true,
    "rating": 4.8,
    "payment_history_summary": {
      "on_time": 11,
      "late": 1,
      "missed": 0
    },
    "created_at": "2024-01-15T00:00:00Z"
  }
}
```

---

### 4.3 Invite Tenant

Send an invitation to a new tenant to join a property/unit.

```
POST /tenants/invite
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "property_id": "string",
  "unit_id": "string",
  "rent_amount": 1200,
  "lease_start": "2024-01-01",
  "lease_end": "2024-12-31",
  "security_deposit": 1200
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Invitation sent successfully",
  "data": {
    "invitation_id": "string"
  }
}
```

---

### 4.4 Update Tenant

```
PUT /tenants/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "rent_amount": 1300,
  "lease_end": "2025-12-31",
  "status": "active | inactive"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Tenant updated successfully"
}
```

---

### 4.5 Remove Tenant

```
DELETE /tenants/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Tenant removed successfully"
}
```

---

### 4.6 Export Tenants

```
POST /tenants/export
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "format": "csv | xlsx | pdf",
  "filters": {
    "status": "string | null",
    "property_id": "string | null"
  }
}
```

**Response (200)** — Returns file download URL
```json
{
  "success": true,
  "msg": "Export generated successfully",
  "data": {
    "download_url": "string",
    "expires_at": "2024-05-01T12:00:00Z"
  }
}
```

---

## 5. Payments

> **Used by:** `/dashboard/landlord/payments`, `/dashboard/tenant/payments`, dashboard overviews

### 5.1 List Payments (Landlord)

```
GET /payments
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |
| `status` | string | No | `paid`, `pending`, `overdue`, `failed` |
| `property_id` | string | No | Filter by property |
| `tenant_id` | string | No | Filter by tenant |
| `date_from` | string | No | Start date (ISO 8601) |
| `date_to` | string | No | End date (ISO 8601) |
| `search` | string | No | Search by tenant name |

**Response (200)**
```json
{
  "success": true,
  "msg": "Payments retrieved successfully",
  "data": [
    {
      "id": "string",
      "tenant_id": "string",
      "tenant_name": "string",
      "property_id": "string",
      "property_name": "string",
      "unit_number": "string",
      "amount": 1200,
      "status": "paid | pending | overdue | failed",
      "payment_method": "card | mpesa",
      "payment_date": "2024-04-01T00:00:00Z",
      "due_date": "2024-04-01",
      "days_late": 0,
      "created_at": "2024-04-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "items_per_page": 20
  }
}
```

---

### 5.2 Get Payment Statistics

```
GET /payments/stats
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | `month`, `quarter`, `year` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment stats retrieved successfully",
  "data": {
    "total_collected": 24560,
    "total_collected_change": 12.5,
    "pending_amount": 4890,
    "pending_count": 5,
    "overdue_amount": 2450,
    "overdue_count": 2,
    "collection_rate": 92,
    "collection_rate_change": 2.0
  }
}
```

---

### 5.3 Get Payment Details

```
GET /payments/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment retrieved successfully",
  "data": {
    "id": "string",
    "tenant_id": "string",
    "tenant_name": "string",
    "tenant_email": "string",
    "property_id": "string",
    "property_name": "string",
    "unit_number": "string",
    "amount": 1200,
    "status": "paid",
    "payment_method": "card",
    "payment_date": "2024-04-01T00:00:00Z",
    "due_date": "2024-04-01",
    "transaction_id": "string",
    "receipt_url": "string | null"
  }
}
```

---

### 5.4 Send Payment Reminder

```
POST /payments/{id}/remind
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment reminder sent successfully"
}
```

---

### 5.5 Download Payment Receipt

```
GET /payments/{id}/receipt
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)** — Returns PDF file or download URL
```json
{
  "success": true,
  "msg": "Receipt generated successfully",
  "data": {
    "download_url": "string"
  }
}
```

---

### 5.6 Export Payments Report

```
POST /payments/export
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "format": "csv | xlsx | pdf",
  "date_from": "2024-01-01",
  "date_to": "2024-04-30",
  "status": "string | null",
  "property_id": "string | null"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Report generated successfully",
  "data": {
    "download_url": "string",
    "expires_at": "2024-05-01T12:00:00Z"
  }
}
```

---

### 5.7 Tenant – Get Payment History

```
GET /tenant/payments/history
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment history retrieved successfully",
  "data": [
    {
      "id": "string",
      "amount": 1200,
      "status": "paid",
      "payment_method": "Visa ending 4242",
      "payment_date": "2024-04-01T00:00:00Z",
      "due_date": "2024-04-01",
      "receipt_url": "string | null"
    }
  ],
  "pagination": { "..." : "..." }
}
```

---

### 5.8 Tenant – Get Upcoming Payments

```
GET /tenant/payments/upcoming
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Upcoming payments retrieved successfully",
  "data": [
    {
      "id": "string",
      "amount": 1200,
      "due_date": "2024-05-01",
      "days_until_due": 3,
      "payment_method": "Visa ending 4242",
      "autopay_enabled": true
    }
  ]
}
```

---

### 5.9 Tenant – Make Payment

```
POST /tenant/payments/pay
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "payment_method_id": "string",
  "amount": 1200
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment processed successfully",
  "data": {
    "transaction_id": "string",
    "receipt_url": "string"
  }
}
```

---

### 5.10 Tenant – Toggle Autopay

```
POST /tenant/payments/autopay
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "enabled": true,
  "payment_method_id": "string"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Autopay updated successfully"
}
```

---

## 6. Payment Methods

> **Used by:** `/dashboard/tenant/payments` (Payment Methods tab), signup flow

### 6.1 List Payment Methods

```
GET /payment-methods
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment methods retrieved successfully",
  "data": [
    {
      "id": "string",
      "type": "card | mpesa",
      "label": "Visa ending 4242",
      "last_four": "4242",
      "expiry_date": "12/25",
      "is_default": true,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### 6.2 Add Payment Method

```
POST /payment-methods
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body (Card)**
```json
{
  "type": "card",
  "card_number": "string",
  "expiry_date": "MM/YY",
  "cvc": "string",
  "cardholder_name": "string",
  "is_default": false
}
```

**Request Body (M-Pesa)**
```json
{
  "type": "mpesa",
  "phone_number": "string",
  "is_default": false
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Payment method added successfully",
  "data": { "id": "string" }
}
```

---

### 6.3 Update Payment Method

```
PUT /payment-methods/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "is_default": true
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment method updated successfully"
}
```

---

### 6.4 Delete Payment Method

```
DELETE /payment-methods/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Payment method removed successfully"
}
```

---

## 7. Maintenance Requests

> **Used by:** `/dashboard/landlord/maintenance`, `/dashboard/tenant/maintenance`, `/dashboard/tenant/home`

### 7.1 List Maintenance Requests

```
GET /maintenance
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |
| `status` | string | No | `pending`, `in_progress`, `scheduled`, `completed` |
| `priority` | string | No | `low`, `medium`, `high`, `emergency` |
| `type` | string | No | `plumbing`, `electrical`, `hvac`, `general` |
| `property_id` | string | No | Filter by property |

**Response (200)**
```json
{
  "success": true,
  "msg": "Maintenance requests retrieved successfully",
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "plumbing | electrical | hvac | general",
      "priority": "low | medium | high | emergency",
      "status": "pending | in_progress | scheduled | completed",
      "property_id": "string",
      "property_name": "string",
      "unit_number": "string",
      "tenant_id": "string",
      "tenant_name": "string",
      "assigned_to": "string | null",
      "technician_name": "string | null",
      "estimated_cost": 150,
      "date_reported": "2024-05-01T00:00:00Z",
      "date_scheduled": "2024-05-03T10:00:00Z | null",
      "date_completed": "null",
      "created_at": "2024-05-01T00:00:00Z"
    }
  ],
  "summary": {
    "active": 3,
    "high_priority": 1,
    "completed_this_month": 2
  },
  "pagination": { "...": "..." }
}
```

---

### 7.2 Get Maintenance Request Details

```
GET /maintenance/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Request retrieved successfully",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "plumbing",
    "priority": "high",
    "status": "scheduled",
    "property_id": "string",
    "property_name": "string",
    "unit_number": "3B",
    "tenant_id": "string",
    "tenant_name": "string",
    "assigned_to": "string",
    "technician_name": "string",
    "technician_phone": "string",
    "estimated_cost": 150,
    "actual_cost": null,
    "date_reported": "2024-05-01T00:00:00Z",
    "date_scheduled": "2024-05-03T10:00:00Z",
    "date_completed": null,
    "notes": "string | null"
  }
}
```

---

### 7.3 Create Maintenance Request

```
POST /maintenance
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "title": "string",
  "description": "string",
  "type": "plumbing | electrical | hvac | general",
  "priority": "low | medium | high | emergency",
  "property_id": "string",
  "unit_id": "string"
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Maintenance request created successfully",
  "data": { "id": "string" }
}
```

---

### 7.4 Update Maintenance Request

```
PUT /maintenance/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "status": "in_progress | scheduled | completed",
  "assigned_to": "string",
  "date_scheduled": "2024-05-03T10:00:00Z",
  "estimated_cost": 200,
  "actual_cost": 175,
  "notes": "string"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Maintenance request updated successfully"
}
```

---

### 7.5 Cancel Maintenance Request

```
PUT /maintenance/{id}/cancel
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Maintenance request cancelled successfully"
}
```

---

## 8. Technicians

> **Used by:** `/dashboard/landlord/maintenance` (technician sidebar)

### 8.1 List Technicians

```
GET /technicians
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Technicians retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "specialty": "Plumbing | Electrical | HVAC | General",
      "phone": "string",
      "email": "string",
      "active_jobs": 2,
      "status": "available | busy"
    }
  ]
}
```

---

### 8.2 Add Technician

```
POST /technicians
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "name": "string",
  "specialty": "string",
  "phone": "string",
  "email": "string"
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Technician added successfully",
  "data": { "id": "string" }
}
```

---

### 8.3 Update Technician

```
PUT /technicians/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "name": "string",
  "specialty": "string",
  "phone": "string",
  "email": "string"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Technician updated successfully"
}
```

---

### 8.4 Delete Technician

```
DELETE /technicians/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Technician removed successfully"
}
```

---

## 9. Calendar & Events

> **Used by:** `/dashboard/landlord/calendar`, `/dashboard/tenant/calendar`

### 9.1 List Events

```
GET /calendar/events
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | No | Start date (ISO 8601) |
| `date_to` | string | No | End date (ISO 8601) |
| `type` | string | No | `payment`, `inspection`, `maintenance`, `meeting`, `move_in`, `move_out`, `marketing` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Events retrieved successfully",
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "payment | inspection | maintenance | meeting | move_in | move_out | marketing",
      "date": "2024-05-01",
      "time": "10:00 AM - 12:00 PM",
      "status": "active | scheduled | upcoming | completed",
      "property_id": "string | null",
      "property_name": "string | null",
      "unit_number": "string | null",
      "tenant_id": "string | null",
      "tenant_name": "string | null",
      "technician_name": "string | null",
      "notes": "string | null",
      "metadata": {}
    }
  ]
}
```

---

### 9.2 Get Upcoming Events

```
GET /calendar/events/upcoming
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Max events to return (default: 5) |

**Response (200)** — Same structure as 9.1

---

### 9.3 Create Event

```
POST /calendar/events
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "title": "string",
  "type": "payment | inspection | maintenance | meeting | move_in | move_out | marketing",
  "date": "2024-05-01",
  "time": "10:00 AM - 12:00 PM",
  "property_id": "string | null",
  "unit_number": "string | null",
  "tenant_id": "string | null",
  "notes": "string | null"
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Event created successfully",
  "data": { "id": "string" }
}
```

---

### 9.4 Update Event

```
PUT /calendar/events/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "title": "string",
  "date": "2024-05-02",
  "time": "2:00 PM - 4:00 PM",
  "status": "completed | cancelled",
  "notes": "string"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Event updated successfully"
}
```

---

### 9.5 Delete Event

```
DELETE /calendar/events/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Event deleted successfully"
}
```

---

## 10. Messages & Conversations

> **Used by:** `/dashboard/landlord/messages`, `/dashboard/tenant/messages`

### 10.1 List Conversations

```
GET /messages/conversations
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | No | `all`, `unread`, `urgent`, `maintenance` |
| `search` | string | No | Search by name or message content |

**Response (200)**
```json
{
  "success": true,
  "msg": "Conversations retrieved successfully",
  "data": [
    {
      "id": "string",
      "participant_id": "string",
      "participant_name": "string",
      "participant_avatar": "string | null",
      "property_name": "string | null",
      "unit_number": "string | null",
      "last_message": "string",
      "last_message_time": "2024-05-01T14:30:00Z",
      "unread_count": 2,
      "status": "urgent | resolved | pending | important | null",
      "type": "maintenance | payment | general | business"
    }
  ]
}
```

---

### 10.2 Get Conversation Messages

```
GET /messages/conversations/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Messages per page (default: 50) |

**Response (200)**
```json
{
  "success": true,
  "msg": "Messages retrieved successfully",
  "data": {
    "conversation": {
      "id": "string",
      "participant_id": "string",
      "participant_name": "string",
      "participant_avatar": "string | null",
      "property_name": "string | null",
      "unit_number": "string | null"
    },
    "messages": [
      {
        "id": "string",
        "sender_id": "string",
        "sender_name": "string",
        "sender_avatar": "string | null",
        "text": "string",
        "attachments": [],
        "timestamp": "2024-05-01T14:30:00Z",
        "is_read": true
      }
    ]
  },
  "pagination": { "...": "..." }
}
```

---

### 10.3 Send Message

```
POST /messages/send
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "conversation_id": "string | null",
  "recipient_id": "string",
  "text": "string",
  "attachments": ["string"]
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Message sent successfully",
  "data": {
    "message_id": "string",
    "conversation_id": "string"
  }
}
```

---

### 10.4 Mark Conversation as Read

```
PUT /messages/conversations/{id}/read
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Conversation marked as read"
}
```

---

### 10.5 Archive Conversation

```
PUT /messages/conversations/{id}/archive
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Conversation archived"
}
```

---

### 10.6 Get Unread Message Count

```
GET /messages/unread/count
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Unread count retrieved",
  "data": {
    "total_unread": 5
  }
}
```

---

## 11. Documents

> **Used by:** `/dashboard/landlord/documents`, `/dashboard/tenant/documents`, `/dashboard/tenant/home`

### 11.1 List Documents

```
GET /documents
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |
| `category` | string | No | `lease`, `financial`, `insurance`, `tenant_application`, `inspection`, `tax`, `contract`, `marketing`, `receipt`, `rules` |
| `property_id` | string | No | Filter by property |
| `status` | string | No | `active`, `completed`, `approved`, `archived` |
| `search` | string | No | Search by title |

**Response (200)**
```json
{
  "success": true,
  "msg": "Documents retrieved successfully",
  "data": [
    {
      "id": "string",
      "title": "string",
      "category": "lease | financial | insurance | inspection | tax | contract | receipt | rules",
      "file_type": "pdf | docx | xlsx",
      "file_size": "2.4 MB",
      "status": "active | completed | approved | archived",
      "property_id": "string | null",
      "property_name": "string | null",
      "unit_number": "string | null",
      "description": "string | null",
      "uploaded_by": "string",
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2024-04-20T00:00:00Z"
    }
  ],
  "summary": {
    "total": 8,
    "active_leases": 13,
    "financial_reports": 2,
    "legal_docs": 2
  },
  "pagination": { "...": "..." }
}
```

---

### 11.2 Get Document Details

```
GET /documents/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Document retrieved successfully",
  "data": {
    "id": "string",
    "title": "string",
    "category": "string",
    "file_type": "string",
    "file_size": "string",
    "file_url": "string",
    "status": "string",
    "property_id": "string | null",
    "property_name": "string | null",
    "unit_number": "string | null",
    "description": "string | null",
    "uploaded_by": "string",
    "created_at": "2024-01-15T00:00:00Z"
  }
}
```

---

### 11.3 Upload Document

```
POST /documents
```

**Headers:** `Authorization: Bearer <auth_token>`, `Content-Type: multipart/form-data`

**Request Body (multipart/form-data)**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | The document file |
| `title` | string | Yes | Document title |
| `category` | string | Yes | Document category |
| `property_id` | string | No | Associated property |
| `unit_number` | string | No | Associated unit |
| `description` | string | No | Description |

**Response (201)**
```json
{
  "success": true,
  "msg": "Document uploaded successfully",
  "data": { "id": "string" }
}
```

---

### 11.4 Update Document

```
PUT /documents/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (all fields optional)
```json
{
  "title": "string",
  "category": "string",
  "status": "active | archived",
  "description": "string"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Document updated successfully"
}
```

---

### 11.5 Delete Document

```
DELETE /documents/{id}
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Document deleted successfully"
}
```

---

### 11.6 Download Document

```
GET /documents/{id}/download
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)** — Returns file or redirect URL
```json
{
  "success": true,
  "msg": "Download ready",
  "data": {
    "download_url": "string",
    "expires_at": "2024-05-01T12:00:00Z"
  }
}
```

---

### 11.7 Share Document

```
POST /documents/{id}/share
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "recipient_ids": ["string"],
  "message": "string | null"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Document shared successfully"
}
```

---

## 12. Analytics & Reporting

> **Used by:** `/dashboard/landlord/analytics`, landlord dashboard overview

### 12.1 Get Dashboard Overview

```
GET /analytics/overview
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | `month`, `quarter`, `year`, `all` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Overview retrieved successfully",
  "data": {
    "total_revenue": 48250,
    "revenue_change": 12.5,
    "occupancy_rate": 94.7,
    "occupancy_change": 3.2,
    "average_rent": 1150,
    "avg_rent_change": 8.3,
    "maintenance_costs": 3420,
    "maintenance_change": -15.2,
    "total_properties": 12,
    "total_units": 156,
    "total_tenants": 42
  }
}
```

---

### 12.2 Get Property Performance

```
GET /analytics/properties
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Property performance retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "total_units": 24,
      "occupied_units": 22,
      "revenue": 26400,
      "yield_percentage": 8.2,
      "satisfaction_rating": 4.8,
      "maintenance_requests": 3
    }
  ]
}
```

---

### 12.3 Get Financial Trends

```
GET /analytics/financial
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | `month`, `quarter`, `year` |

**Response (200)**
```json
{
  "success": true,
  "msg": "Financial trends retrieved successfully",
  "data": [
    {
      "month": "Jan",
      "revenue": 42000,
      "expenses": 12000,
      "occupancy": 92
    },
    {
      "month": "Feb",
      "revenue": 44500,
      "expenses": 11000,
      "occupancy": 93
    }
  ]
}
```

---

### 12.4 Get Tenant Insights

```
GET /analytics/tenants
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Tenant insights retrieved successfully",
  "data": {
    "average_tenancy_months": 18,
    "renewal_rate": 87,
    "new_tenants_this_period": 8,
    "move_outs_this_period": 3,
    "average_payment_days": 2.3,
    "late_payments_count": 5
  }
}
```

---

### 12.5 Generate Report

```
POST /analytics/report
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "type": "performance | financial | tenant",
  "period": "month | quarter | year",
  "format": "pdf | csv | xlsx",
  "property_id": "string | null"
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Report generated successfully",
  "data": {
    "download_url": "string",
    "expires_at": "2024-05-01T12:00:00Z"
  }
}
```

---

## 13. Tenant Profile & Lease

> **Used by:** `/dashboard/tenant`, `/dashboard/tenant/home`

### 13.1 Get Tenant Profile

```
GET /tenant/profile
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Profile retrieved successfully",
  "data": {
    "id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "avatar": "string | null",
    "property_id": "string",
    "property_name": "string",
    "property_address": "string",
    "unit_id": "string",
    "unit_number": "string",
    "bedrooms": 2,
    "bathrooms": 1,
    "sq_ft": 850,
    "floor": 3,
    "rent_amount": 1200,
    "security_deposit": 1200,
    "lease_start": "2024-01-01",
    "lease_end": "2024-12-31",
    "move_in_date": "2024-01-01",
    "autopay_enabled": true,
    "default_payment_method": "Visa ending 4242",
    "property_manager": {
      "name": "string",
      "email": "string",
      "phone": "string"
    }
  }
}
```

---

### 13.2 Get Amenities

```
GET /tenant/amenities
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Amenities retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "Swimming Pool",
      "hours": "8:00 AM - 10:00 PM",
      "available": true,
      "bookable": true
    }
  ]
}
```

---

### 13.3 Reserve Amenity

```
POST /tenant/amenities/{id}/reserve
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body**
```json
{
  "date": "2024-05-15",
  "time_from": "2:00 PM",
  "time_to": "4:00 PM",
  "purpose": "string | null"
}
```

**Response (201)**
```json
{
  "success": true,
  "msg": "Amenity reserved successfully",
  "data": { "reservation_id": "string" }
}
```

---

## 14. Notifications

> **Used by:** All dashboard pages (notification bell)

### 14.1 List Notifications

```
GET /notifications
```

**Headers:** `Authorization: Bearer <auth_token>`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |
| `read` | boolean | No | Filter by read status |

**Response (200)**
```json
{
  "success": true,
  "msg": "Notifications retrieved successfully",
  "data": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "type": "payment | maintenance | lease | system",
      "is_read": false,
      "action_url": "string | null",
      "created_at": "2024-05-01T14:30:00Z"
    }
  ],
  "unread_count": 3,
  "pagination": { "...": "..." }
}
```

---

### 14.2 Mark Notification as Read

```
PUT /notifications/{id}/read
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Notification marked as read"
}
```

---

### 14.3 Mark All Notifications as Read

```
PUT /notifications/read-all
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "All notifications marked as read"
}
```

---

### 14.4 Get Unread Count

```
GET /notifications/unread/count
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "data": { "count": 3 }
}
```

---

## 15. Settings

> **Used by:** `/dashboard/landlord/settings`, `/dashboard/tenant/settings`

### 15.1 Get User Settings

```
GET /settings
```

**Headers:** `Authorization: Bearer <auth_token>`

**Response (200)**
```json
{
  "success": true,
  "msg": "Settings retrieved successfully",
  "data": {
    "notifications": {
      "email_payment_reminders": true,
      "email_maintenance_updates": true,
      "sms_payment_reminders": false,
      "push_notifications": true
    },
    "preferences": {
      "language": "en",
      "currency": "KES",
      "timezone": "Africa/Nairobi",
      "date_format": "DD/MM/YYYY"
    }
  }
}
```

---

### 15.2 Update Settings

```
PUT /settings
```

**Headers:** `Authorization: Bearer <auth_token>`

**Request Body** (partial update)
```json
{
  "notifications": {
    "sms_payment_reminders": true
  },
  "preferences": {
    "currency": "USD"
  }
}
```

**Response (200)**
```json
{
  "success": true,
  "msg": "Settings updated successfully"
}
```

---

### 15.3 Upload Profile Avatar

```
POST /users/avatar
```

**Headers:** `Authorization: Bearer <auth_token>`, `Content-Type: multipart/form-data`

**Request Body (multipart/form-data)**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `avatar` | file | Yes | Image file (JPG, PNG, max 5MB) |

**Response (200)**
```json
{
  "success": true,
  "msg": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "string"
  }
}
```

---

## Summary

### Endpoint Count by Domain

| Domain | Existing | Missing | Total Needed |
|--------|----------|---------|--------------|
| Authentication | 7 | 2 | 9 |
| Customer/Merchant | 6 | 0 | 6 |
| Properties | 0 | **5** | 5 |
| Units | 0 | **4** | 4 |
| Tenants | 0 | **6** | 6 |
| Payments | 0 | **10** | 10 |
| Payment Methods | 0 | **4** | 4 |
| Maintenance | 0 | **5** | 5 |
| Technicians | 0 | **4** | 4 |
| Calendar/Events | 0 | **5** | 5 |
| Messages | 0 | **6** | 6 |
| Documents | 0 | **7** | 7 |
| Analytics | 0 | **5** | 5 |
| Tenant Profile | 0 | **3** | 3 |
| Notifications | 0 | **4** | 4 |
| Settings | 0 | **3** | 3 |
| **TOTAL** | **13** | **73** | **86** |

### Priority Ranking

**P0 — Required for MVP launch:**
1. Properties (5 endpoints)
2. Units (4 endpoints)
3. Tenants (6 endpoints)
4. Payments + Payment Methods (14 endpoints)
5. Tenant Profile (3 endpoints)
6. Auth: Refresh Token, Logout (2 endpoints)

**P1 — Required for full functionality:**
7. Maintenance + Technicians (9 endpoints)
8. Messages (6 endpoints)
9. Documents (7 endpoints)
10. Notifications (4 endpoints)

**P2 — Enhancement features:**
11. Calendar/Events (5 endpoints)
12. Analytics/Reporting (5 endpoints)
13. Settings (3 endpoints)

---

## Conventions (Carry Forward)

- All requests and responses are JSON (except file uploads which use `multipart/form-data`)
- All parameters are mandatory unless stated otherwise
- Authentication uses **Bearer tokens** via `Authorization` header
- Standard HTTP status codes are used (see existing spec)
- All list endpoints support pagination via `page` and `limit` query params
- All timestamps use ISO 8601 format
- Error responses follow: `{ "success": false, "error": "message" }`
- Success responses follow: `{ "success": true, "msg": "message", "data": {} }`
