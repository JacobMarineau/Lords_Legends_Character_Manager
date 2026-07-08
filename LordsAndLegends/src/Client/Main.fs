module Client.Main

open Elmish
open Elmish.React
open Feliz
open LordsAndLegends.Shared

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

type Page =
    | CharacterList
    | CreateForm

type AuthMode =
    | LoginMode
    | RegisterMode

type Model =
    { // Auth
      CheckingAuth: bool
      CurrentUser: User option
      AuthMode: AuthMode
      Username: string
      Password: string
      AuthError: string option
      // App
      Content: Content option
      Characters: Character list
      Page: Page
      Loading: bool
      Error: string option
      // Creation form
      Name: string
      RaceId: string
      VocationId: string
      Array: StartingArray
      HpRoll: int }

type Msg =
    // Auth
    | GotCurrentUser of User option
    | SetUsername of string
    | SetPassword of string
    | SetAuthMode of AuthMode
    | SubmitAuth
    | AuthResult of Result<User, string>
    | Logout
    | LoggedOut
    // App
    | ContentLoaded of Content
    | CharactersLoaded of Character list
    | GoTo of Page
    | SetName of string
    | SetRace of string
    | SetVocation of string
    | SetArray of StartingArray
    | SetHpRoll of int
    | Submit
    | Created of Character
    | Delete of int
    | Deleted of int
    | Failed of exn

// ---------------------------------------------------------------------------
// Init / update
// ---------------------------------------------------------------------------

let init () =
    let model =
        { CheckingAuth = true
          CurrentUser = None
          AuthMode = LoginMode
          Username = ""
          Password = ""
          AuthError = None
          Content = None
          Characters = []
          Page = CharacterList
          Loading = false
          Error = None
          Name = ""
          RaceId = ""
          VocationId = ""
          Array = NormalPerson
          HpRoll = 9 }

    model, Cmd.OfAsync.either Api.authApi.getCurrentUser () GotCurrentUser Failed

/// Commands to run once we know who the user is: load content + their characters.
let private loadAppData =
    Cmd.batch
        [ Cmd.OfAsync.either Api.characterApi.getContent () ContentLoaded Failed
          Cmd.OfAsync.either Api.characterApi.getCharacters () CharactersLoaded Failed ]

/// Turn the chosen Hard Start array + form choices into a NewCharacter.
/// (Values are assigned in canonical stat order for now; free re-assignment is
/// a planned enhancement.)
let private buildNewCharacter (m: Model) : NewCharacter =
    let p = StatGeneration.primaryArray m.Array
    let s = StatGeneration.secondaryArray m.Array

    { Name = m.Name
      RaceId = m.RaceId
      VocationId = m.VocationId
      Primary =
        { Might = p.[0]
          Agility = p.[1]
          Vitality = p.[2]
          Intelligence = p.[3]
          Cunning = p.[4]
          Presence = p.[5] }
      Secondary =
        { Willpower = s.[0]
          Ferocity = s.[1]
          Arcana = s.[2] }
      HpRoll = m.HpRoll }

let update (msg: Msg) (model: Model) =
    match msg with
    // -- Auth --
    | GotCurrentUser(Some user) -> { model with CheckingAuth = false; CurrentUser = Some user }, loadAppData
    | GotCurrentUser None -> { model with CheckingAuth = false; CurrentUser = None }, Cmd.none
    | SetUsername u -> { model with Username = u }, Cmd.none
    | SetPassword p -> { model with Password = p }, Cmd.none
    | SetAuthMode m -> { model with AuthMode = m; AuthError = None }, Cmd.none
    | SubmitAuth ->
        let creds = { Username = model.Username; Password = model.Password }

        let call =
            match model.AuthMode with
            | LoginMode -> Api.authApi.login
            | RegisterMode -> Api.authApi.register

        { model with Loading = true; AuthError = None }, Cmd.OfAsync.either call creds AuthResult Failed
    | AuthResult(Ok user) ->
        { model with
            Loading = false
            CurrentUser = Some user
            Password = ""
            AuthError = None },
        loadAppData
    | AuthResult(Error e) -> { model with Loading = false; AuthError = Some e }, Cmd.none
    | Logout -> model, Cmd.OfAsync.either Api.authApi.logout () (fun () -> LoggedOut) Failed
    | LoggedOut ->
        { model with
            CurrentUser = None
            Characters = []
            Username = ""
            Password = ""
            Page = CharacterList },
        Cmd.none
    // -- App --
    | ContentLoaded content ->
        let firstRace = content.Races |> List.tryHead |> Option.map (fun r -> r.Id) |> Option.defaultValue ""
        let firstVoc = content.Vocations |> List.tryHead |> Option.map (fun v -> v.Id) |> Option.defaultValue ""

        { model with
            Content = Some content
            RaceId = (if model.RaceId = "" then firstRace else model.RaceId)
            VocationId = (if model.VocationId = "" then firstVoc else model.VocationId) },
        Cmd.none
    | CharactersLoaded characters -> { model with Characters = characters }, Cmd.none
    | GoTo page -> { model with Page = page; Error = None }, Cmd.none
    | SetName name -> { model with Name = name }, Cmd.none
    | SetRace id -> { model with RaceId = id }, Cmd.none
    | SetVocation id -> { model with VocationId = id }, Cmd.none
    | SetArray arr -> { model with Array = arr }, Cmd.none
    | SetHpRoll n -> { model with HpRoll = n }, Cmd.none
    | Submit ->
        { model with Loading = true; Error = None },
        Cmd.OfAsync.either Api.characterApi.createCharacter (buildNewCharacter model) Created Failed
    | Created character ->
        { model with
            Characters = model.Characters @ [ character ]
            Page = CharacterList
            Loading = false
            Name = "" },
        Cmd.none
    | Delete id -> model, Cmd.OfAsync.either Api.characterApi.deleteCharacter id (fun () -> Deleted id) Failed
    | Deleted id -> { model with Characters = model.Characters |> List.filter (fun c -> c.Id <> id) }, Cmd.none
    | Failed ex -> { model with Loading = false; CheckingAuth = false; Error = Some ex.Message }, Cmd.none

// ---------------------------------------------------------------------------
// View helpers
// ---------------------------------------------------------------------------

let private fmtMod (n: int) = if n >= 0 then sprintf "+%d" n else string n

let private raceName (content: Content option) (raceId: string) =
    content
    |> Option.bind (fun c -> c.Races |> List.tryFind (fun r -> r.Id = raceId))
    |> Option.map (fun r -> r.Name)
    |> Option.defaultValue raceId

let private vocationName (content: Content option) (vocId: string) =
    content
    |> Option.bind (fun c -> c.Vocations |> List.tryFind (fun v -> v.Id = vocId))
    |> Option.map (fun v -> v.Name)
    |> Option.defaultValue vocId

/// One color-coded stat tile. `variant` is a CSS modifier like "ll-stat--might"
/// (empty for the neutral derived-stat tiles).
let private statTile (variant: string) (label: string) (value: string) (sub: string) =
    Html.div
        [ prop.className (if variant = "" then "ll-stat" else "ll-stat " + variant)
          prop.children
              [ Html.div [ prop.className "ll-stat__label"; prop.text label ]
                Html.div [ prop.className "ll-stat__value"; prop.text value ]
                Html.div [ prop.className "ll-stat__mod"; prop.text sub ] ] ]

let private characterCard (content: Content option) (dispatch: Msg -> unit) (c: Character) =
    Html.div
        [ prop.className "ll-card"
          prop.children
              [ Html.div
                    [ prop.className "ll-card__head"
                      prop.children
                          [ Html.div
                                [ prop.children
                                      [ Html.h3 [ prop.className "ll-card__title"; prop.text c.Name ]
                                        Html.div
                                            [ prop.className "ll-card__sub"
                                              prop.text (sprintf "%s · %s" (raceName content c.RaceId) (vocationName content c.VocationId)) ] ] ]
                            Html.button
                                [ prop.className "ll-btn ll-btn--danger ll-btn--sm"
                                  prop.text "Delete"
                                  prop.onClick (fun _ -> dispatch (Delete c.Id)) ] ] ]
                // Derived stats
                Html.div
                    [ prop.className "ll-stats"
                      prop.children
                          [ statTile "" "HP" (string c.CurrentHp) (sprintf "/ %d" c.MaxHp)
                            statTile "" "Mass" (string c.Mass) ""
                            statTile "" "Speed" (string c.SpeedClass) "SC"
                            statTile "" "Soul" (string c.SoulTier) "ST"
                            statTile "" "Injuries" (string c.Injuries) (sprintf "/ %d" c.MaxInjuries)
                            statTile "" "Ext. WP" (string c.ExtendedWillpower) "" ] ]
                // Primary stats (modifiers from the shared Mechanics)
                Html.div [ prop.className "ll-section-label"; prop.text "Primary Stats" ]
                Html.div
                    [ prop.className "ll-stats"
                      prop.children
                          [ for stat in PrimaryStat.all do
                                let v = c.Primary.Value stat
                                let variant = "ll-stat--" + (PrimaryStat.name stat).ToLower()
                                statTile variant (PrimaryStat.name stat) (string v) (fmtMod (Mechanics.primaryModifier v)) ] ]
                // Secondary stats
                Html.div [ prop.className "ll-section-label"; prop.text "Secondary Stats" ]
                Html.div
                    [ prop.className "ll-stats"
                      prop.children
                          [ for stat in SecondaryStat.all do
                                let v = c.Secondary.Value stat
                                let variant = "ll-stat--" + (SecondaryStat.name stat).ToLower()

                                let sub =
                                    match Mechanics.secondaryModifier stat v with
                                    | Some n -> fmtMod n
                                    | None -> "—"

                                statTile variant (SecondaryStat.name stat) (string v) sub ] ] ] ]

let private selectField (label: string) (value: string) (options: (string * string) list) (onChange: string -> unit) =
    Html.div
        [ prop.className "ll-field"
          prop.children
              [ Html.label [ prop.className "ll-label"; prop.text label ]
                Html.select
                    [ prop.className "ll-select"
                      prop.value value
                      prop.onChange onChange
                      prop.children [ for (v, t) in options -> Html.option [ prop.value v; prop.text t ] ] ] ] ]

// ---------------------------------------------------------------------------
// Chrome: nav + footer
// ---------------------------------------------------------------------------

let private navbar (user: User) (page: Page) (dispatch: Msg -> unit) =
    let subCls active =
        if active then "ll-subnav__link is-active" else "ll-subnav__link"

    Html.div
        [ prop.children
              [ Html.div
                    [ prop.className "ll-nav"
                      prop.children
                          [ Html.img [ prop.className "ll-nav__logo"; prop.src "/nav-logo.ico"; prop.alt "Lords & Legends" ]
                            Html.span [ prop.className "ll-nav__brand"; prop.text "Lords & Legends" ]
                            Html.span [ prop.className "ll-nav__user"; prop.text (sprintf "Signed in as %s" user.Username) ]
                            Html.button
                                [ prop.className "ll-nav__link"
                                  prop.text "Log out"
                                  prop.onClick (fun _ -> dispatch Logout) ] ] ]
                Html.div
                    [ prop.className "ll-subnav"
                      prop.children
                          [ Html.button
                                [ prop.className (subCls (page = CreateForm))
                                  prop.text "Character Creator"
                                  prop.onClick (fun _ -> dispatch (GoTo CreateForm)) ]
                            Html.button
                                [ prop.className (subCls (page = CharacterList))
                                  prop.text "Characters"
                                  prop.onClick (fun _ -> dispatch (GoTo CharacterList)) ] ] ] ] ]

let private footer =
    Html.footer
        [ prop.className "ll-footer"
          prop.text (sprintf "© %d Lords and Legends" (System.DateTime.Now.Year)) ]

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

let private authView (model: Model) (dispatch: Msg -> unit) =
    let isRegister = model.AuthMode = RegisterMode

    Html.div
        [ Html.div
              [ prop.className "ll-hero"
                prop.children
                    [ Html.img [ prop.className "ll-hero__logo"; prop.src "/nav-logo.ico"; prop.alt "Lords & Legends" ]
                      Html.h1 [ prop.className "ll-hero__title"; prop.text "Lords & Legends" ]
                      Html.p [ prop.className "ll-hero__tagline"; prop.text "Forge your legend. Manage your characters." ] ] ]
          Html.div
              [ prop.className "ll-panel ll-panel--narrow"
                prop.children
                    [ Html.h2 [ prop.className "ll-auth-title"; prop.text (if isRegister then "Create an Account" else "Sign In") ]
                      Html.div
                          [ prop.className "ll-field"
                            prop.children
                                [ Html.label [ prop.className "ll-label"; prop.text "Username" ]
                                  Html.input
                                      [ prop.className "ll-input"
                                        prop.value model.Username
                                        prop.onChange (SetUsername >> dispatch) ] ] ]
                      Html.div
                          [ prop.className "ll-field"
                            prop.children
                                [ Html.label [ prop.className "ll-label"; prop.text "Password" ]
                                  Html.input
                                      [ prop.className "ll-input"
                                        prop.type' "password"
                                        prop.value model.Password
                                        prop.onChange (SetPassword >> dispatch) ] ] ]
                      (match model.AuthError with
                       | Some e -> Html.div [ prop.className "ll-alert ll-alert--error"; prop.text e ]
                       | None -> Html.none)
                      Html.button
                          [ prop.className "ll-btn ll-btn--accent"
                            prop.style [ style.width (length.percent 100) ]
                            prop.disabled (model.Loading || model.Username.Trim() = "" || model.Password = "")
                            prop.text (if isRegister then "Register" else "Sign In")
                            prop.onClick (fun _ -> dispatch SubmitAuth) ]
                      Html.div
                          [ prop.style [ style.textAlign.center; style.marginTop 14 ]
                            prop.children
                                [ Html.button
                                      [ prop.className "ll-link-btn"
                                        prop.text (if isRegister then "Have an account? Sign in" else "New here? Create an account")
                                        prop.onClick (fun _ ->
                                            dispatch (SetAuthMode(if isRegister then LoginMode else RegisterMode))) ] ] ] ] ] ]

let private listPage (model: Model) (dispatch: Msg -> unit) =
    Html.div
        [ prop.className "ll-panel"
          prop.children
              [ Html.div
                    [ prop.style [ style.display.flex; style.justifyContent.spaceBetween; style.alignItems.center; style.marginBottom 20 ]
                      prop.children
                          [ Html.h1 [ prop.className "ll-page-title"; prop.style [ style.marginBottom 0 ]; prop.text "Your Characters" ]
                            Html.button
                                [ prop.className "ll-btn ll-btn--accent"
                                  prop.text "+ New Character"
                                  prop.onClick (fun _ -> dispatch (GoTo CreateForm)) ] ] ]
                if List.isEmpty model.Characters then
                    Html.p [ prop.className "ll-muted"; prop.text "No characters yet. Create your first adventurer." ]
                else
                    Html.div [ prop.children [ for c in model.Characters -> characterCard model.Content dispatch c ] ] ] ]

let private createPage (model: Model) (dispatch: Msg -> unit) =
    let races = model.Content |> Option.map (fun c -> c.Races) |> Option.defaultValue []
    let vocations = model.Content |> Option.map (fun c -> c.Vocations) |> Option.defaultValue []
    let prim = StatGeneration.primaryArray model.Array
    let sec = StatGeneration.secondaryArray model.Array

    Html.div
        [ prop.className "ll-panel ll-panel--narrow"
          prop.children
              [ Html.h1 [ prop.className "ll-page-title"; prop.text "Create a Character" ]
                Html.div
                    [ prop.className "ll-field"
                      prop.children
                          [ Html.label [ prop.className "ll-label"; prop.text "Name" ]
                            Html.input
                                [ prop.className "ll-input"
                                  prop.value model.Name
                                  prop.onChange (SetName >> dispatch) ] ] ]
                selectField "Race" model.RaceId [ for r in races -> r.Id, r.Name ] (SetRace >> dispatch)
                selectField "Vocation" model.VocationId [ for v in vocations -> v.Id, v.Name ] (SetVocation >> dispatch)
                selectField
                    "Stat Array (Hard Start)"
                    (match model.Array with
                     | NormalPerson -> "normal"
                     | Adventurer -> "adventurer")
                    [ "normal", "Normal Person"; "adventurer", "Adventurer" ]
                    (fun v -> dispatch (SetArray(if v = "adventurer" then Adventurer else NormalPerson)))
                Html.div
                    [ prop.className "ll-alert ll-alert--info"
                      prop.children
                          [ Html.strong [ prop.text "Primary: " ]
                            Html.span [ prop.text (prim |> List.map string |> String.concat ", ") ]
                            Html.br []
                            Html.strong [ prop.text "Secondary (WP / Fer / Arc): " ]
                            Html.span [ prop.text (sec |> List.map string |> String.concat ", ") ] ] ]
                Html.div
                    [ prop.className "ll-field"
                      prop.children
                          [ Html.label [ prop.className "ll-label"; prop.text "HP Roll (2d8)" ]
                            Html.input
                                [ prop.className "ll-input"
                                  prop.type' "number"
                                  prop.value model.HpRoll
                                  prop.onChange (fun (v: string) ->
                                      match System.Int32.TryParse v with
                                      | true, n -> dispatch (SetHpRoll n)
                                      | _ -> ()) ] ] ]
                (match model.Error with
                 | Some e -> Html.div [ prop.className "ll-alert ll-alert--error"; prop.text e ]
                 | None -> Html.none)
                Html.div
                    [ prop.className "ll-btn-row"
                      prop.children
                          [ Html.button
                                [ prop.className "ll-btn ll-btn--accent"
                                  prop.disabled (model.Loading || model.Name.Trim() = "")
                                  prop.text "Create"
                                  prop.onClick (fun _ -> dispatch Submit) ]
                            Html.button
                                [ prop.className "ll-btn ll-btn--ghost"
                                  prop.text "Cancel"
                                  prop.onClick (fun _ -> dispatch (GoTo CharacterList)) ] ] ] ] ]

// ---------------------------------------------------------------------------
// Root view
// ---------------------------------------------------------------------------

let view (model: Model) (dispatch: Msg -> unit) =
    Html.div
        [ prop.className "ll-app"
          prop.children
              [ (match model.CurrentUser with
                 | Some user -> navbar user model.Page dispatch
                 | None -> Html.none)
                Html.div
                    [ prop.className "ll-main"
                      prop.children
                          [ if model.CheckingAuth then
                                Html.div
                                    [ prop.className "ll-panel ll-panel--narrow"
                                      prop.style [ style.textAlign.center ]
                                      prop.text "Loading…" ]
                            else
                                match model.CurrentUser with
                                | None -> authView model dispatch
                                | Some _ ->
                                    match model.Page with
                                    | CharacterList -> listPage model dispatch
                                    | CreateForm -> createPage model dispatch ] ]
                footer ] ]

// ---------------------------------------------------------------------------
// Program
// ---------------------------------------------------------------------------

Program.mkProgram init update view
|> Program.withReactSynchronous "root"
|> Program.run
