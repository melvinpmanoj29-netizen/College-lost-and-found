    # College Lost & Found System — Database Schema

    ## Database Overview

    This document defines the complete database structure for the College Lost & Found System. There is **ONE shared database** for the entire application used by all developers.

    **Database Management System:** MySQL 8

    **Database Name:** `lost_and_found`

    ---

    ## Database Structure

    ### Entity-Relationship Diagram

    ```mermaid
    erDiagram
        users ||--o{ lost_items : reports
        users ||--o{ found_items : reports
        users ||--o{ claims : submits
        users ||--o{ notifications : receives
        users ||--o{ claims : reviews
        lost_items ||--o{ matches : participates
        found_items ||--o{ matches : participates
        lost_items ||--o{ claims : related_to
        found_items ||--o{ claims : related_to

        users {
            bigint id PK
            string student_name
            string roll_number UK
            string class_name
            string email UK
            string password_hash
            string profile_image_url
            string role
            datetime created_at
            datetime updated_at
        }

        lost_items {
            bigint id PK
            bigint user_id FK
            string item_name
            string image_url
            text description
            string category
            string color
            datetime lost_date_time
            string last_seen_location
        decimal latitude
        decimal longitude
        string status
        boolean is_urgent
        datetime expiry_date
        boolean is_archived
        datetime created_at
        datetime updated_at
    }

    found_items {
        bigint id PK
        bigint user_id FK
        string item_name
        string image_url
        text description
        string category
        string color
        datetime found_date_time
        string found_location
        decimal latitude
        decimal longitude
        string status
        datetime created_at
        datetime updated_at
    }

    matches {
        bigint id PK
        bigint lost_item_id FK
        bigint found_item_id FK
        decimal match_score
        string match_status
        datetime created_at
    }

        notifications {
            bigint id PK
            bigint user_id FK
            string message
            string type
            boolean is_read
            datetime created_at
        }
    ```

    ---

    ## Table Definitions

    ### TABLE 1 — users

    **Purpose:** Store user account information for students and administrators.

    | Column | Data Type | Constraints | Description |
    |--------|-----------|-------------|-------------|
    | `id` | BIGINT | PK, AUTO_INCREMENT | Unique user identifier |
    | `student_name` | VARCHAR(100) | NOT NULL | Full name of the student |
    | `roll_number` | VARCHAR(50) | NOT NULL, UNIQUE | Student's unique roll number |
    | `class_name` | VARCHAR(100) | NOT NULL | Class/year of student |
    | `email` | VARCHAR(150) | UNIQUE, NOT NULL | Student email address |
    | `password_hash` | VARCHAR(255) | NOT NULL | BCrypt hashed password (NEVER plaintext) |
    | `profile_image_url` | VARCHAR(500) | NULLABLE | Cloudinary URL to profile picture |
    | `role` | VARCHAR(50) | NOT NULL | User role determining permissions (values: STUDENT, ADMIN) |
    | `created_at` | DATETIME | NOT NULL | Account creation timestamp |
    | `updated_at` | DATETIME | NOT NULL | Last profile update timestamp |

    **Security:** Passwords must NEVER be stored as plaintext. Only `password_hash` is persisted.

    ---

    ### TABLE 2 — lost_items

    **Purpose:** Store reports of items lost by students.

    | Column | Data Type | Constraints | Description |
    |--------|-----------|-------------|-------------|
    | `id` | BIGINT | PK, AUTO_INCREMENT | Unique lost item identifier |
    | `user_id` | BIGINT | NOT NULL, FK → users.id | User who reported the lost item |
    | `item_name` | VARCHAR(150) | NOT NULL | Name of the lost item |
    | `image_url` | VARCHAR(500) | NULLABLE | Cloudinary URL to item photo |
    | `description` | TEXT | NOT NULL | Detailed description of the item |
    | `category` | VARCHAR(100) | NOT NULL | Category (e.g., Wallet, Keys, ID Card, Phone) |
    | `color` | VARCHAR(50) | NULLABLE | Color of the item |
    | `lost_date_time` | DATETIME | NOT NULL | Date and time item was lost |
    | `last_seen_location` | VARCHAR(255) | NOT NULL | Last known location on campus |
| `latitude` | DECIMAL(10,7) | NULLABLE | Latitude coordinate for map display |
| `longitude` | DECIMAL(10,7) | NULLABLE | Longitude coordinate for map display |
| `status` | VARCHAR(50) | NOT NULL | Status of the lost item (see Status Values) |
| `is_urgent` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether item is marked as urgent |
| `expiry_date` | DATETIME | NULLABLE | Date after which item may be archived |
| `is_archived` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether record is archived |
| `created_at` | DATETIME | NOT NULL | Report creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Last update timestamp |

**Lifecycle:** LOST → (Possible Match) → RETURNED or ARCHIVED

**Map Integration:** Coordinates (`latitude`, `longitude`) are used by the `/api/map/items` endpoint. Do NOT create a separate map table; the map API queries Lost/Found items directly.

---

### TABLE 3 — found_items

**Purpose:** Store reports of items found by students.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique found item identifier |
| `user_id` | BIGINT | NOT NULL, FK → users.id | User who found and reported the item |
| `item_name` | VARCHAR(150) | NOT NULL | Name of the found item |
| `image_url` | VARCHAR(500) | NULLABLE | Cloudinary URL to item photo |
| `description` | TEXT | NOT NULL | Detailed description of the item |
| `category` | VARCHAR(100) | NOT NULL | Category (e.g., Wallet, Keys, ID Card, Phone) |
| `color` | VARCHAR(50) | NULLABLE | Color of the item |
| `found_date_time` | DATETIME | NOT NULL | Date and time item was found |
| `found_location` | VARCHAR(255) | NOT NULL | Location on campus where item was found |
| `latitude` | DECIMAL(10,7) | NULLABLE | Latitude coordinate for map display |
| `longitude` | DECIMAL(10,7) | NULLABLE | Longitude coordinate for map display |
| `status` | VARCHAR(50) | NOT NULL | Status of the found item (see Status Values) |
| `created_at` | DATETIME | NOT NULL | Report creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Last update timestamp |

**Lifecycle:** FOUND → (Possible Match) → RETURNED

**Map Integration:** Coordinates (`latitude`, `longitude`) are used by the `/api/map/items` endpoint. Do NOT create a separate map table; the map API queries Lost/Found items directly.

---

### TABLE 4 — matches

**Purpose:** Store possible matches between lost and found items identified by the Smart Match algorithm.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique match identifier |
| `lost_item_id` | BIGINT | NOT NULL, FK → lost_items.id | Reference to lost item |
| `found_item_id` | BIGINT | NOT NULL, FK → found_items.id | Reference to found item |
| `match_score` | DECIMAL(5,2) | NOT NULL | Match score out of 100.00 |
| `match_status` | VARCHAR(50) | NOT NULL | Status of the match (see Status Values) |
| `created_at` | DATETIME | NOT NULL | Match generation timestamp |
| **UNIQUE** | **(lost_item_id, found_item_id)** | **Ensure one match per lost-found pair** |

**Purpose:** A single match record represents ONE possible relationship between ONE lost item and ONE found item.

**Score:** Based on category (30), colour (20), location (20), date (10), and description (20) = total 100 points.

    ---

    ### TABLE 5 — claims

    **Purpose:** Store claims submitted by students who believe a found item belongs to them.

    | Column | Data Type | Constraints | Description |
    |--------|-----------|-------------|-------------|
    | `id` | BIGINT | PK, AUTO_INCREMENT | Unique claim identifier |
    | `lost_item_id` | BIGINT | NOT NULL, FK → lost_items.id | Lost item the claim is about |
    | `found_item_id` | BIGINT | NOT NULL, FK → found_items.id | Found item being claimed |
    | `claimant_user_id` | BIGINT | NOT NULL, FK → users.id | User submitting the claim |
    | `verification_answer` | TEXT | NOT NULL | **PRIVATE** answer to verification question |
    | `status` | VARCHAR(50) | NOT NULL | Claim status (see Status Values) |
    | `created_at` | DATETIME | NOT NULL | Claim submission timestamp |
    | `reviewed_at` | DATETIME | NULLABLE | Timestamp when admin reviewed claim |
    | `reviewed_by` | BIGINT | NULLABLE, FK → users.id | Admin who reviewed the claim |
    | **UNIQUE** | **(lost_item_id, found_item_id, claimant_user_id)** | **One claim per user per lost-found pair** |

    **Important Note:** The claim table contains both `lost_item_id` and `found_item_id`. The backend must validate that the claim refers to a valid Lost/Found relationship (e.g., checking if a match exists or validating manually).

    **CRITICAL PRIVACY RULE:** `verification_answer` is private and must NEVER be exposed in:
    - Public Lost Item APIs
    - Public Found Item APIs
    - Search APIs
    - Map APIs
    - Match APIs
    - Any frontend visible to students

    **Workflow:**
    ```
    PENDING → APPROVED → Found Item status becomes RETURNED
            → REJECTED
    ```

    ---

    ### TABLE 6 — notifications

    **Purpose:** Store notifications sent to users about important events.

    | Column | Data Type | Constraints | Description |
    |--------|-----------|-------------|-------------|
    | `id` | BIGINT | PK, AUTO_INCREMENT | Unique notification identifier |
    | `user_id` | BIGINT | NOT NULL, FK → users.id | User receiving the notification |
    | `message` | VARCHAR(500) | NOT NULL | Notification message text |
    | `type` | VARCHAR(100) | NOT NULL | Type of notification (e.g., MATCH_FOUND, CLAIM_APPROVED, CLAIM_REJECTED) |
    | `is_read` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether user has read the notification |
    | `created_at` | DATETIME | NOT NULL | Notification creation timestamp |

    **Notification Types:**
    - MATCH_FOUND — A possible match was found
    - SIMILAR_ITEM_REPORTED — A similar item was reported
    - ITEM_FOUND — An item may have been found
    - CLAIM_APPROVED — Claim has been approved by admin
    - CLAIM_REJECTED — Claim has been rejected by admin
    - ITEM_RETURNED — Item marked as returned

    ---

    ## Status Values

    ### Lost Item Status

    | Status | Description |
    |--------|-------------|
    | LOST | Item reported as lost, actively being searched for |
    | RETURNED | Item has been returned to owner |
    | ARCHIVED | Item remains unresolved after expiry period |

    ### Found Item Status

    | Status | Description |
    |--------|-------------|
    | FOUND | Item reported as found, awaiting claim or identification |
    | RETURNED | Item has been returned to owner |

    ### Match Status

    | Status | Description |
    |--------|-------------|
    | POSSIBLE | Initial match suggestion by Smart Match algorithm |
    | REVIEWED | Admin or user has reviewed the match |
    | CLAIMED | A claim has been submitted for this match |
    | RESOLVED | Match has been fully resolved (item returned) |

    ### Claim Status

    | Status | Description |
    |--------|-------------|
    | PENDING | Claim submitted, awaiting admin verification |
    | APPROVED | Admin verified claim and marked item as returned |
    | REJECTED | Admin rejected claim; item remains in circulation |

    ---

    ## Relationships

    ### One-to-Many Relationships

    | From | To | Description |
    |------|-----|-------------|
    | `users` | `lost_items` | One user can report many lost items |
    | `users` | `found_items` | One user can report many found items |
    | `users` | `claims` | One user can submit many claims |
    | `users` | `notifications` | One user can receive many notifications |
    | `lost_items` | `matches` | One lost item can have many possible matches |
    | `found_items` | `matches` | One found item can have many possible matches |
    | `lost_items` | `claims` | One lost item can have many claims |
    | `found_items` | `claims` | One found item can have many claims |

    ### Administrator Review Relationship

    | Relationship | Description |
    |--------------|-------------|
    | `users` → `claims.reviewed_by` | An admin can review many claims |

    ---

    ## Keys and Constraints

    ### Primary Keys

    All tables have a `BIGINT id` column as the primary key with AUTO_INCREMENT.

    ### Unique Constraints

    | Table | Column | Purpose |
    |-------|--------|---------|
    | `users` | `roll_number` | Ensures one account per student |
    | `users` | `email` | Ensures email uniqueness for authentication |

    ### Foreign Keys

    | Child Table | Column | Parent Table | Parent Column | Behavior |
    |-------------|--------|--------------|---------------|----------|
    | lost_items | user_id | users | id | RESTRICT (preserve historical reports) |
    | found_items | user_id | users | id | RESTRICT (preserve historical reports) |
    | claims | lost_item_id | lost_items | id | Restrict (preserve claim history) |
    | claims | found_item_id | found_items | id | Restrict (preserve claim history) |
    | claims | claimant_user_id | users | id | Restrict (preserve claim history) |
    | claims | reviewed_by | users | id | Set NULL if admin deleted (preserve record) |
    | matches | lost_item_id | lost_items | id | RESTRICT (preserve match history) |
    | matches | found_item_id | found_items | id | RESTRICT (preserve match history) |
    | notifications | user_id | users | id | RESTRICT (preserve notification history) |

    ---

    ## Indexes

    ### Recommended Indexes for Query Performance

    **lost_items table:**
    ```sql
    INDEX idx_user_id (user_id)
    INDEX idx_category (category)
    INDEX idx_status (status)
    INDEX idx_last_seen_location (last_seen_location)
    INDEX idx_lost_date_time (lost_date_time)
    INDEX idx_is_urgent (is_urgent)
    INDEX idx_is_archived (is_archived)
    ```

    **found_items table:**
    ```sql
    INDEX idx_user_id (user_id)
    INDEX idx_category (category)
    INDEX idx_status (status)
    INDEX idx_found_location (found_location)
    INDEX idx_found_date_time (found_date_time)
    ```

    **matches table:**
    ```sql
    INDEX idx_lost_item_id (lost_item_id)
    INDEX idx_found_item_id (found_item_id)
    ```

    **claims table:**
    ```sql
    INDEX idx_lost_item_id (lost_item_id)
    INDEX idx_found_item_id (found_item_id)
    INDEX idx_claimant_user_id (claimant_user_id)
    INDEX idx_status (status)
    ```

    **notifications table:**
    ```sql
    INDEX idx_user_id (user_id)
    INDEX idx_is_read (is_read)
    ```

    ---

    ## Data Privacy and Security

    ### What Must NOT Be Stored

    - ❌ Plaintext passwords (use BCrypt hashing only)
    - ❌ Unnecessary personal information beyond college workflow
    - ❌ Credit card or payment information
    - ❌ Sensitive government ID details

    ### What Must Be Protected

    - ✅ `users.password_hash` — Never expose, even in logs
    - ✅ `claims.verification_answer` — Strictly private, admin-only
    - ✅ Avoid exposing exact personal locations unnecessarily

    ### Private Information Rules

    The `verification_answer` field in the claims table must:

    - Never be retrieved by the search API
    - Never be returned by the get-all-lost-items endpoint
    - Never be returned by the get-all-found-items endpoint
    - Never be displayed on the map
    - Never be included in match suggestions
    - Only be visible to administrators reviewing the claim
    - Never be logged in application output

    ---

    ## Delete and Cascade Policy

    ### Key Principles

    Do NOT blindly use CASCADE DELETE everywhere.

    Important historical records should be preserved to maintain data integrity and allow for:
    - Statistics and reporting
    - Historical analysis
    - Auditing

    ### Specific Rules

    | Scenario | Policy | Reason |
    |----------|--------|--------|
    | User deletion | Consider preserving reports; do not auto-delete items or claims | Historical data integrity |
    | Lost item deletion | Only if permitted by authorization rules; preserve if marked as returned | Return history tracking |
    | Found item deletion | Only if permitted by authorization rules; preserve if marked as returned | Return history tracking |
    | Claim deletion | Prevent deletion after review; preserve reviewed claims | Audit trail |
    | Match deletion | Do not cascade; preserve match history for analysis | Analytics |

    ### Application-Level Rules

    - Admins can remove fake/duplicate reports through application logic
    - When items are archived, retain records for historical analysis
    - When users are deleted, consider archiving their data instead of deleting

    ---

    ## Design Principles

    ### Single Source of Truth

    There is **ONE shared database** for the entire application.

    There must be **ONE definition** of each entity:

    - `users`
    - `lost_items`
    - `found_items`
    - `matches`
    - `claims`
    - `notifications`

    **Developers must NOT:**
    - Create duplicate tables for individual modules
    - Rename fields without team agreement
    - Add unnecessary tables

    ### Simplicity and Viva-Readiness

    The schema is simple enough to explain in a college viva:

    ```
    User
    ├── Reports Lost Items
    ├── Reports Found Items
    ├── Submits Claims
    └── Receives Notifications

    Lost Item
    └── Generates Matches
    └── Receives Claims

    Found Item
    └── Generates Matches
    └── Receives Claims

    Match
    └── Connects Lost + Found Items (using Smart Score)

    Claim
    └── Links to Lost Item, Found Item, and Claimant
    └── Admin reviews and approves/rejects
    ```

    ---

    ## Notes for Implementation

    ### For Developer 1 (Me10x) — User + Authentication + Profile

    - Create `users` table with proper BCrypt password storage
    - Implement role-based authorization
    - Provide current authenticated user endpoint
    - Handle profile image storage via Cloudinary (store URL only)

    ### For Developer 2 (Nived) — Lost Item Management

    - Create `lost_items` table
    - Implement auto-expiry and archiving logic
    - Handle image upload to Cloudinary
    - Manage urgent flag and status transitions
    - Preserve historical records during archiving

    ### For Developer 3 (Sahla) — Found Items + Smart Matching + Claims

    - Create `found_items` table
    - Implement `matches` table and Smart Match scoring (rule-based)
    - Create `claims` table with private verification handling
    - Never expose `verification_answer` in public APIs
    - Handle status transitions for returned items

    ### For Developer 4 (Nourin) — Search + Notifications + Map + Admin

    - Create `notifications` table for event-driven notifications
    - Implement notifications triggered by matches, claims, and status changes
    - Build search and filter queries using appropriate indexes
    - Create admin APIs for managing claims and viewing return statistics
    - Use `found_location` for map display (avoid exposing exact precision unnecessarily)
