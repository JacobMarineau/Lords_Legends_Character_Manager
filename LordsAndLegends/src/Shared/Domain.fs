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
// Per-character collections. These mirror the original app's weapons / spells /
// skills / equipment / languages / micro-stats, but are stored as typed JSONB
// lists on the character (not one table each), so adding a field to any of
// them is a one-line change with no migration.
// ---------------------------------------------------------------------------

type Weapon =
    { Name: string
      DamageDie: string
      Description: string }

type Spell =
    { Name: string
      DamageDie: string
      Cost: string
      ActionType: string
      Description: string }

type Skill =
    { Name: string
      DamageDie: string
      ActionType: string
      Cost: string
      Description: string }

type EquipmentItem =
    { Name: string
      ItemType: string
      Description: string }

/// A granular sub-stat (the original's "micro-stats"): a name and a value.
type MicroStat = { Name: string; Value: int }

[<RequireQualifiedAccess>]
module Items =
    // Spell and Skill share identical field names, so these literals must be
    // annotated or F# infers the last-declared type (Skill) for both.
    let emptyWeapon: Weapon = { Name = ""; DamageDie = ""; Description = "" }
    let emptySpell: Spell = { Name = ""; DamageDie = ""; Cost = ""; ActionType = ""; Description = "" }
    let emptySkill: Skill = { Name = ""; DamageDie = ""; ActionType = ""; Cost = ""; Description = "" }
    let emptyEquipment: EquipmentItem = { Name = ""; ItemType = ""; Description = "" }
    let emptyMicroStat: MicroStat = { Name = ""; Value = 0 }

// ---------------------------------------------------------------------------
// Content references. Races and Vocations are *data*, looked up by id from a
// content store — adding a race or vocation never touches the schema. A race
// applies stat modifiers + Mass and grants passives; a vocation grants a
// starting package (skills, weapons, equipment).
// ---------------------------------------------------------------------------

/// A passive trait granted by a race or vocation.
type Passive = { Name: string; Description: string }

type Race =
    { Id: string
      Name: string
      Mass: int
      PrimaryModifiers: (PrimaryStat * int) list
      SecondaryModifiers: (SecondaryStat * int) list
      Passives: Passive list }

type Vocation =
    { Id: string
      Name: string
      Description: string
      StartingSkills: string list
      StartingWeapons: Weapon list
      StartingEquipment: EquipmentItem list }

// ---------------------------------------------------------------------------
// Minor Stats: a FIXED taxonomy (from the Final Stat Structure doc), each
// governed by a major stat — distinct from the free-form Micro-stats above.
// The taxonomy is data here; a character stores only the values it has set.
// ---------------------------------------------------------------------------

[<RequireQualifiedAccess>]
module MinorStats =
    /// Minor stats grouped by their governing major stat ("Special" = ungoverned).
    let groups: (string * string list) list =
        [ "Might", [ "Athletics"; "Lifting"; "Intimidation" ]
          "Agility", [ "Acrobatics"; "Weapon Mastery"; "Balance"; "Performance" ]
          "Vitality", [ "Endurance"; "Resistance"; "Recovery" ]
          "Intelligence", [ "History"; "Science"; "Technology"; "Foraging" ]
          "Cunning", [ "Sleight of Hand"; "Stealth"; "Instinct"; "Deception" ]
          "Presence", [ "Leadership"; "Persuasion"; "Bargaining"; "Charm" ]
          "Willpower", [ "Feat of Heroism"; "Counter-Charisma"; "Focus" ]
          "Ferocity", [ "Physical Save Modifier" ]
          "Arcana", [ "Magical Knowledge"; "Magic Save Modifier" ]
          "Special", [ "Insight"; "Perception"; "Medicine" ] ]

    /// Flat list of every minor stat name.
    let all = groups |> List.collect snd

    /// The major stat that governs a minor stat ("Special" if ungoverned).
    let groupOf (name: string) =
        groups
        |> List.tryPick (fun (g, names) -> if List.contains name names then Some g else None)
        |> Option.defaultValue "Special"

// ---------------------------------------------------------------------------
// The character aggregate. The 9 ruleset stats are structured records; every
// open-ended list is a typed collection persisted as JSONB. No column-per-item.
// ---------------------------------------------------------------------------

type Character =
    { Id: int
      OwnerId: int
      // Identity
      Name: string
      RaceId: string
      VocationId: string
      Specialty: string
      Height: string
      Age: int
      // Stats
      Primary: PrimaryStats
      Secondary: SecondaryStats
      /// Expendable pool; all characters start with 2 (see Mechanics).
      ExtendedWillpower: int
      // Derived / pools
      MaxHp: int
      CurrentHp: int
      /// Physical density/weight, derived from the chosen Race.
      Mass: int
      Injuries: int
      MaxInjuries: int
      SpeedClass: int
      SoulTier: int
      FocusPoints: int
      /// In-world currency.
      Glint: int
      // Combat sub-values carried over from the original sheet.
      Thp: int
      Ar: int
      Os: int
      Mr: int
      // Collections
      Weapons: Weapon list
      Spells: Spell list
      Skills: Skill list
      Equipment: EquipmentItem list
      Languages: string list
      MicroStats: MicroStat list
      Passives: Passive list
      /// Values for the fixed Minor Stat taxonomy (name -> modifier); unset = 0.
      MinorStats: Map<string, int> }
