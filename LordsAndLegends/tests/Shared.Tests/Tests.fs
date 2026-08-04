module Shared.Tests

open Xunit
open LordsAndLegends.Shared

// ---------------------------------------------------------------------------
// These tests pin the Chapter 1 rules to the exact tables in the design doc,
// so a future rule change that breaks the numbers fails loudly here.
// ---------------------------------------------------------------------------

[<Theory>]
// (stat value, expected modifier) — straight from the Primary Stat Modifiers table.
[<InlineData(7, -2)>]
[<InlineData(6, -2)>]
[<InlineData(8, -1)>]
[<InlineData(9, -1)>]
[<InlineData(10, 0)>]
[<InlineData(11, 0)>]
[<InlineData(12, 1)>]
[<InlineData(13, 1)>]
[<InlineData(14, 2)>]
[<InlineData(15, 2)>]
[<InlineData(16, 3)>]
[<InlineData(17, 3)>]
[<InlineData(18, 4)>]
[<InlineData(19, 4)>]
[<InlineData(20, 5)>]
[<InlineData(21, 5)>]
[<InlineData(22, 6)>]
[<InlineData(23, 6)>]
[<InlineData(24, 7)>]
[<InlineData(25, 7)>]
let ``primary modifier matches the published table`` (value: int) (expected: int) =
    Assert.Equal(expected, Mechanics.primaryModifier value)

[<Fact>]
let ``Ferocity and Arcana modifiers equal their value`` () =
    Assert.Equal(Some 3, Mechanics.secondaryModifier Ferocity 3)
    Assert.Equal(Some 4, Mechanics.secondaryModifier Arcana 4)

[<Fact>]
let ``Willpower has no roll modifier`` () =
    Assert.Equal(None, Mechanics.secondaryModifier Willpower 5)

[<Fact>]
let ``Innate Willpower is the assigned Willpower value`` () =
    let secondary = { Willpower = 2; Ferocity = 1; Arcana = 1 }
    Assert.Equal(2, Mechanics.innateWillpower secondary)

[<Fact>]
let ``everyone starts with 2 Extended Willpower regardless of Innate`` () =
    Assert.Equal(2, Mechanics.StartingExtendedWillpower)

[<Fact>]
let ``starting derived constants match the doc`` () =
    Assert.Equal(2, Mechanics.StartingMaxInjuries)
    Assert.Equal(1, Mechanics.StartingSpeedClass)
    Assert.Equal(0, Mechanics.StartingSoulTier)

[<Theory>]
// HP = 2d8 + Vitality modifier. (2d8 roll, vitality value, expected max HP)
[<InlineData(10, 14, 12)>] // +2 vit mod
[<InlineData(9, 10, 9)>] //  +0 vit mod
[<InlineData(8, 8, 7)>] //   -1 vit mod
let ``starting max HP adds the Vitality modifier to the 2d8 roll`` (roll: int) (vit: int) (expected: int) =
    Assert.Equal(expected, Mechanics.startingMaxHp roll vit)

[<Fact>]
let ``hard start arrays match the doc`` () =
    Assert.Equal<int list>([ 12; 10; 10; 8; 8; 6 ], StatGeneration.primaryArray NormalPerson)
    Assert.Equal<int list>([ 14; 12; 10; 10; 8; 8 ], StatGeneration.primaryArray Adventurer)
    Assert.Equal<int list>([ 2; 1; 1 ], StatGeneration.secondaryArray NormalPerson)
    Assert.Equal<int list>([ 3; 2; 2 ], StatGeneration.secondaryArray Adventurer)

[<Fact>]
let ``minor stats inherit their governing major stat modifier`` () =
    let primary =
        { Might = 19
          Agility = 10
          Vitality = 10
          Intelligence = 10
          Cunning = 10
          Presence = 10 }

    let secondary = { Willpower = 2; Ferocity = 3; Arcana = 4 }
    // Might 19 -> +4; Athletics own value 4 -> effective +8.
    Assert.Equal(8, Mechanics.minorEffective "Athletics" 4 primary secondary)
    // Ferocity group inherits the Ferocity value (3); own 0 -> 3.
    Assert.Equal(3, Mechanics.minorEffective "Physical Save Modifier" 0 primary secondary)
    // Special/ungoverned inherits nothing; Perception own 2 -> 2.
    Assert.Equal(2, Mechanics.minorEffective "Perception" 2 primary secondary)

[<Fact>]
let ``soft primary sums four d4 and re-rolls a single 1`` () =
    // No reroll: just the sum.
    Assert.Equal(10, StatGeneration.softPrimary [ 4; 3; 2; 1 ] None)
    // Reroll the single 1 (became a 4): 4 + 3 + 2 + 4 = 13.
    Assert.Equal(13, StatGeneration.softPrimary [ 4; 3; 2; 1 ] (Some 4))
    // Only the first 1 is replaced: 4 + 1 + 1 + 1 = 7.
    Assert.Equal(7, StatGeneration.softPrimary [ 1; 1; 1; 1 ] (Some 4))
