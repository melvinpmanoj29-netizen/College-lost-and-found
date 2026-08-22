# College Lost & Found System — Project Specification

## 1. Project Title

**College Lost & Found System**

---

## 2. Project Purpose

The system is a web application designed for a college campus.

- Students can report items they have lost or found
- Students can search for lost/found items and identify possible matches
- If a student believes a found item belongs to them, they can submit a claim with private identifying information
- An administrator verifies the claim before the item is marked as returned

**Goal:** Make the college's lost and found process organized, searchable, secure and easier to manage.

---

## 3. Target Users

The system has two roles:

| Role | Purpose |
|------|---------|
| **Student** | Report, search, and claim items |
| **Administrator** | Manage reports, claims, users, and the overall system |

---

## 4. Student Features

Students must be able to:

- Register and create an account
- Login and logout
- View and edit their profile
- Upload/update profile picture
- Report a lost item
- Report a found item
- View lost items
- View found items
- View item details
- Edit their own reports
- Delete their own reports where permitted
- Mark a lost item as urgent
- Search for items
- Filter items by various criteria
- View possible matches
- Receive notifications
- Claim a found item
- Provide private identifying information during a claim
- View their claims
- View the status of their claims
- View their returned items/history where applicable

---

## 5. User Registration

### Registration Fields

The system must collect:

- Student name
- Roll number
- Class
- Email (if included in final design)
- Password

### Registration Validation

The system must:

- Validate all required fields
- Prevent duplicate accounts
- Hash passwords securely using **BCrypt**
- Never store plaintext passwords

### Authentication Method

- Use **JWT (JSON Web Tokens)** for authentication
- Use **BCrypt** for password hashing

---

## 6. Login and Authentication

### Requirements

- Students and administrators must be able to login
- Backend must authenticate users securely

### Technology Stack

- Spring Security
- JWT (JSON Web Tokens)
- BCrypt

### Authorization

- The authenticated user's identity must be available to protected backend APIs
- Role-based authorization must be implemented
- Students must NOT be able to access administrator-only APIs

---

## 7. User Profile

### Profile Attributes

A student profile should contain:

- Name
- Roll number
- Class
- Email (if used)
- Profile picture
- Role (where appropriate)

### Profile Management

- Students should be able to edit their own profile
- Students must NOT be able to modify another user's profile
- Profile images will use **Cloudinary**

---

## 8. Report Lost Item

### Report Fields

A student can report an item they lost. The report should contain:

- Item name
- Item image
- Description
- Category
- Colour
- Date and time lost
- Last seen location
- Owner information (automatically associated with logged-in user)
- Status
- Urgent flag
- Expiry/archive information

### Initial Status

Status: **LOST**

### Key Rule

The owner should be associated automatically with the logged-in user. The user must NOT manually choose another user's ID as the owner.

---

## 9. Urgent Lost Item

### Purpose

Students can mark important lost items as urgent.

### Examples

- College ID
- Keys
- Important documents
- Other critical personal items

### Display

- Urgent items should be visually highlighted
- Urgency should be an attribute of the Lost Item (not a separate item type)

---

## 10. Auto-Expiry

### Mechanism

Lost Item reports should have an expiry mechanism. If an item remains unresolved for a configured period:

- It can be **archived** (not permanently deleted)
- It should NOT be automatically deleted

### Historical Data

- The system should retain historical information for statistics and reporting
- The final expiry duration should be configurable

---

## 11. Report Found Item

### Report Fields

A student can report an item they found. The report should contain:

- Item name
- Item image
- Description
- Category
- Colour
- Found location
- Date and time found
- Finder information (automatically associated with logged-in user)
- Status

### Initial Status

Status: **FOUND**

### Key Rule

The finder should automatically be associated with the logged-in user.

---

## 12. Search and Filter

### Search Capabilities

Students should be able to search Lost and Found reports using:

- Item name
- Category
- Location
- Date
- Status
- Colour (where appropriate)
- Urgent status (where appropriate)

### Advanced Filtering

Users should be able to combine multiple filters.

**Example:**
```
Search: Wallet
Category: Wallet
Location: Library
Status: Lost
```

### Data Source

The search must use existing Lost Item and Found Item data. Do NOT create duplicate search databases.

---

## 13. Smart Matching

### Purpose

The system should provide a Smart Match feature to suggest possible matches between lost and found items.

### Approach

- Does NOT require machine learning or external AI API
- Uses a rule-based scoring algorithm

### Comparison Criteria

Compare the following attributes:

| Criteria | Points |
|----------|--------|
| Category | 30 |
| Colour | 20 |
| Location | 20 |
| Date | 10 |
| Description | 20 |
| **Total** | **100** |

*Note: The exact score may be adjusted during implementation if the team agrees.*

### Example

```
Lost item:     Black leather wallet
Found item:    Black leather wallet
Location:      Library

Result:        Possible Match Found (with match score)
```

### Explainability

The matching system should be explainable during a college viva.

---

## 14. Claim Item

### Workflow

If a student believes a found item belongs to them, they can submit a claim.

### Information Structure

The student must provide identifying information. Some information must remain **private** and not publicly displayed.

### Example

**Public Information:**
```
Black wallet found near Library.
```

**Private Verification (for admin verification only):**
```
"What unique item was inside the wallet?"
```

The claimant provides the answer. The administrator uses this information to verify the claim.

---

## 15. Claim Status

### Status Values

Claims should have the following statuses:

- **PENDING** — Initial state after submission
- **APPROVED** — Admin verifies claim is valid
- **REJECTED** — Admin rejects claim

### Workflow Diagram

```
Student submits claim
         ↓
      PENDING
         ↓
  Administrator reviews
         ↓
  APPROVED / REJECTED
```

### Result of Approval

If approved:
```
Found Item → RETURNED
```

### Private Information Protection

Private verification information must NEVER appear in:
- Public search results
- Public item APIs
- Any frontend displayed to other students

---

## 16. Notifications

### Events That Generate Notifications

The system should notify users when important events occur:

- A possible match is found
- A similar item is reported
- Their item may have been found
- Their claim is approved
- Their claim is rejected
- Their item is marked as returned

### Notification Features

- Notifications should be stored so users can view notification history
- Real-time notifications may use **Spring WebSocket**
- If real-time functionality becomes unstable, a reliable database-backed notification system takes priority

---

## 17. Map

### Purpose

The system should provide a Lost & Found map displaying approximate locations where items were lost/found.

### Technologies

- **Leaflet** (mapping library)
- **OpenStreetMap** (map tiles)
- Do NOT use Google Maps

### Locations Displayed

Examples of campus locations:
- Library
- Canteen
- Main Block
- Ground
- Parking area
- Hostel

### Privacy Consideration

The system should avoid unnecessarily exposing sensitive exact locations.

---

## 18. Admin Panel

### Purpose

Administrators should have a dedicated admin panel.

### Admin Capabilities

Admins can:

- View all lost items
- View all found items
- View all claims
- Approve claims
- Reject claims
- Remove fake reports
- Mark items as returned
- View dashboard statistics
- View return history

### Security

All administrator APIs must be protected by backend **role-based authorization**. The frontend must NOT be the only security layer.

---

## 19. Admin Dashboard

### Statistics Displayed

The dashboard should display:

- Total lost items
- Total found items
- Items returned
- Pending claims
- Most common locations

### Implementation Requirements

- Statistics must be calculated dynamically from the database
- Do NOT hard-code statistics
- Charts can be used to make the dashboard easier to understand
- Use **Chart.js** for visualization

---

## 20. Return History

### Purpose

The system should maintain return history.

### Statistics

The dashboard can show statistics such as:

- Bags returned
- Phones returned
- ID cards returned
- Wallets returned
- Keys returned

### Implementation

These statistics must be calculated from actual returned records. Do NOT hard-code data.

---

## 21. Item Lifecycle

### Lost Item Lifecycle

```
LOST
  ↓
Possible Match
  ↓
Claim
  ↓
Admin Verification
  ↓
RETURNED
```

### Found Item Lifecycle

```
FOUND
  ↓
Possible Match
  ↓
Claim
  ↓
Admin Verification
  ↓
RETURNED
```

### Unresolved Items

Unresolved Lost Items may eventually become:

```
ARCHIVED
```

Archived records should remain available for appropriate history and statistics.

---

## 22. Image Storage

### Approach

- Item and profile images should use **Cloudinary**
- Do NOT store large image files directly inside MySQL
- Store the image URL/reference in the database

### Flow

```
React
  ↓
Cloudinary
  ↓
Image URL
  ↓
Spring Boot
  ↓
MySQL
```

---

## 23. Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Bootstrap 5
- Bootstrap Icons
- React Router
- Axios

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- JWT
- BCrypt
- Jakarta Bean Validation
- Swagger/OpenAPI

### Database

- MySQL 8
- MySQL Workbench

### Other Technologies

- Cloudinary (Free Tier)
- Leaflet
- OpenStreetMap
- Spring WebSocket
- Chart.js
- Git
- GitHub

---

## 24. Architecture

### Architecture Style

Use a **simple layered monolithic architecture**.

### Frontend Layer

```
React
  ↓
Axios
  ↓
REST API
```

### Backend Layer

```
Controller
  ↓
Service
  ↓
Repository
  ↓
JPA/Hibernate
  ↓
MySQL
```

### Constraints

- Do NOT use microservices
- Do NOT introduce unnecessary architectural complexity

---

## 25. Team Module Division

### Developer 1 — Me10x

**Module: USER + AUTHENTICATION + PROFILE**

Responsibilities:

- Registration
- Login
- JWT implementation
- BCrypt implementation
- Roles
- Authorization
- Profile management
- Profile picture upload
- Current authenticated user endpoint

### Developer 2 — Nived

**Module: LOST ITEM MANAGEMENT**

Responsibilities:

- Lost Item CRUD operations
- Lost Item image upload
- Owner association
- Urgent Lost Items feature
- Auto-expiry mechanism
- Archive functionality

### Developer 3 — Sahla

**Module: FOUND ITEMS + SMART MATCHING + CLAIMS**

Responsibilities:

- Found Item CRUD operations
- Found Item image upload
- Smart Match algorithm
- Match score calculation
- Claims management
- Private verification handling
- Claim workflow implementation
- Returned status integration

### Developer 4 — Nourin

**Module: SEARCH + NOTIFICATIONS + MAP + ADMIN**

Responsibilities:

- Search functionality
- Filters implementation
- Notifications management
- WebSocket integration for real-time notifications
- Map display
- Admin dashboard development
- Admin item management
- Admin claims management
- Fake report removal
- Return history tracking
- Statistics calculation
- Chart integration

---

## 26. Collaboration Principles

### This is ONE Shared Project

Developers must:

- Use the same database
- Use the same entity names
- Use the same API contracts
- Use the same technology stack
- Use Git branches
- Create Pull Requests
- Test before merging

### What Developers Must NOT Do

- Create separate versions of shared entities
- Create separate databases
- Change the technology stack independently
- Rewrite another developer's module
- Rename shared fields without agreement
- Rename shared APIs without agreement
- Push unfinished work directly to main

---

## 27. Project Goal

### End-to-End Workflow

The final application should provide a complete end-to-end college Lost & Found workflow:

```
Student registers
  ↓
Student logs in
  ↓
Student reports lost item
  ↓
Another student reports found item
  ↓
System compares reports
  ↓
Possible match is generated
  ↓
Owner receives notification
  ↓
Owner submits claim
  ↓
Admin verifies claim
  ↓
Admin approves/rejects
  ↓
Item becomes returned if approved
  ↓
Notification is generated
  ↓
Dashboard and return history update
```

### Success Criteria

The final project must be:

- Stable and reliable
- Understandable and well-documented
- Maintainable and following best practices
- Suitable for a college project demonstration and viva
