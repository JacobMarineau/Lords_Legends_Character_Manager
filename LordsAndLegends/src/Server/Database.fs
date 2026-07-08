module Server.Database

open System
open System.Text.Json
open System.Text.Json.Serialization
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

// -- JSON (for the JSONB collection columns) --------------------------------

let private jsonOptions =
    let o = JsonSerializerOptions()
    o.Converters.Add(JsonFSharpConverter())
    o

let private toJson (v: 'a) : string = JsonSerializer.Serialize(v, jsonOptions)

let private listFromJson<'a> (s: string) : 'a list =
    if String.IsNullOrWhiteSpace s then
        []
    else
        JsonSerializer.Deserialize<'a list>(s, jsonOptions)

// -- Schema bootstrap -------------------------------------------------------

/// Full table for fresh installs. Idempotent (CREATE ... IF NOT EXISTS).
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
        specialty          TEXT    NOT NULL DEFAULT '',
        height             TEXT    NOT NULL DEFAULT '',
        age                INTEGER NOT NULL DEFAULT 0,
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
        focus_points       INTEGER NOT NULL DEFAULT 0,
        glint              INTEGER NOT NULL DEFAULT 0,
        thp                INTEGER NOT NULL DEFAULT 0,
        ar                 INTEGER NOT NULL DEFAULT 0,
        os                 INTEGER NOT NULL DEFAULT 0,
        mr                 INTEGER NOT NULL DEFAULT 0,
        weapons            JSONB   NOT NULL DEFAULT '[]'::jsonb,
        spells             JSONB   NOT NULL DEFAULT '[]'::jsonb,
        skills             JSONB   NOT NULL DEFAULT '[]'::jsonb,
        equipment          JSONB   NOT NULL DEFAULT '[]'::jsonb,
        languages          JSONB   NOT NULL DEFAULT '[]'::jsonb,
        micro_stats        JSONB   NOT NULL DEFAULT '[]'::jsonb,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_character_owner ON character (owner_id);
    """

/// Add columns that older databases (created before the aggregate expansion)
/// may be missing. Each is idempotent, so it is safe to run on every boot.
let private migrationSql =
    """
    ALTER TABLE character ADD COLUMN IF NOT EXISTS specialty    TEXT    NOT NULL DEFAULT '';
    ALTER TABLE character ADD COLUMN IF NOT EXISTS height       TEXT    NOT NULL DEFAULT '';
    ALTER TABLE character ADD COLUMN IF NOT EXISTS age          INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS focus_points INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS glint        INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS thp          INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS ar           INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS os           INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS mr           INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS weapons      JSONB   NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS spells       JSONB   NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS skills       JSONB   NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS equipment    JSONB   NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS languages    JSONB   NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE character ADD COLUMN IF NOT EXISTS micro_stats  JSONB   NOT NULL DEFAULT '[]'::jsonb;
    """

/// Create/upgrade the schema. Retries a few times so a database that is still
/// waking up (Fly Postgres cold start) doesn't crash boot.
let initialize () =
    let run sql =
        connectionString () |> Sql.connect |> Sql.query sql |> Sql.executeNonQuery |> ignore

    let rec attempt remaining =
        try
            run schemaSql
            run migrationSql
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
    |> Sql.query "INSERT INTO app_user (username, password_hash) VALUES (@u, @h) RETURNING id"
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

// JSONB columns are cast to ::text so the driver hands us the raw JSON string.
let private selectColumns =
    "id, owner_id, name, race_id, vocation_id, specialty, height, age, \
     might, agility, vitality, intelligence, cunning, presence, \
     willpower, ferocity, arcana, \
     extended_willpower, max_hp, current_hp, mass, injuries, max_injuries, \
     speed_class, soul_tier, focus_points, glint, thp, ar, os, mr, \
     weapons::text AS weapons, spells::text AS spells, skills::text AS skills, \
     equipment::text AS equipment, languages::text AS languages, \
     micro_stats::text AS micro_stats"

let private toCharacter (read: RowReader) : Character =
    { Id = read.int "id"
      OwnerId = read.int "owner_id"
      Name = read.text "name"
      RaceId = read.text "race_id"
      VocationId = read.text "vocation_id"
      Specialty = read.text "specialty"
      Height = read.text "height"
      Age = read.int "age"
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
      SoulTier = read.int "soul_tier"
      FocusPoints = read.int "focus_points"
      Glint = read.int "glint"
      Thp = read.int "thp"
      Ar = read.int "ar"
      Os = read.int "os"
      Mr = read.int "mr"
      Weapons = listFromJson<Weapon> (read.text "weapons")
      Spells = listFromJson<Spell> (read.text "spells")
      Skills = listFromJson<Skill> (read.text "skills")
      Equipment = listFromJson<EquipmentItem> (read.text "equipment")
      Languages = listFromJson<string> (read.text "languages")
      MicroStats = listFromJson<MicroStat> (read.text "micro_stats") }

/// Every writable column, as (@param, SqlValue). Shared by insert and update.
let private writeParams (c: Character) =
    [ "@name", Sql.text c.Name
      "@race_id", Sql.text c.RaceId
      "@vocation_id", Sql.text c.VocationId
      "@specialty", Sql.text c.Specialty
      "@height", Sql.text c.Height
      "@age", Sql.int c.Age
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
      "@soul_tier", Sql.int c.SoulTier
      "@focus_points", Sql.int c.FocusPoints
      "@glint", Sql.int c.Glint
      "@thp", Sql.int c.Thp
      "@ar", Sql.int c.Ar
      "@os", Sql.int c.Os
      "@mr", Sql.int c.Mr
      "@weapons", Sql.jsonb (toJson c.Weapons)
      "@spells", Sql.jsonb (toJson c.Spells)
      "@skills", Sql.jsonb (toJson c.Skills)
      "@equipment", Sql.jsonb (toJson c.Equipment)
      "@languages", Sql.jsonb (toJson c.Languages)
      "@micro_stats", Sql.jsonb (toJson c.MicroStats) ]

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
            (owner_id, name, race_id, vocation_id, specialty, height, age,
             might, agility, vitality, intelligence, cunning, presence,
             willpower, ferocity, arcana,
             extended_willpower, max_hp, current_hp, mass, injuries, max_injuries,
             speed_class, soul_tier, focus_points, glint, thp, ar, os, mr,
             weapons, spells, skills, equipment, languages, micro_stats)
         VALUES
            (@owner_id, @name, @race_id, @vocation_id, @specialty, @height, @age,
             @might, @agility, @vitality, @intelligence, @cunning, @presence,
             @willpower, @ferocity, @arcana,
             @extended_willpower, @max_hp, @current_hp, @mass, @injuries, @max_injuries,
             @speed_class, @soul_tier, @focus_points, @glint, @thp, @ar, @os, @mr,
             @weapons, @spells, @skills, @equipment, @languages, @micro_stats)
         RETURNING id"
    |> Sql.parameters (("@owner_id", Sql.int c.OwnerId) :: writeParams c)
    |> Sql.executeRowAsync (fun read -> read.int "id")
    |> Async.AwaitTask

/// Update every field of an existing character (scoped by id).
let updateCharacter (c: Character) : Async<unit> =
    async {
        let! _ =
            connectionString ()
            |> Sql.connect
            |> Sql.query
                "UPDATE character SET
                    name=@name, race_id=@race_id, vocation_id=@vocation_id,
                    specialty=@specialty, height=@height, age=@age,
                    might=@might, agility=@agility, vitality=@vitality,
                    intelligence=@intelligence, cunning=@cunning, presence=@presence,
                    willpower=@willpower, ferocity=@ferocity, arcana=@arcana,
                    extended_willpower=@extended_willpower, max_hp=@max_hp,
                    current_hp=@current_hp, mass=@mass, injuries=@injuries,
                    max_injuries=@max_injuries, speed_class=@speed_class,
                    soul_tier=@soul_tier, focus_points=@focus_points, glint=@glint,
                    thp=@thp, ar=@ar, os=@os, mr=@mr,
                    weapons=@weapons, spells=@spells, skills=@skills,
                    equipment=@equipment, languages=@languages, micro_stats=@micro_stats
                 WHERE id=@id"
            |> Sql.parameters (("@id", Sql.int c.Id) :: writeParams c)
            |> Sql.executeNonQueryAsync
            |> Async.AwaitTask

        return ()
    }

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
