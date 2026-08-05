namespace LordsAndLegends.Shared

/// Chapter 1 rules as pure functions. This module is the *only* place a
/// formula is defined; both the API and the UI call into it, so the numbers
/// can never drift between server and client.
module Mechanics =

    // -- Step 4: Calculate Your Modifiers ----------------------------------

    /// Primary Stat modifier: +1 for every 2 points above 10, rounded *down*.
    /// Modifier = floor((value - 10) / 2).
    /// e.g. 7 -> -2, 10 -> 0, 14 -> +2, 24 -> +7.
    let primaryModifier (value: int) : int =
        // floor toward negative infinity (F#'s integer / truncates toward zero).
        int (floor (float (value - 10) / 2.0))

    /// Secondary Stat modifier. Ferocity and Arcana use their value directly.
    /// Willpower has no roll modifier — its value powers abilities — so None.
    let secondaryModifier (stat: SecondaryStat) (value: int) : int option =
        match stat with
        | Willpower -> None
        | Ferocity
        | Arcana -> Some value

    // -- Step 3: Willpower components --------------------------------------

    /// Innate Willpower equals the assigned/rolled Willpower value.
    let innateWillpower (secondary: SecondaryStats) : int = secondary.Willpower

    /// Every character starts with 2 Extended Willpower, regardless of Innate.
    [<Literal>]
    let StartingExtendedWillpower = 2

    // -- Step 5: Derived Stats ---------------------------------------------

    /// Characters begin with a maximum of 2 Injuries.
    [<Literal>]
    let StartingMaxInjuries = 2

    /// Characters always begin at Speed Class 1.
    [<Literal>]
    let StartingSpeedClass = 1

    /// Characters always begin at Soul Tier 0.
    [<Literal>]
    let StartingSoulTier = 0

    /// Starting HP = 2d8 + Vitality modifier. `hpRoll` is the summed 2d8 result.
    let startingMaxHp (hpRoll: int) (vitalityValue: int) : int =
        hpRoll + primaryModifier vitalityValue

    // -- Race modifiers ----------------------------------------------------

    /// Add a race's primary modifiers onto assigned base stats.
    let applyRaceToPrimary (mods: (PrimaryStat * int) list) (p: PrimaryStats) : PrimaryStats =
        mods
        |> List.fold
            (fun (acc: PrimaryStats) (stat, d) ->
                match stat with
                | Might -> { acc with Might = acc.Might + d }
                | Agility -> { acc with Agility = acc.Agility + d }
                | Vitality -> { acc with Vitality = acc.Vitality + d }
                | Intelligence -> { acc with Intelligence = acc.Intelligence + d }
                | Cunning -> { acc with Cunning = acc.Cunning + d }
                | Presence -> { acc with Presence = acc.Presence + d })
            p

    // -- Minor stats inherit their governing major stat's modifier ---------

    /// The modifier contributed by a stat, by name. Primary stats use their
    /// modifier; Ferocity/Arcana use their value; Willpower and anything else 0.
    let statModifierByName (name: string) (primary: PrimaryStats) (secondary: SecondaryStats) : int =
        match name with
        | "Might" -> primaryModifier primary.Might
        | "Agility" -> primaryModifier primary.Agility
        | "Vitality" -> primaryModifier primary.Vitality
        | "Intelligence" -> primaryModifier primary.Intelligence
        | "Cunning" -> primaryModifier primary.Cunning
        | "Presence" -> primaryModifier primary.Presence
        | "Ferocity" -> secondary.Ferocity
        | "Arcana" -> secondary.Arcana
        | _ -> 0

    /// The modifier a minor stat inherits from its governing major stat.
    /// e.g. Might 19 (+4) means every Might minor stat gains +4.
    let minorInheritedModifier (group: string) (primary: PrimaryStats) (secondary: SecondaryStats) : int =
        statModifierByName group primary secondary

    /// A minor stat's effective modifier = its own value + the inherited major
    /// modifier for its group.
    let minorEffective (name: string) (ownValue: int) (primary: PrimaryStats) (secondary: SecondaryStats) : int =
        ownValue + minorInheritedModifier (MinorStats.groupOf name) primary secondary

    /// Add a race's secondary modifiers onto assigned base stats.
    let applyRaceToSecondary (mods: (SecondaryStat * int) list) (s: SecondaryStats) : SecondaryStats =
        mods
        |> List.fold
            (fun (acc: SecondaryStats) (stat, d) ->
                match stat with
                | Willpower -> { acc with Willpower = acc.Willpower + d }
                | Ferocity -> { acc with Ferocity = acc.Ferocity + d }
                | Arcana -> { acc with Arcana = acc.Arcana + d })
            s


/// Stat generation (Chapter 1, Step 3). Deterministic data (the Hard Start
/// arrays) lives here; dice rolling takes the raw die results so it stays pure
/// and testable — callers supply randomness.
module StatGeneration =

    /// Hard Start primary array (6 values), highest-to-lowest, to assign freely.
    let primaryArray =
        function
        | NormalPerson -> [ 12; 10; 10; 8; 8; 6 ]
        | Adventurer -> [ 14; 12; 10; 10; 8; 8 ]

    /// Hard Start secondary array (3 values) for Willpower, Ferocity, Arcana.
    let secondaryArray =
        function
        | NormalPerson -> [ 2; 1; 1 ]
        | Adventurer -> [ 3; 2; 2 ]

    /// Soft Start primary value from four d4 results. Per the rule you may
    /// re-roll a single die showing 1; pass that re-rolled value as
    /// `singleOneReroll` (None to keep the dice as-is). The four dice are summed.
    let softPrimary (dice: int list) (singleOneReroll: int option) : int =
        match singleOneReroll with
        | Some replacement ->
            // Replace the first die showing 1 with the re-rolled value.
            let mutable replaced = false

            dice
            |> List.map (fun d ->
                if d = 1 && not replaced then
                    replaced <- true
                    replacement
                else
                    d)
            |> List.sum
        | None -> List.sum dice

    /// Soft Start secondary value: a single d4 result is the stat value.
    let softSecondary (d4: int) : int = d4

    // -- Standard arrays across BOTH rulebooks -----------------------------

    /// Every standard-array option the creator offers (both rulebooks).
    type ArrayOption =
        | Ch1Normal
        | Ch1Adventurer
        | FinalLow
        | FinalHigh

    let arrayOptions = [ Ch1Normal; Ch1Adventurer; FinalLow; FinalHigh ]

    let arrayLabel =
        function
        | Ch1Normal -> "Chapter 1 — Normal Person"
        | Ch1Adventurer -> "Chapter 1 — Adventurer"
        | FinalLow -> "Final Structure — Standard (Low)"
        | FinalHigh -> "Final Structure — Standard (High)"

    let arrayId =
        function
        | Ch1Normal -> "ch1-normal"
        | Ch1Adventurer -> "ch1-adventurer"
        | FinalLow -> "final-low"
        | FinalHigh -> "final-high"

    let arrayFromId =
        function
        | "ch1-adventurer" -> Ch1Adventurer
        | "final-low" -> FinalLow
        | "final-high" -> FinalHigh
        | _ -> Ch1Normal

    /// Six primary values to assign. NOTE: the Final doc lists only 5 Duo-Spec
    /// values for 6 stats; the 6th is padded here (confirm the intended numbers).
    let primaryPool =
        function
        | Ch1Normal -> [ 12; 10; 10; 8; 8; 6 ]
        | Ch1Adventurer -> [ 14; 12; 10; 10; 8; 8 ]
        | FinalLow -> [ 12; 10; 10; 8; 6; 6 ]
        | FinalHigh -> [ 18; 16; 12; 10; 8; 8 ]

    /// Three secondary values to assign (Willpower / Ferocity / Arcana).
    let secondaryPool =
        function
        | Ch1Normal -> [ 2; 1; 1 ]
        | Ch1Adventurer -> [ 3; 2; 2 ]
        | FinalLow -> [ 2; 2; 1 ]
        | FinalHigh -> [ 4; 4; 3 ]


/// Dice expression parsing, shared by client and any server-side validation.
module Dice =
    /// Parse "2d6" / "d8" (count defaults to 1) into (count, sides). None if invalid.
    let parse (s: string) : (int * int) option =
        let t = s.Trim().ToLowerInvariant().Replace(" ", "")

        if t = "" then
            None
        else
            let parts = t.Split('d')

            if parts.Length = 2 then
                let count =
                    if parts.[0] = "" then
                        1
                    else
                        match System.Int32.TryParse parts.[0] with
                        | true, v -> v
                        | _ -> 0

                match System.Int32.TryParse parts.[1] with
                | true, sides when count > 0 && sides > 0 -> Some(count, sides)
                | _ -> None
            else
                None

    /// Stat names that can supply a modifier to a damage component.
    let statModNames = [ ""; "Might"; "Agility"; "Vitality"; "Intelligence"; "Cunning"; "Presence"; "Ferocity"; "Arcana" ]
