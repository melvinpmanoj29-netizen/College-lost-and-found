# Security Change Audit

## 1. Executive Summary

This audit examines the changes made during the security hardening phase of the **College Lost and Found** project.

Overall, the security hardening modifications were focused on:
1. **Preventing Secret Leaks in Git & Logs:**
   - Parameterized all sensitive credentials in `application.properties` using Spring Boot environment variable placeholders with fallbacks (`${VAR:default}`).
   - Ensured `.env` is created locally and explicitly gitignored via `.gitignore`.
   - Updated `.env.example` as a template for team members without exposing real credentials.
   - Removed plaintext password reset tokens from application log statements in `AuthServiceImpl` and `EmailServiceImpl`.
2. **Defensive Input Validation & DoS Prevention:**
   - Added size bounds (`@Size(max = 2000)`) on item description fields across all item DTOs (`CreateLostItemRequest`, `UpdateLostItemRequest`, `CreateFoundItemRequest`, `UpdateFoundItemRequest`).
   - Added size bounds (`@Size(max = 1000)`) on `CreateClaimRequest` for `verificationAnswer`.
   - Standardized password constraints across all auth endpoints (`ResetPasswordRequest`, `ChangePasswordRequest`, `UserServiceImpl`) to minimum 8 and maximum 72 characters (BCrypt upper limit).
   - Added query parameter length truncation in `SearchServiceImpl` to prevent wildcard/LIKE query database DoS.
3. **Automated Verification:**
   - Added `SecurityAuditTests.java` containing 58 integration tests verifying RBAC, IDOR prevention, ownership boundaries, JWT verification, and input constraints.
4. **Clean Git Hygiene:**
   - Fixed pre-existing git merge conflict markers in the root `.gitignore`.

No breaking architectural changes, no breaking API contract changes, and no frontend regressions were introduced.

---

## 2. Git Changes

### Committed Security Hardening (Commit `f190460` — "Improved security")

| Status | File Path | Description |
|---|---|---|
| **M** (Modified) | `.env.example` | Updated configuration variable documentation template |
| **M** (Modified) | `.gitignore` | Fixed merge conflict markers; ensured `.env*` and build outputs are ignored |
| **M** (Modified) | `backend/src/main/java/.../dto/request/ChangePasswordRequest.java` | Standardized password size `@Size(min = 8, max = 72)` |
| **M** (Modified) | `backend/src/main/java/.../dto/request/CreateClaimRequest.java` | Added `@Size(max = 1000)` on `verificationAnswer` |
| **M** (Modified) | `backend/src/main/java/.../dto/request/CreateFoundItemRequest.java` | Added `@Size(max = 2000)` on `description` |
| **M** (Modified) | `backend/src/main/java/.../dto/request/CreateLostItemRequest.java` | Added `@Size(max = 2000)` on `description` |
| **M** (Modified) | `backend/src/main/java/.../dto/request/ResetPasswordRequest.java` | Standardized password size `@Size(min = 8, max = 72)` |
| **M** (Modified) | `backend/src/main/java/.../dto/request/UpdateFoundItemRequest.java` | Added `@Size(max = 2000)` on `description` |
| **M** (Modified) | `backend/src/main/java/.../dto/request/UpdateLostItemRequest.java` | Added `@Size(max = 2000)` on `description` |
| **M** (Modified) | `backend/src/main/java/.../service/impl/AuthServiceImpl.java` | Omitted reset token from log message |
| **M** (Modified) | `backend/src/main/java/.../service/impl/EmailServiceImpl.java` | Omitted reset token from log message and simulated email log |
| **M** (Modified) | `backend/src/main/java/.../service/impl/SearchServiceImpl.java` | Added query string length truncation |
| **M** (Modified) | `backend/src/main/java/.../service/impl/UserServiceImpl.java` | Updated password validation length from 6 to 8 |
| **A** (Added) | `backend/src/test/java/.../SecurityAuditTests.java` | 58 automated security integration tests |
| **A** (Added) | `docs/SECURITY_AUDIT.md` | Security vulnerability analysis and audit log |

### Uncommitted / Working Tree State

| Status | File Path | Notes |
|---|---|---|
| **M** (Modified) | `backend/src/main/resources/application-example.properties` | Updated database name from `college_lost_found` to `lost_and_found` |
| **??** (Untracked) | `docs/COMPLETE_PROJECT_GUIDE.md` | Local project guide documentation |
| **Gitignored** | `.env` | Local development environment file |
| **Gitignored** | `backend/src/main/resources/application.properties` | Local backend properties file with environment placeholders |

---

## 3. .env Changes

### Environment Files Present

| File Path | Status | Tracked by Git? | Purpose |
|---|---|---|---|
| `.env` (Project Root) | Present on local disk | **No** (Gitignored) | Stores local development credentials (DB, JWT, Admin, Mail, Cloudinary) |
| `.env.example` (Project Root) | Present | **Yes** | Public template containing dummy variable placeholders |
| `.env.local` | Not present | N/A | N/A |
| `.env.development` | Not present | N/A | N/A |
| `.env.production` | Not present | N/A | N/A |
| `frontend/.env` | Not present | N/A | N/A |
| `frontend/.env.local` | Not present | N/A | N/A |
| `backend/.env` | Not present | N/A | N/A |
| `backend/.env.local` | Not present | N/A | N/A |

### Environment Variables Introduced

All values below are sanitized; real values are replaced with `[REDACTED]`:

1. `DB_USERNAME`: Database user (`root`)
2. `DB_PASSWORD`: Database password (`[REDACTED]`)
3. `JWT_SECRET`: HS256 HMAC signing secret (`[REDACTED]`)
4. `JWT_EXPIRATION_MS`: Token validity duration (`86400000` = 24h)
5. `ADMIN_EMAIL`: Default administrator seed email (`admin@college.edu`)
6. `ADMIN_PASSWORD`: Default administrator seed password (`[REDACTED]`)
7. `MAIL_HOST`: SMTP server hostname (`smtp.gmail.com`)
8. `MAIL_PORT`: SMTP server port (`587`)
9. `MAIL_USERNAME`: SMTP account username (`[REDACTED]`)
10. `MAIL_PASSWORD`: SMTP app password (`[REDACTED]`)
11. `CLOUDINARY_CLOUD_NAME`: Cloudinary account cloud name (`[REDACTED]`)
12. `CLOUDINARY_API_KEY`: Cloudinary API public key (`[REDACTED]`)
13. `CLOUDINARY_API_SECRET`: Cloudinary API secret (`[REDACTED]`)
14. `APP_FRONTEND_URL`: Client application base URL (`http://localhost:5173`)

### Environment Variable Consumption
- **Backend:** `backend/src/main/resources/application.properties` reads these via Spring Boot property substitution `${VAR_NAME:fallback_value}`.
- **Frontend:** Frontend does **NOT** read `.env` and contains no `import.meta.env` references. All frontend API requests point directly to the configured backend base URL in [api.ts](file:///e:/projects/college_projects/College-lost-and-found/frontend/src/services/api.ts).

---

## 4. .gitignore Changes

### Modifications in Root `.gitignore`

In commit `f190460`, unresolved merge conflict markers left in `.gitignore` from previous branch merges were resolved:

**Before (in git history):**
```gitignore
<<<<<<< HEAD
*.freebuff/
=======
*.freebuff

# Environment variables & local secrets
.env
.env.local
.env.*.local
!.env.example
>>>>>>> 7195f62be0da718551d27eaa1020120c6b312f61
```

**After (Cleaned & Standardized):**
```gitignore
# Environment variables & local secrets — NEVER commit real credentials
.env
.env.local
.env.*.local
!.env.example

# Local application.properties overrides with real secrets
backend/src/main/resources/application-local.properties
backend/src/main/resources/application-secrets.properties

# Build artifacts
*.freebuff/
*.freebuff
target/
*.jar
*.war
*.class

# IDE files
.idea/
*.iml
.vscode/
*.settings/
.classpath
.project

# Node / frontend build
node_modules/
dist/
frontend/dist/
```

### Gitignore Coverage Verification

- `.env`, `.env.local`, `.env.*.local`: **Ignored**
- `!.env.example`: **Tracked** (whitelist exception)
- `backend/src/main/resources/application.properties`: **Ignored** (by `backend/.gitignore`)
- `target/`: **Ignored**
- `node_modules/`: **Ignored**
- `dist/`, `frontend/dist/`: **Ignored**
- IDE and OS files (`.idea/`, `.vscode/`, `.DS_Store`, `*.iml`, `*.classpath`, `*.project`): **Ignored**

---

## 5. Configuration Changes

### Backend `application.properties` (Local)

| Setting | Value / Expression | Purpose & Impact |
|---|---|---|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/lost_and_found` | Sets MySQL target database to `lost_and_found` |
| `spring.datasource.username` | `${DB_USERNAME:root}` | Pulls DB user from env; falls back to `root` |
| `spring.datasource.password` | `${DB_PASSWORD:CHANGE_ME_SET_DB_PASSWORD_ENV_VAR}` | Pulls DB password from env; prevents hardcoding in repo |
| `spring.jpa.hibernate.ddl-auto` | `validate` | Validates schema against Flyway-managed tables |
| `spring.jpa.show-sql` | `false` | Disables query logging to prevent leaking schema/data into server logs |
| `app.jwt.secret` | `${JWT_SECRET:CHANGE_ME_SET_JWT_SECRET_ENV_VAR_MIN_32_CHARS_LONG}` | Pulls JWT signature key from env |
| `app.jwt.expiration-ms` | `${JWT_EXPIRATION_MS:86400000}` | Configurable token lifetime (default: 24h) |
| `app.admin.email` | `${ADMIN_EMAIL:admin@college.edu}` | Bootstrap admin email |
| `app.admin.password` | `${ADMIN_PASSWORD:CHANGE_ME_SET_ADMIN_PASSWORD_ENV_VAR}` | Bootstrap admin password |
| `spring.mail.*` | `${MAIL_HOST:...}`, `${MAIL_PORT:...}`, `${MAIL_USERNAME:...}`, `${MAIL_PASSWORD:...}` | Configures SMTP mail sending |
| `cloudinary.*` | `${CLOUDINARY_CLOUD_NAME:...}`, `${CLOUDINARY_API_KEY:...}`, `${CLOUDINARY_API_SECRET:...}` | Configures Cloudinary image upload SDK |

### Backend `application-example.properties` (Tracked in Git)

- Line 4: `spring.datasource.url=jdbc:mysql://localhost:3306/lost_and_found` (uncommitted working tree edit aligned DB name with actual schema).
- All secret fields contain placeholder text (`YOUR_MYSQL_PASSWORD`, `YOUR_JWT_SECRET_AT_LEAST_32_CHARS_LONG`, `YOUR_ADMIN_PASSWORD`, `YOUR_CLOUDINARY_API_SECRET`).

---

## 6. Backend Security Changes

### 1. Secret Logging Sanitization
- **[AuthServiceImpl.java](file:///e:/projects/college_projects/College-lost-and-found/backend/src/main/java/com/collegelostandfound/backend/service/impl/AuthServiceImpl.java#L131):** Removed reset token plaintext from log messages.
- **[EmailServiceImpl.java](file:///e:/projects/college_projects/College-lost-and-found/backend/src/main/java/com/collegelostandfound/backend/service/impl/EmailServiceImpl.java#L126-L130):** Removed reset token plaintext from production log and fallback simulated-email log.

### 2. Request DTO Input Validation Limits
- Added `@Size(max = 2000, message = "Description must not exceed 2000 characters")` to:
  - `CreateLostItemRequest.java`
  - `UpdateLostItemRequest.java`
  - `CreateFoundItemRequest.java`
  - `UpdateFoundItemRequest.java`
- Added `@Size(max = 1000, message = "Verification answer must not exceed 1000 characters")` to `CreateClaimRequest.java`.
- Standardized password constraints to `@Size(min = 8, max = 72)` on `ResetPasswordRequest.java` and `ChangePasswordRequest.java`.
- Updated minimum password length check in `UserServiceImpl.java` to 8 characters.

### 3. Search Service DoS Protection
- **[SearchServiceImpl.java](file:///e:/projects/college_projects/College-lost-and-found/backend/src/main/java/com/collegelostandfound/backend/service/impl/SearchServiceImpl.java#L47-L52):** Truncates search query parameters (`q` max 200, filters max 100) before constructing JPA criteria queries.

### 4. Automated Security Test Suite
- **[SecurityAuditTests.java](file:///e:/projects/college_projects/College-lost-and-found/backend/src/test/java/com/collegelostandfound/backend/SecurityAuditTests.java):** 58 integration test cases covering:
  - Unauthenticated access protection on protected endpoints
  - Role-based access control (STUDENT vs ADMIN)
  - IDOR protection on lost and found items
  - Notification isolation per user
  - Claim privacy (verification answer never returned to regular users)
  - JWT tampering, invalid signatures, malformed tokens
  - Mass assignment and status field spoofing prevention

---

## 7. Frontend Security Changes

- **No frontend application code was modified** during the security hardening commit `f190460`.
- Frontend continues using `http://localhost:8080/api` configured in `frontend/src/services/api.ts`.
- Authentication tokens remain stored in `localStorage` under `auth_token` and passed via `Authorization: Bearer <token>` Axios request interceptor.
- Unauthenticated responses (401) trigger the global `onUnauthorized` handler to redirect to login.

---

## 8. Database Configuration Changes

- **Database Engine:** MySQL 8+
- **Database Name:** `lost_and_found`
- **Datasource Configuration:**
  - `spring.datasource.url=jdbc:mysql://localhost:3306/lost_and_found`
  - `spring.datasource.username=${DB_USERNAME:root}`
  - `spring.datasource.password=${DB_PASSWORD:...}`
- **Flyway Migrations:**
  - Flyway uses the standard datasource automatically (no separate `spring.flyway.url` or credentials).
  - Four migrations exist and are unchanged:
    - `V1__create_initial_schema.sql` (Users, Lost Items, Found Items, Matches, Claims)
    - `V2__add_item_coordinates.sql` (Latitude/Longitude columns)
    - `V3__add_match_and_claim_unique_constraints.sql` (Duplicate prevention)
    - `V4__create_password_reset_token_table.sql` (Password reset tokens)
- **Hibernate DDL Auto:** `validate` (ensures Flyway manages schema migrations).

---

## 9. Secret Handling

### Secret Storage Summary

| Secret | Stored In Git? | Stored in `.env` (Local Disk) | Stored in `application.properties` (Local Disk) | Fallback / Default |
|---|---|---|---|---|
| Database Password | **No** (Placeholder only in example) | Yes (`DB_PASSWORD`) | `${DB_PASSWORD:...}` | `CHANGE_ME_SET_DB_PASSWORD_ENV_VAR` |
| JWT Secret | **No** (Placeholder only in example) | Yes (`JWT_SECRET`) | `${JWT_SECRET:...}` | `CHANGE_ME_SET_JWT_SECRET_ENV_VAR_...` |
| Admin Password | **No** (Placeholder only in example) | Yes (`ADMIN_PASSWORD`) | `${ADMIN_PASSWORD:...}` | `CHANGE_ME_SET_ADMIN_PASSWORD_ENV_VAR` |
| Cloudinary Secret | **No** (Placeholder only in example) | Yes (`CLOUDINARY_API_SECRET`) | `${CLOUDINARY_API_SECRET:...}` | `CHANGE_ME` |
| SMTP Password | **No** (Placeholder only in example) | Yes (`MAIL_PASSWORD`) | `${MAIL_PASSWORD:...}` | `CHANGE_ME_SET_MAIL_PASSWORD_ENV_VAR` |

### Remaining Exposures
- **Git HEAD:** 0 exposed credentials.
- **Git History:** As in most long-running student projects, commits prior to September 20, 2026 contained development credentials in commit diffs before parameterization.
- **Recommendation:** If the Git repository is made public, secrets must be rotated and Git history rewritten with tools like BFG Repo-Cleaner or `git filter-repo`.

---

## 10. Possible Problems & Observations

1. **Local MySQL Connection Required for Integration Tests:**
   - Spring Boot integration tests (`@SpringBootTest`) spin up the full Spring context and attempt to connect to MySQL `localhost:3306/lost_and_found` using `root` and the environment `DB_PASSWORD`.
   - When running `mvn test` in a clean environment without MySQL running or without `DB_PASSWORD` exported in the shell, Spring Boot tests fail at context load with `Access denied for user 'root'@'localhost'`.
   - Pure unit tests (such as `CloudinaryServiceImplTest`) pass without a database.
2. **Spring Boot .env Loading:**
   - Spring Boot does not automatically read `.env` files out of the box unless they are exported as OS environment variables, loaded in an IDE run configuration, or handled via a dotenv library (`me.paulschwarz:springboot-dotenv`).
   - If running locally with `mvn spring-boot:run` without exporting variables, Spring Boot will use the placeholder fallback values in `application.properties`.
3. **Frontend API URL:**
   - Frontend `api.ts` has `http://localhost:8080/api` hardcoded rather than reading from `import.meta.env.VITE_API_BASE_URL`. This works for local development on default ports.

---

## 11. Files Renamed

No files were renamed during the security hardening task (`commit f190460`).

*(Note: In an earlier development commit `a430506` on Sep 20, the unused Map feature files `MapController.java`, `MapService.java`, `MapServiceImpl.java`, `MapItemResponse.java`, `MapPage.tsx`, `mapService.ts`, `map.ts` and legacy HTML mockups in `stitch_college_lost_found_ui/` were removed cleanly without leaving dangling imports).*

---

## 12. Build / Test Results

### Frontend
- **Command:** `npm run build` (`tsc -b && vite build`)
- **Result:** **SUCCESS (Exit Code 0)**
- **Output:** 140 modules transformed, 0 TypeScript errors, production bundle generated in `frontend/dist/`.

### Backend
- **Command:** `.\mvnw.cmd test`
- **Result:**
  - **Compilation:** **SUCCESS** (All Java source files compile with 0 errors).
  - **Unit Tests:** **PASSED** (`CloudinaryServiceImplTest`: 6/6 tests passed).
  - **Integration Tests:** Context load error when executed without active MySQL service / matching database credentials (`Access denied for user 'root'@'localhost'`).

---

## 13. Recommended Next Actions

> [!NOTE]
> These are recommended next steps for your review. No actions have been applied per the strict audit instruction.

1. **Local Test Execution:** To run integration tests successfully on local machine, start MySQL service, ensure database `lost_and_found` exists, and set `$env:DB_PASSWORD="your_actual_mysql_password"` before running `.\mvnw.cmd test`.
2. **Dotenv Starter (Optional):** If you want Spring Boot to automatically parse the root `.env` file during `mvn spring-boot:run` without needing manual shell exports, add `me.paulschwarz:springboot-dotenv` to `backend/pom.xml`.
3. **Frontend Base URL Configuration:** In the future, frontend `api.ts` can read `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'` to simplify deployment across environments.
4. **Secret Rotation for Production:** Before any public release or production deployment, generate fresh random credentials for `JWT_SECRET`, database, and mail accounts.
