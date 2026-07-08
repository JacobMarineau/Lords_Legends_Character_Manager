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
