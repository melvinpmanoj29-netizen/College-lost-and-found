CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500),
    role ENUM('STUDENT', 'ADMIN') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_users_roll_number (roll_number),
    UNIQUE KEY uk_users_email (email)
);

CREATE TABLE lost_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    image_url VARCHAR(500),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    lost_date_time DATETIME NOT NULL,
    last_seen_location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_date DATETIME,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_lost_items_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE TABLE found_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    image_url VARCHAR(500),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    found_date_time DATETIME NOT NULL,
    found_location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_found_items_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE TABLE matches (
    id BIGINT NOT NULL AUTO_INCREMENT,
    lost_item_id BIGINT NOT NULL,
    found_item_id BIGINT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    match_status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_matches_lost_item
        FOREIGN KEY (lost_item_id)
        REFERENCES lost_items(id),

    CONSTRAINT fk_matches_found_item
        FOREIGN KEY (found_item_id)
        REFERENCES found_items(id)
);

CREATE TABLE claims (
    id BIGINT NOT NULL AUTO_INCREMENT,
    lost_item_id BIGINT NOT NULL,
    found_item_id BIGINT NOT NULL,
    claimant_user_id BIGINT NOT NULL,
    verification_answer TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    reviewed_at DATETIME,
    reviewed_by BIGINT,

    PRIMARY KEY (id),

    CONSTRAINT fk_claims_lost_item
        FOREIGN KEY (lost_item_id)
        REFERENCES lost_items(id),

    CONSTRAINT fk_claims_found_item
        FOREIGN KEY (found_item_id)
        REFERENCES found_items(id),

    CONSTRAINT fk_claims_claimant
        FOREIGN KEY (claimant_user_id)
        REFERENCES users(id),

    CONSTRAINT fk_claims_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_lost_items_user_id
    ON lost_items(user_id);

CREATE INDEX idx_lost_items_category
    ON lost_items(category);

CREATE INDEX idx_lost_items_status
    ON lost_items(status);

CREATE INDEX idx_lost_items_last_seen_location
    ON lost_items(last_seen_location);

CREATE INDEX idx_lost_items_lost_date_time
    ON lost_items(lost_date_time);

CREATE INDEX idx_lost_items_is_urgent
    ON lost_items(is_urgent);

CREATE INDEX idx_lost_items_is_archived
    ON lost_items(is_archived);

CREATE INDEX idx_found_items_user_id
    ON found_items(user_id);

CREATE INDEX idx_found_items_category
    ON found_items(category);

CREATE INDEX idx_found_items_status
    ON found_items(status);

CREATE INDEX idx_found_items_found_location
    ON found_items(found_location);

CREATE INDEX idx_found_items_found_date_time
    ON found_items(found_date_time);

CREATE INDEX idx_matches_lost_item_id
    ON matches(lost_item_id);

CREATE INDEX idx_matches_found_item_id
    ON matches(found_item_id);

CREATE INDEX idx_claims_lost_item_id
    ON claims(lost_item_id);

CREATE INDEX idx_claims_found_item_id
    ON claims(found_item_id);

CREATE INDEX idx_claims_claimant_user_id
    ON claims(claimant_user_id);

CREATE INDEX idx_claims_status
    ON claims(status);

CREATE INDEX idx_notifications_user_id
    ON notifications(user_id);

CREATE INDEX idx_notifications_is_read
    ON notifications(is_read);