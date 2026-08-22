    # College Lost & Found System — Team Rules

    ## 1. Project Repository

    There is ONE GitHub repository:

    - college-lost-and-found

    There is ONE shared application.

    There is ONE shared database.

    There is ONE shared API contract.

    All developers work from the same repository.

    ---

    ## 2. Technology Stack

    All developers MUST use the agreed stack:

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

    ### Database
    - MySQL 8
    - MySQL Workbench

    ### Other
    - Cloudinary
    - Leaflet
    - OpenStreetMap
    - Chart.js
    - Spring WebSocket where required

    Developers must NOT introduce another framework or database without team agreement.

    ---

    ## 3. Source of Truth Documents

    These three documents are authoritative:

    - docs/PROJECT_SPEC.md
    - docs/DATABASE_SCHEMA.md
    - docs/API_CONTRACT.md

    Before implementing a feature, the developer and their AI assistant MUST read these documents.

    If implementation conflicts with these documents, stop and resolve the conflict before coding.

    ---

    ## 4. Database Rule

    There is exactly ONE shared database design.

    Developers MUST NOT:

    - Create duplicate tables
    - Create separate databases
    - Rename shared columns independently
    - Create alternative versions of existing entities
    - Change relationships without team approval

    The agreed six main tables are:

    - users
    - lost_items
    - found_items
    - matches
    - claims
    - notifications

    ---

    ## 5. API Rule

    Developers MUST follow:

    - docs/API_CONTRACT.md

    Do NOT invent alternative endpoint names.

    For example, if the contract says:

    - /api/lost-items

    do NOT create:

    - /api/lost
    - /api/items/lost
    - /api/lostReports

    If an API change is genuinely necessary:

    1. Discuss it with the team.
    2. Update API_CONTRACT.md.
    3. Inform all affected developers.
    4. Then implement the change.

    ---

    ## 6. Module Ownership

    ### Developer 1 — Me10x

    USER + AUTHENTICATION + PROFILE

    ### Developer 2 — Nived

    LOST ITEM MANAGEMENT

    ### Developer 3 — Sahla

    FOUND ITEMS + SMART MATCHING + CLAIMS

    ### Developer 4 — Nourin

    SEARCH + NOTIFICATIONS + MAP + ADMIN

    A developer should normally modify files belonging to their own module.

    If another module must be changed, communicate with that module's owner first.

    ---

   ## 7. Git Branch Rule

    Nobody develops directly on main.

    main is the stable integration branch.

    Each developer works on their own feature branch.

    Initial feature branches:

    - feature/me10x-auth
    - feature/nived-lost-items
    - feature/sahla-found-matching-claims
    - feature/nourin-search-admin

    Workflow:

    feature branch
    ↓
    development and testing
    ↓
    Pull Request
    ↓
    review
    ↓
    merge into main

    Developers may create additional feature branches when implementing smaller features, if needed.

    ## 8. Main Branch Rule

    Do NOT push directly to main.

    Do NOT force-push main.

    Do NOT reset main to an older commit.

    Do NOT delete main.

    Changes enter main through Pull Requests.

    ---

    ## 9. Before Starting Work

    Before starting work:

    1. Open the repository.
    2. Check the current branch.
    3. Pull the latest changes.
    4. Check whether another developer has changed shared files.
    5. Read the relevant documentation.
    6. Confirm your module boundaries.

    Typical command:

    ```bash
    git checkout feature/<your-feature>
    git pull origin main
    ```

    Then begin work.

    ---

    ## 10. Commit Rules

    Make small, meaningful commits.

    Good:

    - feat: add lost item creation
    - feat: implement JWT login
    - fix: validate claim ownership
    - feat: add search filters

    Avoid:

    - update
    - changes
    - final
    - stuff
    - working
    - AI generated code

    One commit should represent one logical change.

    ---

    ## 11. Push Rule

    Push only your development/feature branch.

    Example:

    ```bash
    git push origin feature/me10x-auth
    git push origin feature/nived-lost-items
    git push origin feature/sahla-found-matching-claims
    git push origin feature/nourin-search-admin
    ```

    Never push unfinished feature work directly to main.

    ---

    ## 12. Pull Request Rule

    When a feature reaches a stable integration point:

    1. Test it locally.
    2. Commit the changes.
    3. Push the branch.
    4. Create a Pull Request.
    5. Explain what was changed.
    6. Explain how it was tested.
    7. Mention any files shared with other modules.

    Example PR description:

    ```md
    Feature:
    Lost Item CRUD

    Changes:
    - Added LostItem entity
    - Added repository
    - Added service
    - Added controller
    - Added DTOs
    - Added validation

    Tested:
    - Create lost item
    - Get lost item
    - Update own item
    - Delete own item

    Known issues:
    None
    ```

    ---

    ## 13. Review Rule

    At least one other team member should review a Pull Request before merging.

    The project leader/developer 1 should normally perform the final integration review.

    Review for:

    - Compilation
    - API compatibility
    - Database compatibility
    - Authentication/authorization
    - Duplicate code
    - Unnecessary changes
    - Security issues
    - Breaking changes
    - Documentation compliance

    ---

    ## 14. Merge Rule

    Merge only after:

    - Code builds
    - Feature works
    - API contract is respected
    - Database schema is respected
    - No obvious regression is introduced
    - Pull Request is reviewed

    Prefer normal Pull Request merging.

    Do not blindly accept every AI-generated change.

    ---

    ## 15. Shared File Rule

    Some files may be used by multiple developers.

    Examples:

    - App.tsx
    - routing configuration
    - shared TypeScript types
    - API configuration
    - security configuration
    - common CSS
    - shared DTOs/entities

    Do NOT modify shared files unnecessarily.

    If two developers need the same file changed:

    1. Communicate first.
    2. Coordinate the changes.
    3. Merge carefully.
    4. Test the integrated result.

    ---

    ## 16. AI Coding Rule

    AI assistants may be used extensively.

    However:

    AI-generated code MUST follow:

    - PROJECT_SPEC.md
    - DATABASE_SCHEMA.md
    - API_CONTRACT.md
    - TEAM_RULES.md

    AI must NOT:

    - Redesign the architecture without approval
    - Add unnecessary technologies
    - Rename shared fields
    - Rename shared APIs
    - Create duplicate entities
    - Create duplicate tables
    - Modify another developer's module unnecessarily
    - Commit or push code without developer review

    The human developer is responsible for understanding and testing the generated code.

    ---

    ## 17. Before Asking AI to Code

    Each developer should provide their AI assistant with:

    1. Project specification
    2. Database schema
    3. API contract
    4. Team rules
    5. Their assigned module

    The AI should be told:

    > This is an existing shared team project. Do not redesign the architecture. Follow the repository documentation.

    ---

    ## 18. Dependency Rule

    Do not add npm/Maven dependencies casually.

    Before adding a dependency:

    1. Check whether the existing stack already provides the required functionality.
    2. Ask the team if the dependency affects architecture or other modules.
    3. Use the smallest reasonable dependency.

    ---

    ## 19. Configuration and Secrets

    Never commit:

    - Passwords
    - JWT secrets
    - Cloudinary API secrets
    - Database passwords
    - API keys
    - Private credentials

    Use appropriate local configuration.

    Never paste secrets into GitHub.

    ---

    ## 20. Merge Conflict Rule

    If Git reports a merge conflict:

    DO NOT blindly choose:

    - "Accept Current"
    - "Accept Incoming"

    First understand both changes.

    If the conflict affects:

    - API contract
    - database entity
    - authentication
    - shared types
    - routing
    - shared configuration

    contact the relevant developer before resolving it.

    After resolving:

    1. Build the application.
    2. Test the affected feature.
    3. Verify the other module still works.

    ---

    ## 21. Integration Rule

    After significant merges, test the end-to-end flow:

    Register
    ↓
    Login
    ↓
    Report Lost Item
    ↓
    Report Found Item
    ↓
    Smart Match
    ↓
    Notification
    ↓
    Claim
    ↓
    Admin Verification
    ↓
    Returned

    A module is not considered fully complete if it works only in isolation but breaks the integrated workflow.

    ---

    ## 22. Definition of Done

    A feature is considered DONE only when:

    - [ ] Code implemented
    - [ ] Validation implemented
    - [ ] Authentication/authorization checked
    - [ ] API contract followed
    - [ ] Database schema followed
    - [ ] Local testing completed
    - [ ] No obvious errors
    - [ ] Git commit created
    - [ ] Pull Request created
    - [ ] Code reviewed
    - [ ] Integrated successfully

    ---

    ## 23. Project Leader

    Developer 1 — Me10x is responsible for:

    - Maintaining project architecture
    - Coordinating the team
    - Reviewing important Pull Requests
    - Maintaining shared contracts
    - Resolving cross-module conflicts
    - Coordinating integration
    - Maintaining main branch stability

    The project leader does NOT need to write everyone else's code.

    ---

    ## 24. Golden Rule

    AI writes code.

    Developers review code.

    The team owns the architecture.

    The documentation is the source of truth.

    main must remain stable.

    ---

    This document defines how the four developers must collaborate.

