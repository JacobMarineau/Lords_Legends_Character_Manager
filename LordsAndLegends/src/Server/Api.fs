module Server.Api

open System.Security.Claims
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Authentication
open LordsAndLegends.Shared

// -- Session helpers --------------------------------------------------------

[<Literal>]
let AuthScheme = "Cookies"

/// Read the signed-in user from the request's cookie-auth claims.
let private currentUser (ctx: HttpContext) : User option =
    let id = ctx.User.FindFirst ClaimTypes.NameIdentifier
    let name = ctx.User.FindFirst ClaimTypes.Name

    if isNull id || isNull name then
        None
    else
        Some { Id = int id.Value; Username = name.Value }

/// Issue the auth cookie for a user.
let private signIn (ctx: HttpContext) (user: User) =
    async {
        let claims =
            [ Claim(ClaimTypes.NameIdentifier, string user.Id)
              Claim(ClaimTypes.Name, user.Username) ]

        let identity = ClaimsIdentity(claims, AuthScheme)
        let principal = ClaimsPrincipal(identity)
        do! ctx.SignInAsync(AuthScheme, principal) |> Async.AwaitTask
    }

// -- Character building (server-authoritative rules) ------------------------

let private buildCharacter (ownerId: int) (nc: NewCharacter) : Character =
    let race = Content.tryFindRace nc.RaceId
    let vocation = Content.tryFindVocation nc.VocationId

    // Race modifiers are applied server-side so they can't be faked client-side.
    let primary =
        match race with
        | Some r -> Mechanics.applyRaceToPrimary r.PrimaryModifiers nc.Primary
        | None -> nc.Primary

    let secondary =
        match race with
        | Some r -> Mechanics.applyRaceToSecondary r.SecondaryModifiers nc.Secondary
        | None -> nc.Secondary

    let mass = race |> Option.map (fun r -> r.Mass) |> Option.defaultValue 0
    let maxHp = Mechanics.startingMaxHp nc.HpRoll primary.Vitality

    let startWeapons = vocation |> Option.map (fun v -> v.StartingWeapons) |> Option.defaultValue []
    let startEquipment = vocation |> Option.map (fun v -> v.StartingEquipment) |> Option.defaultValue []

    { Id = 0
      OwnerId = ownerId
      Name = nc.Name
      RaceId = nc.RaceId
      VocationId = nc.VocationId
      Specialty = nc.Specialty
      Height = nc.Height
      Age = nc.Age
      Primary = primary
      Secondary = secondary
      ExtendedWillpower = Mechanics.StartingExtendedWillpower
      MaxHp = maxHp
      CurrentHp = maxHp
      Mass = mass
      Injuries = 0
      MaxInjuries = Mechanics.StartingMaxInjuries
      SpeedClass = Mechanics.StartingSpeedClass
      SoulTier = Mechanics.StartingSoulTier
      FocusPoints = 0
      Glint = 0
      Thp = 0
      Ar = 0
      Os = 0
      Mr = 0
      Weapons = startWeapons
      Spells = []
      Skills = []
      Equipment = startEquipment
      Languages = []
      MicroStats = []
      Passives = []
      MinorStats = nc.MinorStats }

// -- Auth API ---------------------------------------------------------------

let authApiFor (ctx: HttpContext) : IAuthApi =
    { register =
        fun creds ->
            async {
                let username = creds.Username.Trim()

                if username = "" || creds.Password = "" then
                    return Error "Username and password are required."
                else
                    let! existing = Database.getUserByUsername username

                    match existing with
                    | Some _ -> return Error "That username is already taken."
                    | None ->
                        let hash = BCrypt.Net.BCrypt.HashPassword creds.Password
                        let! id = Database.insertUser username hash
                        let user = { Id = id; Username = username }
                        do! signIn ctx user
                        return Ok user
            }

      login =
        fun creds ->
            async {
                let username = creds.Username.Trim()
                let! found = Database.getUserByUsername username

                match found with
                | Some(id, hash) when BCrypt.Net.BCrypt.Verify(creds.Password, hash) ->
                    let user = { Id = id; Username = username }
                    do! signIn ctx user
                    return Ok user
                | _ -> return Error "Invalid username or password."
            }

      logout = fun () -> async { do! ctx.SignOutAsync AuthScheme |> Async.AwaitTask }

      getCurrentUser = fun () -> async { return currentUser ctx } }

// -- Character API (every method scoped to the signed-in user) --------------

let characterApiFor (ctx: HttpContext) : ICharacterApi =
    let requireUser () =
        match currentUser ctx with
        | Some u -> u
        | None -> failwith "You must be signed in."

    { getContent = fun () -> async { return Content.content }

      getCharacters =
        fun () ->
            async {
                match currentUser ctx with
                | Some u -> return! Database.getCharactersByOwner u.Id
                | None -> return []
            }

      // Ownership check: only return the character if it belongs to the caller.
      getCharacter =
        fun id ->
            async {
                let! c = Database.getCharacter id
                let me = currentUser ctx |> Option.map (fun u -> u.Id)
                return c |> Option.filter (fun ch -> Some ch.OwnerId = me)
            }

      createCharacter =
        fun nc ->
            async {
                let u = requireUser ()
                let character = buildCharacter u.Id nc
                let! id = Database.insertCharacter character
                return { character with Id = id }
            }

      // Save the whole aggregate — but only if it belongs to the caller, and
      // force the stored owner to the caller (can't reassign to someone else).
      updateCharacter =
        fun incoming ->
            async {
                let u = requireUser ()
                let! existing = Database.getCharacter incoming.Id

                match existing with
                | Some ch when ch.OwnerId = u.Id ->
                    let toSave = { incoming with OwnerId = u.Id }
                    do! Database.updateCharacter toSave
                    return toSave
                | _ -> return failwith "Character not found."
            }

      // Only delete if the character belongs to the caller (fixes the old IDOR).
      deleteCharacter =
        fun id ->
            async {
                let u = requireUser ()
                let! c = Database.getCharacter id

                match c with
                | Some ch when ch.OwnerId = u.Id -> return! Database.deleteCharacter id
                | _ -> return ()
            }
    }
