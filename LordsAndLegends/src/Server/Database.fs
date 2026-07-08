module Server.Database

open System
open Npgsql.FSharp
open LordsAndLegends.Shared

/// Build a connection string. In production a DATABASE_URL (postgres://...) is
/// provided by the host (Fly/Heroku-style); locally we fall back to the dev DB
/// using the current OS user with trust auth (Homebrew default).
let connectionString () =
    match Environment.GetEnvironmentVariable "DATABASE_URL" with
    | null
    | "" ->
        let user =
            match Environment.GetEnvironmentVariable "USER" with
            | null
            | "" -> "postgres"
            | u -> u

        Sql.host "localhost"
        |> Sql.database "lords_legends_dev"
        |> Sql.username user
        |> Sql.formatConnectionString
    | url ->
        // Convert a postgres:// URI into an Npgsql connection string, honoring
        // the ?sslmode= hint (Fly's private network uses sslmode=disable).
        let uri = Uri(url)
        let userInfo = uri.UserInfo.Split(':')

        let ssl =
            if uri.Query.Contains "sslmode=disable" then SslMode.Disable
            elif uri.Query.Contains "sslmode=require" then SslMode.Require
            else SslMode.Prefer

        Sql.host uri.Host
        |> Sql.port (if uri.Port > 0 then uri.Port else 5432)
        |> Sql.database (uri.AbsolutePath.TrimStart('/'))
        |> Sql.username userInfo.[0]
        |> Sql.password (if userInfo.Length > 1 then userInfo.[1] else "")
        |> Sql.sslMode ssl
        |> Sql.formatConnectionString

// -- Schema bootstrap -------------------------------------------------------

/// DDL kept in sync with database/schema.sql. Idempotent, so the server can
/// safely create its own tables on startup — the production deploy needs no
/// manual migration step.
let private schemaSql =
    """
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
        might              INTEGER NOT NULL,
        agility            INTEGER NOT NULL,
        vitality           INTEGER NOT NULL,
        intelligence       INTEGER NOT NULL,
        cunning            INTEGER NOT NULL,
        presence           INTEGER NOT NULL,
        willpower          INTEGER NOT NULL,
        ferocity           INTEGER NOT NULL,
        arcana             INTEGER NOT NULL,
        extended_willpower INTEGER NOT NULL,
        max_hp             INTEGER NOT NULL,
        current_hp         INTEGER NOT NULL,
        mass               INTEGER NOT NULL,
        injuries           INTEGER NOT NULL,
        max_injuries       INTEGER NOT NULL,
        speed_class        INTEGER NOT NULL,
        soul_tier          INTEGER NOT NULL,
        skills             JSONB   NOT NULL DEFAULT '[]'::jsonb,
        inventory          JSONB   NOT NULL DEFAULT '[]'::jsonb,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_character_owner ON character (owner_id);
    """

/// Create the schema if it doesn't exist. Retries a few times so a database
/// that is still waking up (Fly Postgres cold start) doesn't crash boot.
let initialize () =
    let rec attempt remaining =
        try
            connectionString ()
            |> Sql.connect
            |> Sql.query schemaSql
            |> Sql.executeNonQuery
            |> ignore

            printfn "Database schema ready."
        with ex when remaining > 0 ->
            eprintfn "DB not ready (%s); retrying in 2s (%d left)..." ex.Message remaining
            System.Threading.Thread.Sleep 2000
            attempt (remaining - 1)

    attempt 10

// -- Users -----------------------------------------------------------------

/// Insert a user with a pre-hashed password; returns the new id.
let insertUser (username: string) (passwordHash: string) : Async<int> =
    connectionString ()
    |> Sql.connect
    |> Sql.query
        "INSERT INTO app_user (username, password_hash) VALUES (@u, @h) RETURNING id"
    |> Sql.parameters [ "@u", Sql.text username; "@h", Sql.text passwordHash ]
    |> Sql.executeRowAsync (fun read -> read.int "id")
    |> Async.AwaitTask

/// Look up a user by username, returning (id, passwordHash) if present.
let getUserByUsername (username: string) : Async<(int * string) option> =
    async {
        let! rows =
            connectionString ()
            |> Sql.connect
            |> Sql.query "SELECT id, password_hash FROM app_user WHERE username = @u"
            |> Sql.parameters [ "@u", Sql.text username ]
            |> Sql.executeAsync (fun read -> read.int "id", read.text "password_hash")
            |> Async.AwaitTask

        return List.tryHead rows
    }

// -- Characters -------------------------------------------------------------

let private selectColumns =
    "id, owner_id, name, race_id, vocation_id, \
     might, agility, vitality, intelligence, cunning, presence, \
     willpower, ferocity, arcana, \
     extended_willpower, max_hp, current_hp, mass, injuries, max_injuries, \
     speed_class, soul_tier"

let private toCharacter (read: RowReader) : Character =
    { Id = read.int "id"
      OwnerId = read.int "owner_id"
      Name = read.text "name"
      RaceId = read.text "race_id"
      VocationId = read.text "vocation_id"
      Primary =
        { Might = read.int "might"
          Agility = read.int "agility"
          Vitality = read.int "vitality"
          Intelligence = read.int "intelligence"
          Cunning = read.int "cunning"
          Presence = read.int "presence" }
      Secondary =
        { Willpower = read.int "willpower"
          Ferocity = read.int "ferocity"
          Arcana = read.int "arcana" }
      ExtendedWillpower = read.int "extended_willpower"
      MaxHp = read.int "max_hp"
      CurrentHp = read.int "current_hp"
      Mass = read.int "mass"
      Injuries = read.int "injuries"
      MaxInjuries = read.int "max_injuries"
      SpeedClass = read.int "speed_class"
      SoulTier = read.int "soul_tier" }

let getCharactersByOwner (ownerId: int) : Async<Character list> =
    connectionString ()
    |> Sql.connect
    |> Sql.query (sprintf "SELECT %s FROM character WHERE owner_id = @owner ORDER BY id" selectColumns)
    |> Sql.parameters [ "@owner", Sql.int ownerId ]
    |> Sql.executeAsync toCharacter
    |> Async.AwaitTask

let getCharacter (id: int) : Async<Character option> =
    async {
        let! rows =
            connectionString ()
            |> Sql.connect
            |> Sql.query (sprintf "SELECT %s FROM character WHERE id = @id" selectColumns)
            |> Sql.parameters [ "@id", Sql.int id ]
            |> Sql.executeAsync toCharacter
            |> Async.AwaitTask

        return List.tryHead rows
    }

/// Insert a character and return its new id. Id on the input is ignored.
let insertCharacter (c: Character) : Async<int> =
    connectionString ()
    |> Sql.connect
    |> Sql.query
        "INSERT INTO character
            (owner_id, name, race_id, vocation_id,
             might, agility, vitality, intelligence, cunning, presence,
             willpower, ferocity, arcana,
             extended_willpower, max_hp, current_hp, mass, injuries, max_injuries,
             speed_class, soul_tier)
         VALUES
            (@owner_id, @name, @race_id, @vocation_id,
             @might, @agility, @vitality, @intelligence, @cunning, @presence,
             @willpower, @ferocity, @arcana,
             @extended_willpower, @max_hp, @current_hp, @mass, @injuries, @max_injuries,
             @speed_class, @soul_tier)
         RETURNING id"
    |> Sql.parameters
        [ "@owner_id", Sql.int c.OwnerId
          "@name", Sql.text c.Name
          "@race_id", Sql.text c.RaceId
          "@vocation_id", Sql.text c.VocationId
          "@might", Sql.int c.Primary.Might
          "@agility", Sql.int c.Primary.Agility
          "@vitality", Sql.int c.Primary.Vitality
          "@intelligence", Sql.int c.Primary.Intelligence
          "@cunning", Sql.int c.Primary.Cunning
          "@presence", Sql.int c.Primary.Presence
          "@willpower", Sql.int c.Secondary.Willpower
          "@ferocity", Sql.int c.Secondary.Ferocity
          "@arcana", Sql.int c.Secondary.Arcana
          "@extended_willpower", Sql.int c.ExtendedWillpower
          "@max_hp", Sql.int c.MaxHp
          "@current_hp", Sql.int c.CurrentHp
          "@mass", Sql.int c.Mass
          "@injuries", Sql.int c.Injuries
          "@max_injuries", Sql.int c.MaxInjuries
          "@speed_class", Sql.int c.SpeedClass
          "@soul_tier", Sql.int c.SoulTier ]
    |> Sql.executeRowAsync (fun read -> read.int "id")
    |> Async.AwaitTask

let deleteCharacter (id: int) : Async<unit> =
    async {
        let! _ =
            connectionString ()
            |> Sql.connect
            |> Sql.query "DELETE FROM character WHERE id = @id"
            |> Sql.parameters [ "@id", Sql.int id ]
            |> Sql.executeNonQueryAsync
            |> Async.AwaitTask

        return ()
    }
