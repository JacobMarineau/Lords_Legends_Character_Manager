namespace LordsAndLegends.Shared

// ---------------------------------------------------------------------------
// Core character vocabulary (Chapter 1, Step 3: "Determine Your Major Stats").
// These types are the single source of truth, shared by server and client.
// ---------------------------------------------------------------------------

/// The six Primary Stats. Their modifiers scale off a baseline of 10.
type PrimaryStat =
    | Might
    | Agility
    | Vitality
    | Intelligence
    | Cunning
    | Presence

/// The three Secondary Stats. Willpower is special — it has no roll modifier;
/// its value is the character's Innate Willpower, which powers abilities.
type SecondaryStat =
    | Willpower
    | Ferocity
    | Arcana

[<RequireQualifiedAccess>]
module PrimaryStat =
    /// Canonical ordering used for assigning the Hard Start arrays.
    let all = [ Might; Agility; Vitality; Intelligence; Cunning; Presence ]

    let name =
        function
        | Might -> "Might"
        | Agility -> "Agility"
        | Vitality -> "Vitality"
        | Intelligence -> "Intelligence"
        | Cunning -> "Cunning"
        | Presence -> "Presence"

[<RequireQualifiedAccess>]
module SecondaryStat =
    /// Canonical ordering: Willpower, Ferocity, Arcana.
    let all = [ Willpower; Ferocity; Arcana ]

    let name =
        function
        | Willpower -> "Willpower"
        | Ferocity -> "Ferocity"
        | Arcana -> "Arcana"

/// A character's assigned Primary Stat values.
type PrimaryStats =
    { Might: int
      Agility: int
      Vitality: int
      Intelligence: int
      Cunning: int
      Presence: int }

    member this.Value(stat: PrimaryStat) =
        match stat with
        | Might -> this.Might
        | Agility -> this.Agility
        | Vitality -> this.Vitality
        | Intelligence -> this.Intelligence
        | Cunning -> this.Cunning
        | Presence -> this.Presence

/// A character's assigned Secondary Stat values.
type SecondaryStats =
    { Willpower: int
      Ferocity: int
      Arcana: int }

    member this.Value(stat: SecondaryStat) =
        match stat with
        | Willpower -> this.Willpower
        | Ferocity -> this.Ferocity
        | Arcana -> this.Arcana

/// How a player generated their stats (Chapter 1, Step 3).
type StartingArray =
    | NormalPerson
    | Adventurer

// ---------------------------------------------------------------------------
// Content references. Races and Vocations are *data*, not code — they are
// looked up by id from a content store (JSON now, DB/admin later) so adding a
// race from Chapter 2 or a vocation from Chapter 3 never touches the schema.
// ---------------------------------------------------------------------------

/// A passive trait granted by a race or vocation.
type Passive = { Name: string; Description: string }

/// A playable race (Chapter 2). `Mass` feeds the derived Mass stat.
type Race =
    { Id: string
      Name: string
      Mass: int
      PrimaryModifiers: (PrimaryStat * int) list
      SecondaryModifiers: (SecondaryStat * int) list
      Passives: Passive list }

/// A starting Vocation (Chapter 3): a curated background package.
type Vocation =
    { Id: string
      Name: string
      Description: string
      StartingSkills: string list }

// ---------------------------------------------------------------------------
// The character itself. Note what is NOT here: a column per skill. Flexible,
// content-driven collections (skills, inventory) hang off this by id.
// ---------------------------------------------------------------------------

type Character =
    { Id: int
      OwnerId: int
      Name: string
      RaceId: string
      VocationId: string
      Primary: PrimaryStats
      Secondary: SecondaryStats
      /// Expendable pool; all characters start with 2 (see Mechanics).
      ExtendedWillpower: int
      MaxHp: int
      CurrentHp: int
      /// Physical density/weight, derived from the chosen Race.
      Mass: int
      Injuries: int
      MaxInjuries: int
      SpeedClass: int
      SoulTier: int }
