-- Lords & Legends — database schema (SAFE rebuild).
-- Committed to version control on purpose: the original app's character table
-- lived only in the live DB, which made the deploy non-reproducible.
--
-- Design note: the 9 Major Stats are fixed by the ruleset, so they are plain
-- columns (cheap to query). Everything open-ended — skills, inventory — is
-- JSONB, so adding content never requires a migration. This is the deliberate
-- opposite of the old ~50-column "one column per skill" table.

CREATE TABLE IF NOT EXISTS app_user (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(1000) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS character (
    id                 SERIAL PRIMARY KEY,
    owner_id           INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    name               TEXT    NOT NULL,
    race_id            TEXT    NOT NULL,
    vocation_id        TEXT    NOT NULL,

    -- Primary Stats (Chapter 1, Step 3)
    might              INTEGER NOT NULL,
    agility            INTEGER NOT NULL,
    vitality           INTEGER NOT NULL,
    intelligence       INTEGER NOT NULL,
    cunning            INTEGER NOT NULL,
    presence           INTEGER NOT NULL,

    -- Secondary Stats
    willpower          INTEGER NOT NULL,
    ferocity           INTEGER NOT NULL,
    arcana             INTEGER NOT NULL,

    -- Pools & derived stats (Chapter 1, Step 5)
    extended_willpower INTEGER NOT NULL,
    max_hp             INTEGER NOT NULL,
    current_hp         INTEGER NOT NULL,
    mass               INTEGER NOT NULL,
    injuries           INTEGER NOT NULL,
    max_injuries       INTEGER NOT NULL,
    speed_class        INTEGER NOT NULL,
    soul_tier          INTEGER NOT NULL,

    -- Flexible, content-driven collections (no column-per-skill).
    skills             JSONB   NOT NULL DEFAULT '[]'::jsonb,
    inventory          JSONB   NOT NULL DEFAULT '[]'::jsonb,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_character_owner ON character (owner_id);
