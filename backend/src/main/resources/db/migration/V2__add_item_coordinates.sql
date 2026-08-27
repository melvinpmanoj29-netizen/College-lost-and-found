ALTER TABLE lost_items
    ADD COLUMN latitude DECIMAL(10,7) NULL,
    ADD COLUMN longitude DECIMAL(10,7) NULL;

ALTER TABLE found_items
    ADD COLUMN latitude DECIMAL(10,7) NULL,
    ADD COLUMN longitude DECIMAL(10,7) NULL;