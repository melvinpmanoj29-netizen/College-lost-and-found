# College Lost & Found System — Testing Checklist

## 1. General Build Check

- [ ] Frontend starts successfully
- [ ] Backend starts successfully
- [ ] MySQL connection works
- [ ] No compilation errors
- [ ] No major console errors
- [ ] No obvious runtime errors

---

## 2. Authentication

### Registration

- [ ] Student can register
- [ ] Required fields are validated
- [ ] Duplicate roll number is rejected
- [ ] Duplicate email is rejected if email is used
- [ ] Password is never stored as plaintext

### Login

- [ ] Student can login
- [ ] Correct credentials produce JWT
- [ ] Incorrect credentials are rejected
- [ ] Invalid/expired JWT is rejected
- [ ] Protected endpoints require authentication

### Authorization

- [ ] STUDENT cannot access ADMIN endpoints
- [ ] ADMIN can access ADMIN endpoints
- [ ] Backend performs authorization
- [ ] Frontend-only role protection is not relied upon

---

## 3. Profile

- [ ] Current user profile loads
- [ ] Student can update own profile
- [ ] Student cannot update another user's profile
- [ ] Profile image works
- [ ] Profile data is correctly stored in MySQL
- [ ] Sensitive fields are not exposed

---

## 4. Lost Item

### Create

- [ ] Student can create Lost Item
- [ ] Item name validation works
- [ ] Description validation works
- [ ] Category works
- [ ] Colour works
- [ ] Lost date/time works
- [ ] Last seen location works
- [ ] Latitude works
- [ ] Longitude works
- [ ] Image works
- [ ] Urgent flag works

### Ownership

- [ ] Lost Item is associated with authenticated user
- [ ] Frontend cannot assign another user as owner
- [ ] Student can only modify their own Lost Items
- [ ] ADMIN can manage reports according to authorization rules

### Status

- [ ] New report starts as LOST
- [ ] Returned status works
- [ ] Archived status works
- [ ] Expiry mechanism works

---

## 5. Found Item

- [ ] Student can create Found Item
- [ ] Item name works
- [ ] Description works
- [ ] Category works
- [ ] Colour works
- [ ] Found date/time works
- [ ] Found location works
- [ ] Latitude works
- [ ] Longitude works
- [ ] Image works

### Ownership

- [ ] Found Item is associated with authenticated user
- [ ] Student can only modify their own Found Items
- [ ] ADMIN can manage reports according to authorization rules

### Status

- [ ] New report starts as FOUND
- [ ] Returned status works

---

## 6. Search and Filter

- [ ] Search by item name works
- [ ] Filter by category works
- [ ] Filter by location works
- [ ] Filter by date works
- [ ] Filter by status works
- [ ] Filter by colour works where implemented
- [ ] Urgent filtering works where implemented
- [ ] Lost and Found results are correctly separated
- [ ] Multiple filters work together
- [ ] Search does not use a duplicate database/table

---

## 7. Smart Matching

- [ ] Lost Item can be compared with Found Item
- [ ] Category matching works
- [ ] Colour matching works
- [ ] Location matching works
- [ ] Date matching works
- [ ] Description matching works
- [ ] Match score is calculated correctly
- [ ] Match score is between 0 and 100
- [ ] Possible Match is generated according to the finalized matching threshold/rules
- [ ] Duplicate matches are prevented
- [ ] Match information does not expose private claim verification data

---

## 8. Claims

- [ ] Student can submit a claim
- [ ] Claimant is taken from authenticated JWT
- [ ] Student cannot submit claim as another user
- [ ] Lost Item exists validation works
- [ ] Found Item exists validation works
- [ ] Valid Lost/Found relationship is validated
- [ ] Duplicate claim is prevented
- [ ] New claim starts as PENDING
- [ ] Student can view their own claims
- [ ] Student cannot view another student's private claim data
- [ ] verificationAnswer is not exposed in normal student APIs

---

## 9. Admin Claim Verification

- [ ] Admin can view pending claims
- [ ] Admin can view verificationAnswer through authorized admin endpoint
- [ ] Student cannot access admin claim endpoint
- [ ] Admin can approve claim
- [ ] Admin can reject claim
- [ ] Approved claim changes the appropriate item status
- [ ] Rejected claim does not incorrectly mark item as returned
- [ ] reviewed_at is recorded
- [ ] reviewed_by is recorded
- [ ] Appropriate notification is generated

---

## 10. Notifications

- [ ] User can view own notifications
- [ ] User cannot view another user's notifications
- [ ] Unread notifications are identified
- [ ] Notification can be marked as read
- [ ] Possible Match notification works
- [ ] Claim approved notification works
- [ ] Claim rejected notification works
- [ ] Returned item notification works
- [ ] Notification records are stored correctly

If WebSocket is implemented:

- [ ] Real-time notification works
- [ ] WebSocket failure does not corrupt database notification records

---

## 11. Map

- [ ] Leaflet loads correctly
- [ ] OpenStreetMap tiles load
- [ ] Lost item locations appear
- [ ] Found item locations appear
- [ ] Latitude/longitude are correct
- [ ] Human-readable location is displayed appropriately
- [ ] Private claim information is not exposed
- [ ] Unnecessary personal information is not exposed
- [ ] No Google Maps dependency exists

---

## 12. Admin Dashboard

- [ ] Admin can access dashboard
- [ ] Student cannot access dashboard
- [ ] Total lost items is calculated dynamically
- [ ] Total found items is calculated dynamically
- [ ] Returned items count is calculated dynamically
- [ ] Pending claims count is calculated dynamically
- [ ] Most common locations are calculated dynamically
- [ ] Charts display correct database data
- [ ] No statistics are hard-coded

---

## 13. Admin Report Management

- [ ] Admin can view Lost Items
- [ ] Admin can view Found Items
- [ ] Admin can remove fake Lost reports
- [ ] Admin can remove fake Found reports
- [ ] Unauthorized students cannot perform admin actions

---

## 14. Return History

- [ ] Returned items are recorded correctly
- [ ] Return history can be viewed by ADMIN
- [ ] Returned item statistics are calculated from database data
- [ ] Categories are displayed correctly
- [ ] Historical information is preserved appropriately

---

## 15. Security

- [ ] Passwords are hashed with BCrypt
- [ ] JWT is validated on protected endpoints
- [ ] Student/Admin authorization is enforced by backend
- [ ] No secrets are committed to Git
- [ ] Database credentials are not exposed in source control
- [ ] Cloudinary secrets are not exposed
- [ ] Private claim verification information is protected
- [ ] Users cannot access another user's private data
- [ ] Ownership is determined from authenticated user
- [ ] Frontend authorization is not treated as the only security layer

---

## 16. API Contract

- [ ] Endpoint names match docs/API_CONTRACT.md
- [ ] HTTP methods match the API contract
- [ ] Request fields match the contract
- [ ] Response fields match the contract
- [ ] HTTP status codes are appropriate
- [ ] Error response format is consistent
- [ ] DTOs are used
- [ ] JPA entities are not directly exposed unnecessarily

---

## 17. Database

- [ ] Database name is correct
- [ ] All six agreed tables exist
- [ ] Primary keys are correct
- [ ] Foreign keys are correct
- [ ] Relationships match DATABASE_SCHEMA.md
- [ ] Required fields are NOT NULL
- [ ] Unique constraints work
- [ ] Duplicate matches are prevented
- [ ] Duplicate claims are prevented
- [ ] Latitude/longitude types are correct
- [ ] Historical records are not accidentally deleted by cascading operations

---

## 18. Frontend

- [ ] React application starts
- [ ] Routes work
- [ ] Navigation works
- [ ] Bootstrap styling works
- [ ] Forms validate correctly
- [ ] API calls use the agreed endpoints
- [ ] Loading states work
- [ ] Error messages are understandable
- [ ] Empty states are handled
- [ ] Unauthorized pages are protected
- [ ] Responsive layout works on reasonable screen sizes

---

## 19. Backend

- [ ] Spring Boot starts
- [ ] All required dependencies work
- [ ] Controllers work
- [ ] Services work
- [ ] Repositories work
- [ ] Validation works
- [ ] Exception handling works
- [ ] Authentication works
- [ ] Authorization works
- [ ] Database queries work
- [ ] API responses match the contract

---

## 20. Git / Pull Request

Before creating a Pull Request:

- [ ] Code is committed to the correct feature branch
- [ ] No secrets are committed
- [ ] No unrelated files are modified
- [ ] Code builds successfully
- [ ] Feature has been tested
- [ ] API contract is respected
- [ ] Database schema is respected
- [ ] PR description explains changes
- [ ] PR includes testing information
- [ ] Shared-file changes are mentioned

---

## 21. Integration Test

The following complete workflow must work:

- [ ] Register
- [ ] Login
- [ ] Report Lost Item
- [ ] Report Found Item
- [ ] Smart Match
- [ ] Notification
- [ ] Submit Claim
- [ ] Admin Verification
- [ ] Approve/Reject
- [ ] Item Returned if approved
- [ ] Notification
- [ ] Dashboard statistics update

---

## 22. Final Demonstration Check

Before college demonstration:

- [ ] Fresh application startup works
- [ ] Database connection works
- [ ] Demo accounts are ready
- [ ] Student workflow works
- [ ] Admin workflow works
- [ ] Lost Item workflow works
- [ ] Found Item workflow works
- [ ] Smart Match works
- [ ] Claim verification works
- [ ] Notifications work
- [ ] Map works
- [ ] Dashboard works
- [ ] Return history works
- [ ] No critical console errors
- [ ] No exposed credentials
- [ ] All team members understand their contribution

---

## 23. Definition of Done

A feature should NOT be marked complete simply because the code exists.

A feature is DONE when:

- [ ] Implemented
- [ ] Validated
- [ ] Tested
- [ ] Integrated
- [ ] Compatible with the API contract
- [ ] Compatible with the database schema
- [ ] Secure
- [ ] Reviewed
- [ ] Ready for demonstration

