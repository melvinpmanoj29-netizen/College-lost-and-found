# College Lost & Found System — Complete Project Documentation, Technical Architecture & Viva Guide

---

> **Document Classification:** Academic Project Guide, Technical Implementation Reference & Viva Preparation Manual  
> **Target System:** College Lost & Found System (Web Application)  
> **Source Repository:** `College-lost-and-found`  
> **Verification Status:** **100% Verified Against Active Project Source Code**  
> **Discrepancy Policy:** Features are clearly tagged as `[CURRENT IMPLEMENTATION]` or `[DOCUMENTED / PLANNED — NOT VERIFIED]`.

---

## TABLE OF CONTENTS

1. [PART 1 — Project Overview & Pitch](#part-1--project-overview)
2. [PART 2 — Complete Feature List & Traceability](#part-2--complete-feature-list)
3. [PART 3 — Website Structure & Routing Map](#part-3--website-structure)
4. [PART 4 — Complete Website Workflows & Diagrams](#part-4--complete-website-workflow)
5. [PART 5 — Frontend Architecture (React + TypeScript)](#part-5--frontend-documentation)
6. [PART 6 — Backend Architecture (Spring Boot)](#part-6--backend-documentation)
7. [PART 7 — Database Schema & Flyway Migrations](#part-7--database)
8. [PART 8 — End-to-End Feature Tracing (Frontend → Backend → Database)](#part-8--frontend--backend--database-connection)
9. [PART 9 — Important Source Files for Viva](#part-9--important-source-files)
10. [PART 10 — Critical Source Code Implementations](#part-10--important-code-snippets)
11. [PART 11 — Email Service & Notification Dispatch](#part-11--email-service)
12. [PART 12 — Cloudinary Image Storage Architecture](#part-12--image-storage)
13. [PART 13 — Location & Map Integration](#part-13--map-service)
14. [PART 14 — In-App & Email Notifications](#part-14--notifications)
15. [PART 15 — Security, Authentication & Role Authorization](#part-15--security)
16. [PART 16 — Third-Party Services & Dependencies](#part-16--third-party-services)
17. [PART 17 — Detailed Feature Breakdown](#part-17--features)
18. [PART 18 — Project Advantages & Architectural Strengths](#part-18--advantages)
19. [PART 19 — System Limitations & Constraints](#part-19--limitations)
20. [PART 20 — Future Scope & Enhancement Roadmap](#part-20--future-scope)
21. [PART 21 — Verification, Validation & Testing Matrix](#part-21--testing)
22. [PART 22 — Comprehensive Viva Question & Answer Bank (70+ Q&As)](#part-22--viva-question--answer-section)
23. [PART 23 — Quick Viva Cheat Sheet (30s & 2min Answers)](#part-23--quick-viva-cheat-sheet)
24. [PART 24 — Master File-to-Feature Map](#part-24--file-to-feature-map)
25. [PART 25 — Code Location Index](#part-25--code-location-index)
26. [PART 26 — Final Architecture Summary Diagram](#part-26--final-architecture-summary)

---

## PART 1 — PROJECT OVERVIEW

### 1.1 Summary Explanations

- **One-Sentence Summary:**  
  The College Lost & Found System is a secure, role-based web platform enabling college students to report, search, and claim lost or found property with automated multi-factor smart matching and administrator verification.

- **One-Paragraph Summary:**  
  The application addresses property loss on campus by replacing disorganized physical notice boards and social media groups with a centralized portal. Built using React 19, TypeScript, Spring Boot 4.1.1, and MySQL 8.0, the platform allows students to submit detailed lost/found reports with photos (stored in Cloudinary) and campus location tags. A deterministic similarity scoring algorithm evaluates items across category, color, location keywords, date proximity, and tokenized descriptions, triggering automated notifications and HTML email alerts when match confidence reaches 50% or higher. Claimants provide confidential proof of ownership that only administrators can review, preventing fraudulent claims before items are marked as returned.

- **One-Minute Viva Pitch (Spoken Explanation):**  
  > *"Good morning, respected examiners. Our project is the College Lost & Found System. On any educational campus, valuable belongings like ID cards, calculators, keys, and phones are misplaced daily. Traditional methods—like WhatsApp groups or notice boards—lack structure, searchability, and privacy.  
  > Our solution is an end-to-end full-stack web application with two core roles: Students and Administrators. Students report lost or found property with photos, timestamps, colors, and campus locations. The backend features a rule-based Smart Matching engine that scores similarity up to 100 points across 5 distinct attributes. When a match score exceeds 50%, the system automatically dispatches an in-app notification and an asynchronous HTML email alert to the rightful owner.  
  > To claim an item, a student submits confidential verification details. To protect privacy, this sensitive information is strictly hidden from regular students and visible only to authorized administrators in the Admin Review portal. Once approved, the item status updates to Returned and gets archived into return analytics.  
  > The frontend is built using React 19 and TypeScript with Vite; the backend is powered by Spring Boot with Spring Security and stateless JWT; database versioning is enforced via Flyway on MySQL; and cloud image storage is handled through Cloudinary."*

### 1.2 Technology Stack Summary

| Layer / Subsystem | Technology / Library | Version / Details | Purpose in System |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | React + TypeScript | React 19.2.8, TS 6.0.2 | Reactive UI components, type safety |
| **Frontend Build** | Vite | Vite 8.2.0 | Hot Module Replacement (HMR), bundle packaging |
| **Routing** | React Router DOM | v7.18.2 | Client-side routing, protected and admin route guards |
| **Styling & Icons** | Bootstrap + Bootstrap Icons | Bootstrap 5.3.8, Icons 1.13.1 | Responsive grid, modern forms, dark/light theme |
| **HTTP Client** | Axios | v1.19.0 | REST API client with JWT request/response interceptors |
| **Backend Core** | Spring Boot | 4.1.1 (Java 21) | REST API controllers, services, beans, validation |
| **Security & Auth** | Spring Security + jjwt | jjwt 0.12.6, BCrypt | Stateless JWT Bearer token authentication & role checks |
| **Database & ORM** | MySQL 8.0 + Spring Data JPA | Hibernate 6.x | Relational storage, query derivation, transaction bounds |
| **Schema Migration** | Flyway Migration | flyway-mysql | Versioned schema migrations (`V1__` to `V4__`) |
| **Image Hosting** | Cloudinary Java SDK | `cloudinary-http44:1.39.0` | Secure multipart photo upload, 5MB validation |
| **Email Engine** | Spring Mail / JavaMailSender | Jakarta Mail / SMTP Gmail | Asynchronous HTML smart match & reset password emails |

### 1.3 Local Development Setup

To run the project locally for development and evaluation:

1. **Create `.env` Configuration:**
   Copy `.env.example` in the project root to `.env`:
   ```bash
   cp .env.example .env
   ```
2. **Fill in Local Development Credentials:**
   Edit `.env` with your local development credentials (`DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MAIL_*`, `CLOUDINARY_*`).
3. **Keep Secrets Safe:**
   Never commit `.env` to version control. The `.gitignore` file is configured to keep it excluded.
4. **Start MySQL Service:**
   Ensure MySQL service is running and the database `lost_and_found` exists.
5. **Start the Backend Server:**
   In the `backend/` directory, start the Spring Boot server (which automatically loads the root `.env`):
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
6. **Start the Frontend Client:**
   In the `frontend/` directory, start Vite development server:
   ```powershell
   cd frontend
   npm run dev
   ```

---

## PART 2 — COMPLETE FEATURE LIST

### 2.1 Student Features
1. **User Registration:** Create account with student name, roll number, class, email, and password. Passwords encrypted using BCrypt (10 rounds).
2. **User Authentication:** Login using email and password; receives signed JWT with 24-hour expiration.
3. **Password Recovery:** Request password reset link and 30-minute cryptographic token via email; reset password on `ResetPasswordPage.tsx`.
4. **Profile Management:** View and edit personal profile (class name, profile picture); update password with current password verification.
5. **Report Lost Item:** Multi-field form capturing item name, category, color, lost timestamp, campus location, description, urgency flag (`is_urgent`), and photo upload.
6. **Report Found Item:** Form capturing item name, category, color, found timestamp, found location, description, and photo upload.
7. **View Catalog of Lost Items:** Paginated/filterable list of active lost items across campus.
8. **View Catalog of Found Items:** Browse found items awaiting owner identification with direct claim triggers.
9. **Edit/Delete Personal Reports:** Item owners can edit or delete their own lost or found reports; backend validates object ownership.
10. **View Smart Matches:** View algorithmic matches calculated against personal lost/found items with match confidence scores (0–100%).
11. **Submit Item Claim:** Submit ownership claim on a found item with private verification answers.
12. **Track Claims:** Monitor status of personal claims (`PENDING`, `APPROVED`, `REJECTED`) in `MyClaimsPage.tsx`.
13. **Multi-Criteria Search:** Filter items simultaneously by keyword query, category, campus location, date, color, status, and urgency.
14. **In-App Notifications:** Real-time badge counter and notifications feed for match alerts, claim approvals, and claim rejections.

### 2.2 Administrator Features
1. **Admin Dashboard:** High-level metrics showing Total Lost Items, Total Found Items, Active Claims, Total Resolved/Returned, and Recovery Rate percentage.
2. **Claim Verification Portal:** Inspect student claims, compare confidential verification answers against item records, and execute Approve or Reject actions.
3. **Item Management:** View all reported lost and found items; delete inappropriate, spam, or duplicate reports campus-wide.
4. **Return History & Analytics:** Comprehensive audit log of all recovered items with resolution timelines, claimant records, and approving admin ID.
5. **Dynamic Categories & Locations Configuration:** Enable/disable standard campus zones and item categories via client storage and configuration panel.

### 2.3 System & Integration Features
1. **Automated Smart Matching:** Synchronous execution on item creation/update calculating weighted similarity (Category 30%, Color 20%, Location 20%, Date 10%, Description 20%).
2. **Dual-Channel Match Alerts:** When match score >= 50%, system inserts in-app notification row and fires async HTML email alert.
3. **Cloudinary CDN Upload:** Server-side file validation enforcing JPEG/PNG/WEBP formats and <= 5MB file sizes before uploading to Cloudinary folder `college-lost-and-found/lost-items`.
4. **Database Migration Pipeline:** Flyway migration runner executing versions `V1` to `V4` on application startup.

---

## PART 3 — WEBSITE STRUCTURE

```
LANDING PAGE (/)
   ├── About Page (/about)
   ├── Login (/login)
   ├── Register (/register)
   ├── Reset Password (/reset-password)
   │
   ├── STUDENT PORTAL (Protected via JWT)
   │     ├── Dashboard (/dashboard)
   │     ├── Search (/search)
   │     ├── Notifications (/notifications)
   │     ├── Profile (/profile)
   │     │
   │     ├── LOST ITEMS
   │     │     ├── Browse Lost Items (/lost)
   │     │     ├── Report Lost Item (/report / /report/lost)
   │     │     ├── Lost Item Details (/lost/:id)
   │     │     ├── Edit Lost Item (/lost/:id/edit)
   │     │     └── My Lost Items (/my-lost)
   │     │
   │     ├── FOUND ITEMS
   │     │     ├── Browse Found Items (/found)
   │     │     ├── Report Found Item (/report/found / /found/new)
   │     │     ├── Found Item Details (/found/:id)
   │     │     └── Edit Found Item (/found/:id/edit)
   │     │
   │     ├── SMART MATCHES
   │     │     ├── Matches for Lost Item (/matches/lost/:lostItemId)
   │     │     ├── Matches for Found Item (/matches/found/:foundItemId)
   │     │     └── Match Details (/matches/:id)
   │     │
   │     └── CLAIMS
   │           ├── My Claims (/claims)
   │           ├── Submit Claim (/claims/new)
   │           └── Claim Details (/claims/:id)
   │
   └── ADMIN PORTAL (Protected via Role ADMIN)
         └── /admin (AdminLayout)
               ├── Dashboard (/admin/dashboard)
               ├── Lost Items Management (/admin/lost-items)
               ├── Found Items Management (/admin/found-items)
               ├── Claims Review (/admin/claims)
               ├── Return History & Analytics (/admin/return-history)
               └── Categories & Locations Config (/admin/configuration)
```

---

## PART 4 — COMPLETE WEBSITE WORKFLOWS

### 4.1 General System Recovery Workflow

```
Visitor / Student
      │
      ├─► Register account (BCrypt hash) ─► users table
      ├─► Login (Spring Security JWT) ───► Token stored in localStorage
      │
      ▼
Report Lost Item / Report Found Item
      │
      ├─► Image uploaded to Cloudinary ──► Secure HTTPS URL returned
      ├─► Form submitted via Axios ──────► POST /api/lost-items or /api/found-items
      └─► Controller -> Service -> JPA ──► Inserted into MySQL
            │
            ▼
      Smart Matching Engine Invoked
            │
            ├─► Calculates Score (0 to 100%)
            ├─► Score >= 25.00%: Record created in 'matches' table
            └─► Score >= 50.00%: In-app notification + Asynchronous HTML email sent to owner
                  │
                  ▼
            Owner Views Match & Submits Verification Claim
                  │
                  └─► Private proof of ownership submitted ──► 'claims' table (status: PENDING)
                        │
                        ▼
                  Administrator Reviews Claim (/admin/claims)
                        │
                        ├─► REJECT: Claim marked REJECTED, notification sent to student
                        └─► APPROVE:
                              ├─► Claim marked APPROVED (reviewed_by = admin_id)
                              ├─► Lost Item marked RETURNED
                              ├─► Found Item marked CLAIMED / RETURNED
                              ├─► Competing pending claims set to REJECTED
                              ├─► Approval notification sent to claimant
                              └─► Event recorded in Return History Analytics
```

### 4.2 Smart Matching Algorithm Logic

The matching algorithm is implemented in `SmartMatchingServiceImpl.java`:

$$	ext{Total Score} = S_{	ext{category}} + S_{	ext{color}} + S_{	ext{location}} + S_{	ext{date}} + S_{	ext{description}}$$

1. **Category (30 Points Max):**
   - Exact case-insensitive match: **+30 points**
   - Mismatch: **0 points**
2. **Color (20 Points Max):**
   - Exact match (e.g. "Black" == "Black"): **+20 points**
   - Substring containment (e.g. "Dark Blue" contains "Blue"): **+15 points**
   - No match: **0 points**
3. **Location (20 Points Max):**
   - Exact location string match: **+20 points**
   - Substring location match: **+15 points**
   - Token keyword overlap: **+10 points**
4. **Date Proximity (10 Points Max):**
   - Same calendar day ($\Delta d = 0$): **+10 points**
   - Within 3 days ($\Delta d \le 3$): **+8 points**
   - Within 7 days ($\Delta d \le 7$): **+5 points**
   - Within 14 days ($\Delta d \le 14$): **+3 points**
   - Found 1 day before estimated lost date: **+3 points**
5. **Description Similarity (20 Points Max):**
   - Text is tokenized into lowercase alphanumeric words (length $\ge 2$).
   - 22 stop words (e.g., *the, is, in, on, at, with, near*) are stripped.
   - Overlap formula: $	ext{Score} = \min\left(20.0, rac{|	ext{Tokens}_{	ext{lost}} \cap 	ext{Tokens}_{	ext{found}}|}{\min(|	ext{Tokens}_{	ext{lost}}|, |	ext{Tokens}_{	ext{found}}|)} 	imes 20.0ight)$

---

## PART 5 — FRONTEND ARCHITECTURE (REACT + TYPESCRIPT)

### 5.1 Directory Structure
```
frontend/
├── src/
│   ├── assets/              # Static media assets
│   ├── components/          # Reusable UI widgets
│   │   ├── claims/          # ClaimCard, ClaimPrivacyNotice, ClaimStatusBadge
│   │   ├── found-items/     # FoundItemCard, FoundItemForm, DeleteConfirmModal
│   │   ├── lost-items/      # LostItemCard, ImageUploadField, DeleteConfirmModal
│   │   ├── matches/         # MatchCard, MatchScoreBadge, MatchExplanationBanner
│   │   ├── AdminRoute.tsx   # Role guard requiring ADMIN
│   │   ├── ProtectedRoute.tsx # Auth guard requiring valid JWT
│   │   └── Logo.tsx         # Brand header SVG component
│   ├── constants/           # categories.ts (standard categories & campus zones)
│   ├── context/             # AuthContext.tsx, ThemeContext.tsx
│   ├── pages/               # Application route views
│   │   ├── admin/           # AdminDashboardPage, AdminClaimsPage, etc.
│   │   ├── auth/            # ResetPasswordPage
│   │   ├── claims/          # CreateClaimPage, MyClaimsPage, ClaimDetailPage
│   │   ├── dashboard/       # StudentDashboardPage
│   │   ├── found-items/     # FoundItemsPage, FoundItemDetailPage, etc.
│   │   ├── lost-items/      # LostItemsListPage, ReportLostItemPage, etc.
│   │   ├── matches/         # ItemMatchesPage, MatchDetailPage
│   │   ├── notifications/   # NotificationsPage
│   │   ├── search/          # SearchPage
│   │   ├── LoginPage.tsx    # User login
│   │   ├── RegisterPage.tsx # User registration
│   │   └── ProfilePage.tsx  # User profile & password change
│   ├── services/            # Axios API wrappers (api.ts, auth, items, admin)
│   ├── styles/              # Global & modular CSS sheets
│   └── types/               # TypeScript interface contracts (auth, items, claims)
├── package.json
└── vite.config.ts
```

### 5.2 Axios Interceptor Configuration (`frontend/src/services/api.ts`)
```typescript
import axios, { type AxiosError } from 'axios'

const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// Attach JWT Bearer token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      tokenStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## PART 6 — BACKEND ARCHITECTURE (SPRING BOOT)

### 6.1 Backend Layered Flow
$$	ext{HTTP Request} \longrightarrow 	ext{JwtAuthenticationFilter} \longrightarrow 	ext{Controller} \longrightarrow 	ext{Service (Transactional)} \longrightarrow 	ext{JPA Repository} \longrightarrow 	ext{MySQL 8.0}$$

### 6.2 Complete Controller Inventory

| Controller Name | Base Path | Endpoints Exposed | Authorization Level |
| :--- | :--- | :--- | :--- |
| `AuthController.java` | `/api/auth` | `POST /register`, `POST /login`, `POST /forgot-password`, `POST /reset-password` | Public (`permitAll()`) |
| `UserController.java` | `/api/users` | `GET /me`, `PUT /me`, `POST /me/change-password` | Authenticated (JWT) |
| `LostItemController.java` | `/api/lost-items` | `GET /`, `GET /my`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `POST /upload-image` | Authenticated (JWT) |
| `FoundItemController.java` | `/api/found-items` | `GET /`, `GET /my`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` | Authenticated (JWT) |
| `ClaimController.java` | `/api/claims` | `POST /`, `GET /my`, `GET /{id}` | Authenticated (JWT) |
| `MatchController.java` | `/api/matches` | `GET /lost/{id}`, `GET /found/{id}`, `GET /{id}` | Authenticated (JWT) |
| `SearchController.java` | `/api/search` | `GET /` (multi-criteria parameters) | Authenticated (JWT) |
| `NotificationController.java`| `/api/notifications`| `GET /`, `GET /unread`, `PUT /{id}/read` | Authenticated (JWT) |
| `AdminController.java` | `/api/admin` | `GET /dashboard`, `GET /return-history`, `GET /history`, `GET /claims`, `PUT /claims/{id}/approve`, `PUT /claims/{id}/reject`, `DELETE /lost-items/{id}`, `DELETE /found-items/{id}` | `@PreAuthorize("hasRole('ADMIN')")` |

---

## PART 7 — DATABASE ARCHITECTURE & FLYWAY MIGRATIONS

### 7.1 Flyway Migration History
1. `V1__create_initial_schema.sql`: Creates core tables (`users`, `lost_items`, `found_items`, `matches`, `claims`, `notifications`) and 15 performance indexes.
2. `V2__add_item_coordinates.sql`: Adds `latitude DECIMAL(10,7)` and `longitude DECIMAL(10,7)` to `lost_items` and `found_items`.
3. `V3__add_match_and_claim_unique_constraints.sql`: Adds unique constraint `uk_matches_lost_found (lost_item_id, found_item_id)` and `uk_claims_lost_found_claimant (lost_item_id, found_item_id, claimant_user_id)` to eliminate duplicates.
4. `V4__create_password_reset_token_table.sql`: Creates `password_reset_tokens` table with 30-min expiry and composite lookup index.

### 7.2 Entity Relationship Diagram (Textual Representation)

```
       ┌────────────────────────┐
       │         users          │
       ├────────────────────────┤
       │ id (PK)                │
       │ student_name           │
       │ roll_number (UQ)       │
       │ email (UQ)             │
       │ password_hash          │
       │ role (STUDENT/ADMIN)   │
       └───────────┬────────────┘
                   │ 1:N
   ┌───────────────┼───────────────────────────┬───────────────────────────┐
   │               │                           │                           │
   ▼ 1:N           ▼ 1:N                       ▼ 1:N                       ▼ 1:N
┌──────────────┐ ┌──────────────┐       ┌──────────────┐            ┌────────────────────────┐
│  lost_items  │ │ found_items  │       │notifications │            │ password_reset_tokens  │
├──────────────┤ ├──────────────┤       ├──────────────┤            ├────────────────────────┤
│ id (PK)      │ │ id (PK)      │       │ id (PK)      │            │ id (PK)                │
│ user_id (FK) │ │ user_id (FK) │       │ user_id (FK) │            │ user_id (FK)           │
│ item_name    │ │ item_name    │       │ message      │            │ token (UQ)             │
│ category     │ │ category     │       │ is_read      │            │ expiry_date_time       │
│ color        │ │ color        │       │ created_at   │            │ used (BOOLEAN)         │
│ status       │ │ status       │       └──────────────┘            └────────────────────────┘
└──────┬───────┘ └──────┬───────┘
       │                │
       ├────────────────┴──────────────┐
       │                               │
       ▼ 1:N                           ▼ 1:N
┌────────────────────────┐      ┌────────────────────────┐
│        matches         │      │         claims         │
├────────────────────────┤      ├────────────────────────┤
│ id (PK)                │      │ id (PK)                │
│ lost_item_id (FK)      │      │ lost_item_id (FK)      │
│ found_item_id (FK)     │      │ found_item_id (FK)     │
│ match_score (DECIMAL)  │      │ claimant_user_id (FK)  │
│ match_status           │      │ reviewed_by (FK)       │
│ created_at             │      │ verification_answer    │
└────────────────────────┘      │ status (PENDING/...)   │
                                └────────────────────────┘
```

---

## PART 8 — FEATURE TRACEABILITY (END-TO-END)

### Feature Trace: Report Lost Item with Cloudinary Photo

```
Step 1: Frontend User Form
File: frontend/src/pages/lost-items/ReportLostItemPage.tsx
Action: User selects photo & clicks Submit -> triggers uploadImage() then handleSubmit().

Step 2: Cloudinary Image Upload
File: frontend/src/components/lost-items/ImageUploadField.tsx
API: POST /api/lost-items/upload-image (multipart/form-data)
Controller: LostItemController.uploadImage(@RequestParam("file") MultipartFile file)
Service: CloudinaryServiceImpl.uploadImage(file) -> validates 5MB limit, uploads to Cloudinary folder 'college-lost-and-found/lost-items' -> returns HTTPS URL.

Step 3: Item Creation Request
API: POST /api/lost-items (JSON Payload with imageUrl, itemName, category, color, lostDateTime, lastSeenLocation, description, isUrgent)
Controller: LostItemController.createLostItem(@Valid @RequestBody CreateLostItemRequest request, Authentication auth)

Step 4: Business Processing & Entity Persistence
Service: LostItemServiceImpl.createLostItem(request, auth)
Entity: com.collegelostandfound.backend.entity.LostItem
Repository: LostItemRepository.save(lostItem)
Database: Row inserted into MySQL 'lost_items' table.

Step 5: Automated Smart Matching Calculation
Trigger: SmartMatchingServiceImpl.computeMatchesForLostItem(savedItem)
Execution: Queries active found items from found_items table, runs calculateScore(), saves rows into 'matches' table.
Notification: If score >= 50.00%, inserts row into 'notifications' table and calls EmailServiceImpl.sendMatchNotificationEmail().

Step 6: UI Update
React receives LostItemResponse (HTTP 201 Created) -> navigates user to /lost with toast confirmation.
```

---

## PART 11 — EMAIL SERVICE IMPLEMENTATION

The email engine is powered by **Spring Boot Starter Mail** via `JavaMailSender` configured in `application.properties`:

- **Configuration Properties:**
  ```properties
  spring.mail.host=smtp.gmail.com
  spring.mail.port=587
  spring.mail.username=${MAIL_USERNAME:noreply@college.edu}
  spring.mail.password=${MAIL_PASSWORD:CHANGE_ME_SET_MAIL_PASSWORD_ENV_VAR}
  spring.mail.properties.mail.smtp.auth=true
  spring.mail.properties.mail.smtp.starttls.enable=true
  ```

- **Service Class:** `EmailServiceImpl.java`
- **Execution Mode:** `@Async` (Non-blocking background thread execution).
- **Graceful Fallback Mode:** If SMTP credentials are not supplied, the service logs a formatted simulation alert to console output without interrupting user operations:
  ```
  [SIMULATED EMAIL - Configure spring.mail.* in application.properties to send live emails]
  To: student@college.edu
  Subject: Smart Match Alert: Potential match found for your Blue Casio Calculator (95.0%)
  Link: http://localhost:5173/matches/lost/4
  ```

---

## PART 12 — CLOUDINARY IMAGE STORAGE

- **Dependency:** `com.cloudinary:cloudinary-http44:1.39.0`
- **Configuration Bean:** `CloudinaryConfig.java` reads `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- **Validation Rules:**
  - Max File Size: **5 MB** (`5 * 1024 * 1024` bytes).
  - Allowed MIME Types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
- **Storage Strategy:** MySQL does not store binary blobs; it stores the returned CDN `secure_url` (VARCHAR 500), ensuring ultra-fast page rendering.

---

## PART 13 — LOCATION & MAP SERVICE

- **Database Fields:** `latitude DECIMAL(10,7)` and `longitude DECIMAL(10,7)` added via Migration `V2`.
- **Current Location Management:**
  - Standard campus locations configured in `categories.ts` (e.g., Central Library, Canteen, Science Block, Men's Hostel).
  - Admins can activate/deactivate locations in `AdminConfigurationPage.tsx`.
  - Search filters and matching algorithm evaluate location keywords.
- **Map Status:** `leaflet` is included in `package.json`; visual Leaflet coordinate pin placement is packaged for future iterative rollout `[CURRENT IMPLEMENTATION: Location Name Tagging + Coordinate DB Columns; Leaflet Visual Map: DOCUMENTED/PLANNED]`.

---

## PART 14 — NOTIFICATIONS

- **In-App Notifications:** Stored persistently in MySQL `notifications` table (`id`, `user_id`, `message`, `type`, `is_read`, `created_at`).
- **Live Badge Counters:** React top navigation queries `/api/notifications/unread` and renders dynamic notification count badges.
- **Trigger Points:**
  1. Smart Match Score $\ge 50.00\%$ (`MATCH_FOUND`)
  2. Admin Approves Item Claim (`CLAIM_APPROVED`)
  3. Admin Rejects Item Claim (`CLAIM_REJECTED`)
- **Status on WebSockets:** WebSockets were noted in early project exploration but the verified active system uses database persistence + REST polling + Async SMTP Email alerts `[CURRENT IMPLEMENTATION: REST + DB + SMTP Email; WebSocket: DOCUMENTED/PLANNED]`.

---

## PART 15 — SECURITY & AUTHENTICATION

1. **Password Protection:** BCrypt password hashing with a work factor of 10 rounds.
2. **Stateless JWT Tokens:** Generated using HMAC-SHA256 with minimum 256-bit secret keys (`app.jwt.secret`), 24-hour expiration (`86400000 ms`).
3. **CORS Configuration:** Explicitly permits frontend origins (`http://localhost:5173`, `http://localhost:*`), with exposed `Authorization` headers.
4. **Role Enforcement:** Controller methods guarded by `@PreAuthorize("hasRole('ADMIN')")`.
5. **Ownership Guarding:** Service methods ensure users can only modify/delete items belonging to their own user ID.
6. **Privacy Protection:** Claim verification answers are strictly hidden from public endpoints and serialized only in `AdminClaimReviewResponse.java`.

---

## PART 22 — COMPREHENSIVE VIVA QUESTION & ANSWER BANK

### Section A: General Project & Architecture Questions

**Q1: What is the purpose of the College Lost & Found System?**  
*Answer:* It is a centralized digital property-recovery portal designed for college campuses. It replaces inefficient physical notice boards and social media chats with a secure, role-based platform offering image reporting, automated similarity matching, and confidential administrator-verified claim workflows.

**Q2: What are the primary user roles in the application?**  
*Answer:* There are two roles:
1. `STUDENT`: Can report lost items, report found items, view matches, submit ownership claims, filter/search items, and manage their personal profile.
2. `ADMIN`: Can access the Admin Dashboard, inspect confidential claim proofs, approve or reject claims, manage spam reports, view return history analytics, and configure campus locations.

**Q3: What makes this system different from a manual lost-and-found office?**  
*Answer:*
- **24/7 Digital Accessibility:** Students can search and report items immediately from any device.
- **Automated Discovery:** The rule-based Smart Matching algorithm proactively pairs lost reports with found reports and notifies owners without manual human searching.
- **Fraud Prevention:** Verification answers are kept confidential and evaluated by administrators before handing over property.
- **Audit Trail:** Complete database history logs all recoveries, resolution timeframes, and reviewer IDs.

---

### Section B: Frontend Architecture (React & TypeScript)

**Q4: Why did you choose React with TypeScript instead of vanilla JavaScript?**  
*Answer:* TypeScript provides static compile-time type checking, preventing runtime errors and ensuring strict contract alignment between Spring Boot DTOs and React state. React's virtual DOM, declarative hooks (`useState`, `useEffect`, `useContext`), and component reusability allow responsive state synchronization across lost/found feeds, search filters, and theme toggles.

**Q5: How does client-side routing work in this application?**  
*Answer:* Client-side routing is managed by `react-router-dom` (v7) in `App.tsx`. Standard routes (`/`, `/about`, `/login`, `/register`) are public. Authenticated routes (`/dashboard`, `/lost`, `/found`, `/claims`) are wrapped inside `<ProtectedRoute>`, which verifies JWT presence. Admin routes (`/admin/*`) are protected by `<AdminRoute>`, which checks if `user.role === 'ADMIN'`.

**Q6: Where is Axios configured and how is the JWT token attached to API requests?**  
*Answer:* In `frontend/src/services/api.ts`. An Axios instance is created with `baseURL: 'http://localhost:8080/api'`. A request interceptor retrieves the JWT token from `localStorage` using `tokenStorage.get()` and attaches it to the `Authorization: Bearer <token>` header. A response interceptor catches 401 errors and automatically triggers logout.

**Q7: How are form errors and API exceptions displayed to students?**  
*Answer:* The helper function `getErrorMessage(error)` in `api.ts` extracts structured backend error messages returned by `GlobalExceptionHandler.java` (e.g. `data.message`), handling network failures and 401 unauthorized errors with user-friendly alerts.

---

### Section C: Backend Architecture (Spring Boot & Java)

**Q8: Why did you adopt a 5-layer backend architecture?**  
*Answer:* Layered architecture enforces the Separation of Concerns (SoC) principle:
1. *Security Filter:* Authenticates JWT tokens and authorizes roles.
2. *Controller Layer:* Handles HTTP mapping, JSON serialization, and bean validation (`@Valid`).
3. *Service Layer:* Encapsulates business rules, algorithmic scoring, and transactional boundaries (`@Transactional`).
4. *Repository Layer:* Abstracts database queries using Spring Data JPA.
5. *Entity / Database Layer:* Defines relational schema mapping and data integrity constraints.

**Q9: Why do you use DTOs instead of passing JPA Entity objects directly to the frontend?**  
*Answer:*
1. **Security & Privacy:** DTOs prevent exposing sensitive entity fields (like `passwordHash` or confidential verification answers) to public APIs.
2. **Infinite Recursion Prevention:** Bidirectional JPA relationships (e.g., `@OneToMany` / `@ManyToOne`) cause JSON serialization loops if entities are serialized directly.
3. **Decoupling:** Allows the database schema to evolve independently of the public REST API contracts.
4. **Validation:** Enables validation constraints (`@NotBlank`, `@Size`, `@Email`) specifically tailored for request payloads.

**Q10: Which controller and service handle lost item operations?**  
*Answer:*
- Controller: `LostItemController.java` (`@RequestMapping("/api/lost-items")`)
- Service: `LostItemServiceImpl.java` (implements `LostItemService.java`)
- Repository: `LostItemRepository.java`

---

### Section D: Spring Security & Authentication

**Q11: How does the login process work from credential submission to token generation?**  
*Answer:*
1. The student submits email and password on `LoginPage.tsx`, calling `POST /api/auth/login`.
2. `AuthController.login()` invokes `AuthServiceImpl.login()`.
3. `AuthenticationManager.authenticate()` validates credentials against `CustomUserDetailsService` using `BCryptPasswordEncoder`.
4. If valid, `JwtService.generateToken()` constructs an HMAC-SHA256 signed JWT containing the user's email, ID, and role.
5. The backend returns a `LoginResponse` containing the token and user metadata.

**Q12: How does the backend protect Admin APIs from student access?**  
*Answer:* `AdminController.java` is annotated with `@PreAuthorize("hasRole('ADMIN')")`. Method security is activated via `@EnableMethodSecurity` in `SecurityConfig.java`. When a request arrives, `JwtAuthenticationFilter` populates the `SecurityContextHolder` with the user's GrantedAuthorities. If the authority is not `ROLE_ADMIN`, Spring Security invokes `RestAccessDeniedHandler`, returning HTTP 403 Forbidden.

**Q13: Why is BCrypt used for password storage?**  
*Answer:* BCrypt is an adaptive cryptographic hashing algorithm based on the Blowfish cipher. It includes an automatic random salt (protecting against rainbow table attacks) and a configurable work factor (default 10 rounds), which makes brute-force attacks computationally infeasible.

---

### Section E: Database & Flyway Migrations

**Q14: What is Flyway and why did you use it?**  
*Answer:* Flyway is an open-source database migration and version control tool. Instead of relying on error-prone automatic Hibernate schema updates (`ddl-auto=update`), Flyway executes immutable, versioned SQL migration scripts (`V1__create_initial_schema.sql` to `V4__create_password_reset_token_table.sql`). This guarantees that every developer and production server runs against an identical, reproducible database schema.

**Q15: What tables exist in the database and what are their primary relationships?**  
*Answer:*
1. `users`: Stores accounts with unique `email` and `roll_number`.
2. `lost_items`: Contains lost item reports with a foreign key to `users(id)`.
3. `found_items`: Contains found item reports with a foreign key to `users(id)`.
4. `matches`: Stores similarity pairings between `lost_item_id` and `found_item_id` with a unique composite key.
5. `claims`: Stores claim attempts linking `lost_item_id`, `found_item_id`, `claimant_user_id`, and `reviewed_by`.
6. `notifications`: Stores in-app alerts linked to `user_id`.
7. `password_reset_tokens`: Stores 30-minute password reset tokens linked to `user_id`.

---

### Section F: Smart Matching & Algorithms

**Q16: Is the Smart Matching system based on Machine Learning or AI?**  
*Answer:* No. It is an algorithmic, rule-based similarity engine implemented in `SmartMatchingServiceImpl.java`. It computes a deterministic score (0–100%) across Category (30%), Color (20%), Location (20%), Date proximity (10%), and Stop-word-filtered tokenized description overlap (20%).

**Q17: When are matches computed and what actions occur?**  
*Answer:* Matches are computed synchronously whenever a student reports or updates a lost or found item.
- Scores $\ge 25.00\%$: Persisted in the `matches` table.
- Scores $\ge 50.00\%$: Triggers an in-app notification row and dispatches an asynchronous HTML alert email to the lost item owner.

---

### Section G: Claims & Verification

**Q18: Why are claim verification answers kept confidential?**  
*Answer:* When a found item is published, only public characteristics are visible. The rightful owner must provide private identifying proof (such as serial numbers, lock screen wallpaper, interior wallet contents, or distinctive scratches). If these answers were visible to other students, anyone could duplicate them to claim the item fraudulently. Hence, only administrators have access to verification answers in the Admin Review interface.

**Q19: What happens when an administrator clicks 'Approve Claim'?**  
*Answer:* Inside a single atomic `@Transactional` method in `AdminServiceImpl.java`:
1. The target `Claim` status is set to `APPROVED`, and `reviewed_by` is set to the current admin's ID.
2. The corresponding `LostItem` is updated to `RETURNED`.
3. The corresponding `FoundItem` is updated to `CLAIMED` / `RETURNED`.
4. Any competing pending claims on that item are updated to `REJECTED`.
5. An in-app approval notification is dispatched to the claimant.

---

### Section H: Cloudinary Image Storage & Email

**Q20: Why store images in Cloudinary instead of MySQL database BLOB columns?**  
*Answer:* Binary image BLOBs rapidly inflate MySQL database size, increase memory consumption, slow down database backups, and strain JVM heap allocations. Storing images in Cloudinary offloads image processing and CDN delivery to specialized cloud infrastructure, while MySQL stores only a lightweight `VARCHAR(500)` URL string.

**Q21: How does the email service handle situations where SMTP credentials are missing?**  
*Answer:* In `EmailServiceImpl.java`, if `mailSender` is not configured, the service logs a simulated notification to the server console with the recipient, subject, and match link without throwing an unhandled exception or breaking the HTTP request lifecycle.

---

## PART 23 — QUICK VIVA CHEAT SHEET

| Parameter | Quick Answer |
| :--- | :--- |
| **Project Name** | College Lost & Found Management System |
| **Architecture** | Decoupled Client-Server: React 19 SPA + Spring Boot REST API |
| **Primary Databases** | MySQL 8.0 with Flyway Versioned Migrations (V1 to V4) |
| **Authentication** | Stateless JWT (HMAC-SHA256, 24h validity) + BCrypt (10 rounds) |
| **Image Hosting** | Cloudinary Java SDK 1.39.0 (5MB limit, JPEG/PNG/WEBP) |
| **Email Engine** | Spring Mail (JavaMailSender / SMTP Gmail) with Async HTML alerts |
| **Smart Matching** | Rule Engine: Category (30), Color (20), Location (20), Date (10), Text (20) |
| **Notification Trigger**| Score $\ge 50.00\%$ generates In-App Notification + Async Email |
| **Claim Security** | Private proof-of-ownership details visible exclusively to ADMIN |
| **Main Entities** | `User`, `LostItem`, `FoundItem`, `Match`, `Claim`, `Notification`, `PasswordResetToken` |
| **30-Second Pitch** | *"Our system is a full-stack campus property recovery portal. Students report lost or found items with photos; a 5-factor matching algorithm automatically pairs corresponding reports; notifications and emails alert owners; and administrators review confidential ownership claims before releasing items."* |

---

## PART 24 — MASTER FILE-TO-FEATURE MAP

| Feature Domain | Frontend File(s) | REST Endpoint & Controller | Service & Implementation | Repository & Database Table |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `LoginPage.tsx`<br/>`RegisterPage.tsx`<br/>`ResetPasswordPage.tsx` | `POST /api/auth/register`<br/>`POST /api/auth/login`<br/>`AuthController.java` | `AuthService`<br/>`AuthServiceImpl.java`<br/>`JwtService.java` | `UserRepository`<br/>`PasswordResetTokenRepo`<br/>`users`, `password_reset_tokens` |
| **Lost Items** | `ReportLostItemPage.tsx`<br/>`LostItemsListPage.tsx`<br/>`LostItemDetailsPage.tsx`<br/>`EditLostItemPage.tsx` | `POST /api/lost-items`<br/>`GET /api/lost-items`<br/>`GET /api/lost-items/{id}`<br/>`LostItemController.java` | `LostItemService`<br/>`LostItemServiceImpl.java`<br/>`CloudinaryServiceImpl.java` | `LostItemRepository`<br/>`lost_items` |
| **Found Items** | `ReportFoundItemPage.tsx`<br/>`FoundItemsPage.tsx`<br/>`FoundItemDetailPage.tsx`<br/>`EditFoundItemPage.tsx` | `POST /api/found-items`<br/>`GET /api/found-items`<br/>`GET /api/found-items/{id}`<br/>`FoundItemController.java` | `FoundItemService`<br/>`FoundItemServiceImpl.java` | `FoundItemRepository`<br/>`found_items` |
| **Smart Matching** | `ItemMatchesPage.tsx`<br/>`MatchDetailPage.tsx`<br/>`MatchCard.tsx` | `GET /api/matches/lost/{id}`<br/>`GET /api/matches/found/{id}`<br/>`MatchController.java` | `SmartMatchingService`<br/>`SmartMatchingServiceImpl.java` | `MatchRepository`<br/>`matches` |
| **Claims** | `CreateClaimPage.tsx`<br/>`MyClaimsPage.tsx`<br/>`ClaimDetailPage.tsx` | `POST /api/claims`<br/>`GET /api/claims/my`<br/>`GET /api/claims/{id}`<br/>`ClaimController.java` | `ClaimService`<br/>`ClaimServiceImpl.java` | `ClaimRepository`<br/>`claims` |
| **Admin Operations**| `AdminDashboardPage.tsx`<br/>`AdminClaimsPage.tsx`<br/>`AdminReturnHistoryPage.tsx`| `GET /api/admin/dashboard`<br/>`PUT /api/admin/claims/{id}/approve`<br/>`AdminController.java` | `AdminService`<br/>`AdminServiceImpl.java` | All Repositories<br/>`claims`, `lost_items`, `found_items` |

---

## PART 26 — FINAL ARCHITECTURE SUMMARY DIAGRAM

```
                     =====================================================
                                 STUDENT & ADMINISTRATOR CLIENTS
                     =====================================================
                                                │
                                                ▼
                     [REACT 19 + TYPESCRIPT SINGLE PAGE APPLICATION]
                       • Bootstrap 5.3 + Custom CSS Theming
                       • React Router DOM 7 (Protected & Admin Guards)
                       • Axios HTTP Client with JWT Request Interceptor
                                                │
                                                ▼ HTTP REST (JSON & Multipart)
                     =====================================================
                             SPRING BOOT 4.1.1 (JAVA 21) REST API
                     =====================================================
                        ┌───────────────────────┬───────────────────────┐
                        ▼                       ▼                       ▼
               [SECURITY SUBSYSTEM]    [REST CONTROLLERS]      [GLOBAL EXCEPTION HANDLER]
               • JwtAuthenticationFilter• 9 REST Controllers   • GlobalExceptionHandler
               • BCrypt (10 rounds)    • Bean Validation       • RFC 7807 Standard Error
               • Stateless Sessions    • ResponseEntity<DTO>     Responses
                        └───────────────────────┬───────────────────────┘
                                                │
                                                ▼
                                     [SERVICE LAYER (11)]
                              • SmartMatchingServiceImpl (Algorithm)
                              • AdminServiceImpl (Transactional Claims)
                              • EmailServiceImpl (@Async Dispatch)
                              • CloudinaryServiceImpl (Image CDN)
                                                │
                                                ▼
                                    [DATA ACCESS LAYER (7)]
                              • Spring Data JPA Repositories
                              • Hibernate ORM (ddl-auto: validate)
                                                │
                                                ▼
                     =====================================================
                                 MYSQL 8.0 RELATIONAL DATABASE
                     =====================================================
                       • Flyway Versioned Migrations (V1 to V4)
                       • 7 Relational Tables: users, lost_items, found_items,
                         matches, claims, notifications, password_reset_tokens
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
             [CLOUDINARY IMAGE CDN]                            [SPRING MAIL SMTP]
             • Secure HTTPS Photo URLs                         • Async HTML Email Delivery
             • 5MB Multipart Uploads                           • Match Alerts & Token Recovery
```

---

*End of College Lost & Found System Complete Project Guide & Technical Reference.*
