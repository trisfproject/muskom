-- 073_secure_voting_system.sql
-- Decouples the voting system into voter_receipts and ballots to ensure 
-- Secret Ballot and database-level Double Voting Protection.

-- 1. Safely archive existing vulnerable votes table instead of dropping
ALTER TABLE IF EXISTS votes RENAME TO legacy_votes_backup;

-- 2. Create voter_receipts table (Who Voted)
CREATE TABLE IF NOT EXISTS voter_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_voter_receipts_participant UNIQUE (participant_id),
    CONSTRAINT fk_voter_receipts_participants FOREIGN KEY (participant_id) REFERENCES participants (id) ON DELETE RESTRICT
);

-- 3. Create ballots table (The Votes)
CREATE TABLE IF NOT EXISTS ballots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL,
    -- Intentionally NO timestamps to prevent correlation attacks
    CONSTRAINT fk_ballots_candidates FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE RESTRICT
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_ballots_candidate_id ON ballots (candidate_id);
