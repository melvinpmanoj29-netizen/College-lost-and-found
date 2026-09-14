ALTER TABLE matches
    ADD CONSTRAINT uk_matches_lost_found UNIQUE (lost_item_id, found_item_id);

ALTER TABLE claims
    ADD CONSTRAINT uk_claims_lost_found_claimant UNIQUE (lost_item_id, found_item_id, claimant_user_id);
