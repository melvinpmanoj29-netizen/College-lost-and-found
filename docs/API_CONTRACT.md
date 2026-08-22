# College Lost & Found System — API Contract

## Overview

This document defines the complete REST API contract for the College Lost & Found System. All four developers must follow this contract exactly.

**Base URL:** `/api`

**Backend Technology:** Java 21 + Spring Boot

**API Style:** REST

**Data Format:** JSON

**Authentication:** JWT Bearer Token

---

## General API Rules

### Authentication

Protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format

All responses must be JSON.

### DTO Usage

Controllers must use DTOs (Data Transfer Objects):
- Request DTOs for incoming data
- Response DTOs for outgoing data
- Sensitive fields must be excluded from student-facing DTOs

### What Must NEVER Be Exposed

- `password_hash` (never expose password information)
- Plaintext passwords
- `claims.verification_answer` (except to authorized admins in review context)
- Unnecessary sensitive personal information

---

## HTTP Status Codes

Use these status codes consistently across all endpoints:

| Code | Usage |
|------|-------|
| **200 OK** | Successful GET, update, or action |
| **201 CREATED** | Successful creation |
| **204 NO CONTENT** | Successful deletion where appropriate |
| **400 BAD REQUEST** | Invalid request data or validation failure |
| **401 UNAUTHORIZED** | Missing or invalid authentication token |
| **403 FORBIDDEN** | Authenticated user lacks required permission |
| **404 NOT FOUND** | Requested resource does not exist |
| **409 CONFLICT** | Duplicate or conflicting operation (e.g., duplicate claim) |
| **500 INTERNAL SERVER ERROR** | Unexpected server error |

---

## Standard Error Response

All error responses must use this consistent structure:

```json
{
  "status": 400,
  "message": "Human-readable error message",
  "timestamp": "2026-08-22T12:30:00"
}
```

**Important:** Do NOT return stack traces to the frontend.

---

## Role Definitions

### STUDENT Role

Students can:

- Manage their own profile
- Create lost item reports
- Manage their own lost item reports
- Create found item reports
- Manage their own found item reports
- Search for items
- View possible matches
- Submit claims for found items
- View their own claims
- View their own notifications
- Mark their notifications as read

### ADMIN Role

Admins can do everything students can do, PLUS:

- View all lost item reports
- View all found item reports
- Manage any report (edit, delete fake reports)
- Review claims
- Approve claims
- Reject claims
- Mark items as returned
- Access admin dashboard
- View statistics
- View return history

**Important:** Backend authorization is mandatory. Authorization must NOT rely on frontend-only checks.

---

## 1. Authentication APIs

Authentication endpoints are owned by **Developer 1 (Me10x)**.

### REGISTER

```
POST /api/auth/register
```

**Authentication:** PUBLIC (no token required)

**Request:**

```json
{
  "studentName": "John Doe",
  "rollNumber": "CS2026-001",
  "className": "CSE S4",
  "email": "john@example.com",
  "password": "password"
}
```

**Response:** 201 CREATED

```json
{
  "message": "Registration successful"
}
```

**Important:** Do NOT return password or password_hash in response.

**Validation:**
- All fields are required
- rollNumber must be unique
- email must be unique (if used in authentication)
- Password must meet security requirements (implement as needed)

---

### LOGIN

```
POST /api/auth/login
```

**Authentication:** PUBLIC (no token required)

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password"
}
```

**Response:** 200 OK

```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "studentName": "John Doe",
    "rollNumber": "CS2026-001",
    "className": "CSE S4",
    "email": "john@example.com",
    "profileImageUrl": null,
    "role": "STUDENT"
  }
}
```

**Important:**
- Never return `password_hash`
- Include JWT token in response
- Token can be used for subsequent authenticated requests

---

## 2. User / Profile APIs

User and profile endpoints are owned by **Developer 1 (Me10x)**.

### GET CURRENT USER

```
GET /api/users/me
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
{
  "id": 1,
  "studentName": "John Doe",
  "rollNumber": "CS2026-001",
  "className": "CSE S4",
  "email": "john@example.com",
  "profileImageUrl": "https://...",
  "role": "STUDENT"
}
```

**Note:** Returns the authenticated user's profile based on JWT token.

---

### UPDATE CURRENT USER

```
PUT /api/users/me
```

**Authentication:** REQUIRED

**Request:**

```json
{
  "studentName": "John Updated",
  "className": "CSE S4",
  "profileImageUrl": "https://..."
}
```

**Response:** 200 OK

```json
{
  "id": 1,
  "studentName": "John Updated",
  "rollNumber": "CS2026-001",
  "className": "CSE S4",
  "email": "john@example.com",
  "profileImageUrl": "https://...",
  "role": "STUDENT"
}
```

**Important:**
- User can only update their own profile
- User ID comes from JWT (authenticated session)
- Do NOT accept arbitrary user IDs from frontend for ownership
- Profile images are stored on Cloudinary; API stores only URL

---

## 3. Lost Item APIs

Lost Item endpoints are owned by **Developer 2 (Nived)**.

### GET ALL LOST ITEMS

```
GET /api/lost-items
```

**Authentication:** AUTHENTICATED STUDENT

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "userId": 5,
    "itemName": "Black Wallet",
    "imageUrl": "https://...",
    "description": "Black leather wallet with red stitching",
    "category": "Wallet",
    "color": "Black",
    "lostDateTime": "2026-08-20T14:30:00",
    "lastSeenLocation": "Library",
    "status": "LOST",
    "isUrgent": false,
    "expiryDate": "2026-09-20T14:30:00",
    "isArchived": false,
    "createdAt": "2026-08-20T14:35:00",
    "updatedAt": "2026-08-20T14:35:00"
  }
]
```

**Important:** Do NOT expose private claim verification information.

---

### GET LOST ITEM

```
GET /api/lost-items/{id}
```

**Authentication:** AUTHENTICATED STUDENT

**Response:** 200 OK

Returns single LostItemResponse object (same structure as above).

**Error Responses:**
- 404 NOT FOUND — if item does not exist

---

### CREATE LOST ITEM

```
POST /api/lost-items
```

**Authentication:** REQUIRED

**Role:** STUDENT

**Request:**

```json
{
  "itemName": "Black Wallet",
  "imageUrl": "https://...",
  "description": "Black leather wallet with red stitching",
  "category": "Wallet",
  "color": "Black",
  "lostDateTime": "2026-08-20T14:30:00",
  "lastSeenLocation": "Library",
  "isUrgent": false,
  "expiryDate": "2026-09-20T14:30:00"
}
```

**Response:** 201 CREATED

```json
{
  "id": 1,
  "userId": 5,
  "itemName": "Black Wallet",
  "imageUrl": "https://...",
  "description": "Black leather wallet with red stitching",
  "category": "Wallet",
  "color": "Black",
  "lostDateTime": "2026-08-20T14:30:00",
  "lastSeenLocation": "Library",
  "status": "LOST",
  "isUrgent": false,
  "expiryDate": "2026-09-20T14:30:00",
  "isArchived": false,
  "createdAt": "2026-08-20T14:35:00",
  "updatedAt": "2026-08-20T14:35:00"
}
```

**Important:**
- `userId` MUST come from the authenticated JWT
- Do NOT allow frontend to specify arbitrary `userId` ownership
- Status is automatically set to `LOST`
- `isArchived` defaults to `false`

---

### UPDATE LOST ITEM

```
PUT /api/lost-items/{id}
```

**Authentication:** REQUIRED

**Role:** Item owner or ADMIN (per project authorization rules)

**Request:** Same fields as creation request

**Response:** 200 OK

**Error Responses:**
- 403 FORBIDDEN — if user is not owner and not admin
- 404 NOT FOUND — if item does not exist

---

### DELETE LOST ITEM

```
DELETE /api/lost-items/{id}
```

**Authentication:** REQUIRED

**Role:** Item owner or ADMIN (per project authorization rules)

**Response:** 204 NO CONTENT

**Error Responses:**
- 403 FORBIDDEN — if user is not authorized
- 404 NOT FOUND — if item does not exist

---

### GET MY LOST ITEMS

```
GET /api/lost-items/my
```

**Authentication:** REQUIRED

**Response:** 200 OK

Returns array of LostItemResponse objects belonging to the authenticated user.

---

## 4. Found Item APIs

Found Item endpoints are owned by **Developer 3 (Sahla)**.

### GET ALL FOUND ITEMS

```
GET /api/found-items
```

**Authentication:** AUTHENTICATED STUDENT

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "userId": 8,
    "itemName": "Black Wallet",
    "imageUrl": "https://...",
    "description": "Black leather wallet found near main gate",
    "category": "Wallet",
    "color": "Black",
    "foundDateTime": "2026-08-21T10:00:00",
    "foundLocation": "Library",
    "status": "FOUND",
    "createdAt": "2026-08-21T10:05:00",
    "updatedAt": "2026-08-21T10:05:00"
  }
]
```

---

### GET FOUND ITEM

```
GET /api/found-items/{id}
```

**Authentication:** AUTHENTICATED STUDENT

**Response:** 200 OK

Returns single FoundItemResponse object.

---

### CREATE FOUND ITEM

```
POST /api/found-items
```

**Authentication:** REQUIRED

**Role:** STUDENT

**Request:**

```json
{
  "itemName": "Black Wallet",
  "imageUrl": "https://...",
  "description": "Black leather wallet found near main gate",
  "category": "Wallet",
  "color": "Black",
  "foundDateTime": "2026-08-21T10:00:00",
  "foundLocation": "Library"
}
```

**Response:** 201 CREATED

```json
{
  "id": 1,
  "userId": 8,
  "itemName": "Black Wallet",
  "imageUrl": "https://...",
  "description": "Black leather wallet found near main gate",
  "category": "Wallet",
  "color": "Black",
  "foundDateTime": "2026-08-21T10:00:00",
  "foundLocation": "Library",
  "status": "FOUND",
  "createdAt": "2026-08-21T10:05:00",
  "updatedAt": "2026-08-21T10:05:00"
}
```

**Important:**
- `userId` MUST come from authenticated JWT
- Do NOT allow frontend to specify arbitrary `userId`
- Status is automatically set to `FOUND`

---

### UPDATE FOUND ITEM

```
PUT /api/found-items/{id}
```

**Authentication:** REQUIRED

**Role:** Item owner or ADMIN

**Response:** 200 OK

---

### DELETE FOUND ITEM

```
DELETE /api/found-items/{id}
```

**Authentication:** REQUIRED

**Role:** Item owner or ADMIN

**Response:** 204 NO CONTENT

---

### GET MY FOUND ITEMS

```
GET /api/found-items/my
```

**Authentication:** REQUIRED

**Response:** 200 OK

Returns array of FoundItemResponse objects belonging to the authenticated user.

---

## 5. Smart Match APIs

Smart Match endpoints are owned by **Developer 3 (Sahla)**.

The Smart Match system uses a **rule-based scoring algorithm** (NOT machine learning or external AI).

Scoring:
- Category: 30 points
- Colour: 20 points
- Location: 20 points
- Date: 10 points
- Description: 20 points
- **Total: 100 points**

### GET MATCHES FOR LOST ITEM

```
GET /api/matches/lost/{lostItemId}
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "lostItemId": 10,
    "foundItemId": 20,
    "matchScore": 87.00,
    "matchStatus": "POSSIBLE",
    "createdAt": "2026-08-21T12:00:00"
  }
]
```

**Note:** Returns array of possible matches for the specified lost item.

---

### GET MATCHES FOR FOUND ITEM

```
GET /api/matches/found/{foundItemId}
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "lostItemId": 10,
    "foundItemId": 20,
    "matchScore": 87.00,
    "matchStatus": "POSSIBLE",
    "createdAt": "2026-08-21T12:00:00"
  }
]
```

**Note:** Returns array of possible matches for the specified found item.

---

### GET MATCH DETAILS

```
GET /api/matches/{id}
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
{
  "id": 1,
  "lostItemId": 10,
  "foundItemId": 20,
  "matchScore": 87.00,
  "matchStatus": "POSSIBLE",
  "createdAt": "2026-08-21T12:00:00"
}
```

**Important:** Do NOT expose private claim verification information.

---

## 6. Claim APIs

Claim endpoints are owned by **Developer 3 (Sahla)**.

### CREATE CLAIM

```
POST /api/claims
```

**Authentication:** REQUIRED

**Role:** STUDENT

**Request:**

```json
{
  "lostItemId": 10,
  "foundItemId": 20,
  "verificationAnswer": "My student bus card"
}
```

**Response:** 201 CREATED

```json
{
  "id": 1,
  "lostItemId": 10,
  "foundItemId": 20,
  "status": "PENDING",
  "createdAt": "2026-08-21T15:00:00"
}
```

**Important:**
- `claimantUserId` MUST come from authenticated JWT
- Do NOT accept arbitrary `claimantUserId` from frontend
- Do NOT return `verificationAnswer` in response to student
- Backend must validate:
  - Lost Item exists
  - Found Item exists
  - Valid relationship/match exists (where required)
  - Claimant is authenticated
  - Duplicate claim is not created (UNIQUE constraint on lost_item_id, found_item_id, claimant_user_id)

**Error Responses:**
- 400 BAD REQUEST — if validation fails
- 409 CONFLICT — if duplicate claim exists
- 404 NOT FOUND — if lost/found item not found

---

### GET MY CLAIMS

```
GET /api/claims/my
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "lostItemId": 10,
    "foundItemId": 20,
    "status": "PENDING",
    "createdAt": "2026-08-21T15:00:00"
  }
]
```

**Important:** Never expose `verificationAnswer` to students.

---

### GET CLAIM

```
GET /api/claims/{id}
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
{
  "id": 1,
  "lostItemId": 10,
  "foundItemId": 20,
  "status": "PENDING",
  "createdAt": "2026-08-21T15:00:00"
}
```

**CRITICAL PRIVACY RULE:** `verificationAnswer` is **NEVER** returned in this endpoint, even to the claimant or admins.

**Authorization:**
- Student can only access their own claim
- Admin can access claims they are authorized to review

**To retrieve `verificationAnswer` (admins only):** Use `GET /api/admin/claims/{id}` (see Admin Claim APIs)

**Error Responses:**
- 403 FORBIDDEN — if user does not have permission
- 404 NOT FOUND — if claim not found

---

## 7. Admin Claim APIs

Admin Claim endpoints are owned by **Developer 4 (Nourin)**.

### GET ALL CLAIMS

```
GET /api/admin/claims
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "lostItemId": 10,
    "foundItemId": 20,
    "claimantUserId": 3,
    "status": "PENDING",
    "createdAt": "2026-08-21T15:00:00"
  }
]
```

**Note:** Returns claims requiring administrative review.

---

### GET CLAIM FOR REVIEW

```
GET /api/admin/claims/{id}
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 200 OK

```json
{
  "id": 1,
  "lostItemId": 10,
  "foundItemId": 20,
  "claimantUserId": 3,
  "verificationAnswer": "My student bus card",
  "status": "PENDING",
  "createdAt": "2026-08-21T15:00:00",
  "reviewedAt": null,
  "reviewedBy": null
}
```

**CRITICAL:** This is the **ONLY** API endpoint that returns `verificationAnswer`, and only to authenticated admins. Students never receive this information, even for their own claims.

---

### APPROVE CLAIM

```
PUT /api/admin/claims/{id}/approve
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Request:** (empty body or minimal data)

**Response:** 200 OK

```json
{
  "id": 1,
  "lostItemId": 10,
  "foundItemId": 20,
  "claimantUserId": 3,
  "status": "APPROVED",
  "reviewedAt": "2026-08-21T15:30:00",
  "reviewedBy": 1
}
```

**Workflow:**
```
PENDING → APPROVED
Found Item status becomes RETURNED
Notification generated to claimant
Dashboard statistics updated
```

**Important:**
- Backend performs all state transitions
- Do NOT trust status values sent by React
- Update Found Item status to RETURNED
- Generate notification for claimant
- Update dashboard return history

---

### REJECT CLAIM

```
PUT /api/admin/claims/{id}/reject
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Request:** (empty body or minimal data)

**Response:** 200 OK

```json
{
  "id": 1,
  "lostItemId": 10,
  "foundItemId": 20,
  "claimantUserId": 3,
  "status": "REJECTED",
  "reviewedAt": "2026-08-21T15:30:00",
  "reviewedBy": 1
}
```

**Workflow:**
```
PENDING → REJECTED
Found Item status remains FOUND
Notification generated to claimant
```

**Important:**
- Generate notification for claimant about rejection
- Found Item status remains FOUND and is available for other claims

---

## 8. Search APIs

Search endpoints are owned by **Developer 4 (Nourin)**.

### GENERAL SEARCH

```
GET /api/search
```

**Authentication:** AUTHENTICATED STUDENT

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | General search term (item name, description) |
| `category` | string | No | Item category (Wallet, Keys, Phone, etc.) |
| `location` | string | No | Campus location |
| `date` | date | No | Date range or specific date |
| `status` | string | No | Item status (LOST, FOUND, RETURNED) |
| `color` | string | No | Item color |
| `urgent` | boolean | No | Filter for urgent items |
| `type` | string | No | Item type (lost, found, or both) |

**Example Request:**

```
GET /api/search?q=wallet&category=Wallet&location=Library&status=LOST
```

**Response:** 200 OK

```json
{
  "lostItems": [
    {
      "id": 1,
      "itemName": "Black Wallet",
      "description": "Black leather wallet",
      "category": "Wallet",
      "color": "Black",
      "lastSeenLocation": "Library",
      "status": "LOST",
      "isUrgent": false
    }
  ],
  "foundItems": []
}
```

**Important:**
- Use existing Lost Item and Found Item data
- Do NOT create duplicate search table
- Support combining multiple filters
- Do NOT expose private claim information

---

## 9. Notification APIs

Notification endpoints are owned by **Developer 4 (Nourin)**.

### GET NOTIFICATIONS

```
GET /api/notifications
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "userId": 3,
    "message": "A possible match was found for your lost wallet",
    "type": "MATCH_FOUND",
    "isRead": false,
    "createdAt": "2026-08-21T12:00:00"
  },
  {
    "id": 2,
    "userId": 3,
    "message": "Your claim has been approved",
    "type": "CLAIM_APPROVED",
    "isRead": true,
    "createdAt": "2026-08-21T15:30:00"
  }
]
```

**Note:** Returns notifications for the authenticated user.

---

### GET UNREAD NOTIFICATIONS

```
GET /api/notifications/unread
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "userId": 3,
    "message": "A possible match was found for your lost wallet",
    "type": "MATCH_FOUND",
    "isRead": false,
    "createdAt": "2026-08-21T12:00:00"
  }
]
```

**Note:** Returns only unread notifications.

---

### MARK NOTIFICATION READ

```
PUT /api/notifications/{id}/read
```

**Authentication:** REQUIRED

**Response:** 200 OK

```json
{
  "id": 1,
  "userId": 3,
  "message": "A possible match was found for your lost wallet",
  "type": "MATCH_FOUND",
  "isRead": true,
  "createdAt": "2026-08-21T12:00:00"
}
```

**Authorization:** Only the notification owner can mark it as read.

**Error Responses:**
- 403 FORBIDDEN — if user is not owner
- 404 NOT FOUND — if notification not found

---

### Notification Types

The system generates notifications for these events:

| Type | Event |
|------|-------|
| `MATCH_FOUND` | A possible match was found for user's lost item |
| `SIMILAR_ITEM_REPORTED` | A similar item was reported |
| `ITEM_FOUND` | An item that matches user's search may have been found |
| `CLAIM_APPROVED` | User's claim has been approved by admin |
| `CLAIM_REJECTED` | User's claim has been rejected by admin |
| `ITEM_RETURNED` | User's item has been marked as returned |

---

## 10. Map API

Map endpoints are owned by **Developer 4 (Nourin)**.

The map uses:
- **Leaflet** (mapping library)
- **OpenStreetMap** (map tiles)
- Do NOT use Google Maps

### GET MAP ITEMS

```
GET /api/map/items
```

**Authentication:** AUTHENTICATED STUDENT

**Response:** 200 OK

```json
[
  {
    "id": 1,
    "type": "LOST",
    "itemName": "Black Wallet",
    "location": "Library",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "isUrgent": false
  },
  {
    "id": 2,
    "type": "FOUND",
    "itemName": "Keys",
    "location": "Canteen",
    "latitude": 12.9720,
    "longitude": 77.5950,
    "isUrgent": false
  }
]
```

**Important:**
- Return only information required for map markers
- Do NOT expose private claim information
- Do NOT expose unnecessary personal information
- Avoid exposing sensitive exact locations

**Database Integration Note:**
Latitude and longitude are stored directly in the `lost_items` and `found_items` database tables:
- `lost_items.latitude` DECIMAL(10,7)
- `lost_items.longitude` DECIMAL(10,7)
- `found_items.latitude` DECIMAL(10,7)
- `found_items.longitude` DECIMAL(10,7)

Do NOT create a separate map database or table. The map API uses existing Lost/Found item records.

---

## 11. Admin Item APIs

Admin Item endpoints are owned by **Developer 4 (Nourin)**.

### GET ALL LOST ITEMS (Admin)

```
GET /api/admin/lost-items
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 200 OK

Returns array of all LostItemResponse objects (same format as student endpoint).

---

### GET ALL FOUND ITEMS (Admin)

```
GET /api/admin/found-items
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 200 OK

Returns array of all FoundItemResponse objects.

---

### REMOVE FAKE LOST REPORT

```
DELETE /api/admin/lost-items/{id}
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 204 NO CONTENT

**Important:** Do not bypass authorization. Only admins can remove fake reports.

---

### REMOVE FAKE FOUND REPORT

```
DELETE /api/admin/found-items/{id}
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 204 NO CONTENT

---

## 12. Admin Dashboard

Admin Dashboard endpoint is owned by **Developer 4 (Nourin)**.

### GET DASHBOARD STATISTICS

```
GET /api/admin/dashboard
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 200 OK

```json
{
  "totalLostItems": 42,
  "totalFoundItems": 28,
  "itemsReturned": 15,
  "pendingClaims": 5,
  "mostCommonLocations": [
    {
      "location": "Library",
      "count": 12
    },
    {
      "location": "Canteen",
      "count": 8
    }
  ]
}
```

**Important:**
- Do NOT hard-code these values
- All statistics must be calculated dynamically from the database
- Exclude archived items from counts as per business logic
- Locations should be sorted by frequency

---

## 13. Return History

Return History endpoint is owned by **Developer 4 (Nourin)**.

### GET RETURN HISTORY

```
GET /api/admin/return-history
```

**Authentication:** REQUIRED

**Role:** ADMIN ONLY

**Response:** 200 OK

```json
{
  "bagsReturned": 5,
  "phonesReturned": 8,
  "idCardsReturned": 12,
  "walletsReturned": 15,
  "keysReturned": 7,
  "docsReturned": 3,
  "othersReturned": 4
}
```

**Important:**
- Values must come from actual database records (approved and completed claims)
- Do NOT hard-code statistics
- Calculate from items marked as RETURNED

---

## API Ownership Matrix

| Developer | Module | Endpoints |
|-----------|--------|-----------|
| **Developer 1 (Me10x)** | User + Authentication + Profile | `/api/auth/*`, `/api/users/*` |
| **Developer 2 (Nived)** | Lost Item Management | `/api/lost-items/*` |
| **Developer 3 (Sahla)** | Found Items + Smart Matching + Claims | `/api/found-items/*`, `/api/matches/*`, `/api/claims/*` |
| **Developer 4 (Nourin)** | Search + Notifications + Map + Admin | `/api/search/*`, `/api/notifications/*`, `/api/map/*`, `/api/admin/*` |

---

## Shared Integration Rules

### Rule 1: Exact API Paths

All developers MUST use these exact API paths unless the team explicitly changes this document.

**Do NOT create alternative endpoint names.**

For example, do NOT create:
- `/api/lost` (instead of `/api/lost-items`)
- `/api/items/lost` (instead of `/api/lost-items`)
- `/api/lostReports` (instead of `/api/lost-items`)

Use the shared API contract.

### Rule 2: Ownership and Authentication

Ownership must ALWAYS be determined by the authenticated JWT.

**Examples:**

Creating Lost Item:
```
JWT → extract user ID → LostItem.user_id = user ID
```

Creating Found Item:
```
JWT → extract user ID → FoundItem.user_id = user ID
```

Creating Claim:
```
JWT → extract user ID → Claim.claimant_user_id = user ID
```

**CRITICAL:** Do NOT trust ownership IDs sent from the frontend. Always extract from JWT.

### Rule 3: No Overlapping Endpoints

Each developer owns specific endpoints. Do NOT create overlapping or duplicate endpoints.

For example:
- Only Developer 3 creates `/api/claims/*`
- Only Developer 4 creates `/api/admin/claims/*`

### Rule 4: Consistent Data Types

All developers must use consistent data types for shared entities:

- `id`: BIGINT (use Long in Java)
- `status`: VARCHAR(50) String (enum in Java)
- `createdAt` / `updatedAt`: DATETIME (use LocalDateTime in Java)
- `score` fields: DECIMAL(5,2) (use BigDecimal in Java)

### Rule 5: Validation Must Be Backend

Frontend validation is helpful but NOT sufficient. Backend must ALWAYS validate:

- Required fields
- Data types
- Authorization
- Business rules (e.g., duplicate check)
- Foreign key relationships

Do NOT skip validation assuming frontend checks.

---

## Ownership and Authentication Rules

### Rule 1: JWT-Based Ownership

All create operations must extract user ID from the authenticated JWT:

```
@PostMapping("/api/lost-items")
public ResponseEntity<?> createLostItem(
    @RequestBody CreateLostItemRequest request,
    Authentication authentication  // Spring Security provides this
) {
    // Extract user from authentication
    User authenticatedUser = (User) authentication.getPrincipal();
    Long userId = authenticatedUser.getId();
    
    // Use userId from JWT, NOT from request body
    lostItem.setUserId(userId);
    // ... rest of logic
}
```

### Rule 2: Authorization on Protected Endpoints

Protected endpoints must check authorization:

```
- If resource belongs to authenticated user, allow
- If authenticated user is ADMIN, allow (if admin is authorized for that resource)
- Otherwise, return 403 FORBIDDEN
```

### Rule 3: Private Information Must Be Excluded

Never include in student-facing responses:
- `verification_answer` from claims (except in admin review context)
- `password_hash`
- Other sensitive fields

---

## DTO (Data Transfer Object) Rules

### Request DTOs

Used for incoming API requests.

**Example:**

```java
public class CreateLostItemRequest {
    private String itemName;
    private String imageUrl;
    private String description;
    private String category;
    private String color;
    private LocalDateTime lostDateTime;
    private String lastSeenLocation;
    private Boolean isUrgent;
    private LocalDateTime expiryDate;
}
```

### Response DTOs

Used for outgoing API responses.

**Example:**

```java
public class LostItemResponse {
    private Long id;
    private Long userId;
    private String itemName;
    private String imageUrl;
    private String description;
    private String category;
    private String color;
    private LocalDateTime lostDateTime;
    private String lastSeenLocation;
    private String status;
    private Boolean isUrgent;
    private LocalDateTime expiryDate;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Important

- Never expose JPA entities directly from controllers
- Map entities to DTOs before returning
- Exclude sensitive fields from student-facing DTOs
- Use appropriate DTOs for admin vs. student responses

---

## Pagination

**Current Status:** Not required for initial implementation.

**Future Addition:** If pagination becomes necessary, document the exact format before implementation.

**Suggested Format (when needed):**

```json
{
  "content": [...],
  "totalPages": 5,
  "currentPage": 1,
  "pageSize": 20,
  "totalElements": 100
}
```

---

## API Versioning

**Current Status:** Do NOT add version numbers.

Use:
```
/api/lost-items
```

NOT:
```
/api/v1/lost-items
```

**Exception:** Only add versioning if the entire team explicitly decides otherwise.

---

## Documentation Requirements Checklist

This API contract document includes:

- ✅ API overview and general rules
- ✅ Authentication and authorization
- ✅ Role definitions (STUDENT, ADMIN)
- ✅ HTTP status codes
- ✅ Standard error response format
- ✅ All 13 endpoint groups:
  1. Authentication (register, login)
  2. User/Profile (get, update)
  3. Lost Items (CRUD)
  4. Found Items (CRUD)
  5. Smart Matches (rule-based scoring)
  6. Claims (student submission)
  7. Admin Claims (review workflow)
  8. Search (multi-filter)
  9. Notifications (real-time events)
  10. Map (Leaflet + OpenStreetMap)
  11. Admin Items (management)
  12. Dashboard (statistics)
  13. Return History (stats)
- ✅ HTTP method and URL for each endpoint
- ✅ Authentication requirement (PUBLIC/REQUIRED)
- ✅ Required role for each endpoint
- ✅ Request/Response JSON examples
- ✅ Important validation rules
- ✅ Ownership and authentication rules
- ✅ Module ownership by developer
- ✅ Privacy and security rules
- ✅ Shared integration rules
- ✅ DTO requirements
- ✅ Pagination guidelines
- ✅ API versioning guidelines

**No additional APIs are defined beyond this contract.**

---

## Notes for Implementation

### For All Developers

- Use DTOs for all request/response
- Implement backend authorization on every protected endpoint
- Validate ownership using JWT, NOT frontend input
- Never expose sensitive information
- Return appropriate HTTP status codes
- Use consistent error response format
- Test endpoints thoroughly before merging

### For Developer 1 (Me10x)

- Implement registration and login with JWT token generation
- Use BCrypt for password hashing (never store plaintext)
- Provide `/api/users/me` for current user endpoint
- Implement profile picture handling (store Cloudinary URL only)

### For Developer 2 (Nived)

- Implement Lost Item CRUD
- Handle auto-expiry and archiving
- Store item images on Cloudinary (URL only in DB)
- Manage urgent flag and status transitions

### For Developer 3 (Sahla)

- Implement Found Item CRUD
- Create Smart Match algorithm (rule-based, no ML/AI)
- Implement Claims with private verification
- Never expose verification_answer to students
- Handle status transitions for returned items

### For Developer 4 (Nourin)

- Implement Search and Filters
- Create Notification system (database-backed + optional WebSocket)
- Implement Map using Leaflet + OpenStreetMap
- Create Admin Panel with dashboard
- Generate statistics dynamically from database
- Handle Return History tracking
