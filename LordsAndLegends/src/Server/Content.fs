module Server.Content

open LordsAndLegends.Shared

// Placeholder content until Chapter 2 (Races) and Chapter 3 (Vocations) are
// written. This is the "data, not columns" approach: adding or changing a race
// is editing this list — no schema migration, no touching the API or the UI.
// When the chapters land, this can move to JSON/DB without changing any types.

let races: Race list =
    [ { Id = "novorian"
        Name = "Novorian"
        Mass = 10
        PrimaryModifiers = [ Might, 1; Agility, 1; Intelligence, 1; Presence, -2 ]
        SecondaryModifiers = []
        Passives =
          [ { Name = "Novorian Presence"
              Description = "Wisdom can be used in place of a general Presence check." } ] }
      { Id = "madorian"
        Name = "Madorian"
        Mass = 14
        PrimaryModifiers = [ Might, 2; Agility, 2; Intelligence, -1 ]
        SecondaryModifiers = []
        Passives =
          [ { Name = "Madorian Resolve"
              Description = "Leadership checks have a low cap of 10." } ] }
      { Id = "abrigian"
        Name = "Abrigian"
        Mass = 9
        PrimaryModifiers = [ Intelligence, 2; Might, -1; Agility, -1 ]
        SecondaryModifiers = [ Willpower, 3; Ferocity, 1 ]
        Passives =
          [ { Name = "Abrigian Presence"
              Description = "Willpower can be used in place of Presence rolls." } ] } ]

let vocations: Vocation list =
    [ { Id = "warrior"
        Name = "Warrior"
        Description = "A frontline combatant trained with steel and shield."
        StartingSkills = [ "Weapon Mastery"; "Athletics" ] }
      { Id = "scholar"
        Name = "Scholar"
        Description = "A student of history and the arcane sciences."
        StartingSkills = [ "History"; "Science" ] }
      { Id = "rogue"
        Name = "Rogue"
        Description = "A quick-fingered survivor who works from the shadows."
        StartingSkills = [ "Stealth"; "Sleight of Hand" ] } ]

let content: Content = { Races = races; Vocations = vocations }

let tryFindRace (raceId: string) = races |> List.tryFind (fun r -> r.Id = raceId)
