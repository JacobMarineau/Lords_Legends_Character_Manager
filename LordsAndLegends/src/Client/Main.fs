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

let private statBadge (label: string) (value: int) (modifier: string) =
    Html.div
        [ prop.className "col text-center border rounded p-2 m-1"
          prop.children
              [ Html.div [ prop.className "small text-muted"; prop.text label ]
                Html.div [ prop.className "fs-5 fw-bold"; prop.text (string value) ]
                Html.div [ prop.className "small text-primary"; prop.text modifier ] ] ]

let private characterCard (content: Content option) (dispatch: Msg -> unit) (c: Character) =
    Html.div
        [ prop.className "card mb-3 shadow-sm"
          prop.children
              [ Html.div
                    [ prop.className "card-body"
                      prop.children
                          [ Html.div
                                [ prop.className "d-flex justify-content-between align-items-start"
                                  prop.children
                                      [ Html.div
                                            [ prop.children
                                                  [ Html.h5 [ prop.className "card-title mb-0"; prop.text c.Name ]
                                                    Html.small
                                                        [ prop.className "text-muted"
                                                          prop.text (sprintf "%s · %s" (raceName content c.RaceId) c.VocationId) ] ] ]
                                        Html.button
                                            [ prop.className "btn btn-sm btn-outline-danger"
                                              prop.text "Delete"
                                              prop.onClick (fun _ -> dispatch (Delete c.Id)) ] ] ]
                            Html.div
                                [ prop.className "row text-center my-3"
                                  prop.children
                                      [ statBadge "HP" c.CurrentHp (sprintf "/ %d" c.MaxHp)
                                        statBadge "Mass" c.Mass ""
                                        statBadge "Speed" c.SpeedClass "SC"
                                        statBadge "Soul" c.SoulTier "ST"
                                        statBadge "Inj." c.Injuries (sprintf "/ %d" c.MaxInjuries)
                                        statBadge "Ext. WP" c.ExtendedWillpower "" ] ]
                            Html.div
                                [ prop.className "row"
                                  prop.children
                                      [ for stat in PrimaryStat.all do
                                            let v = c.Primary.Value stat
                                            statBadge (PrimaryStat.name stat) v (fmtMod (Mechanics.primaryModifier v)) ] ]
                            Html.div
                                [ prop.className "row mt-1"
                                  prop.children
                                      [ for stat in SecondaryStat.all do
                                            let v = c.Secondary.Value stat
                                            let m =
                                                match Mechanics.secondaryModifier stat v with
                                                | Some n -> fmtMod n
                                                | None -> "—"
                                            statBadge (SecondaryStat.name stat) v m ] ] ] ] ] ]

let private selectField (label: string) (value: string) (options: (string * string) list) (onChange: string -> unit) =
    Html.div
        [ prop.className "mb-3"
          prop.children
              [ Html.label [ prop.className "form-label"; prop.text label ]
                Html.select
                    [ prop.className "form-select"
                      prop.value value
                      prop.onChange onChange
                      prop.children [ for (v, t) in options -> Html.option [ prop.value v; prop.text t ] ] ] ] ]

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

let private authPage (model: Model) (dispatch: Msg -> unit) =
    let isRegister = model.AuthMode = RegisterMode

    Html.div
        [ prop.className "card shadow-sm mx-auto mt-5"
          prop.style [ style.maxWidth 380 ]
          prop.children
              [ Html.div
                    [ prop.className "card-body p-4"
                      prop.children
                          [ Html.h4
                                [ prop.className "card-title text-center mb-4"
                                  prop.text (if isRegister then "Create an Account" else "Sign In") ]
                            Html.div
                                [ prop.className "mb-3"
                                  prop.children
                                      [ Html.label [ prop.className "form-label"; prop.text "Username" ]
                                        Html.input
                                            [ prop.className "form-control"
                                              prop.value model.Username
                                              prop.onChange (SetUsername >> dispatch) ] ] ]
                            Html.div
                                [ prop.className "mb-3"
                                  prop.children
                                      [ Html.label [ prop.className "form-label"; prop.text "Password" ]
                                        Html.input
                                            [ prop.className "form-control"
                                              prop.type' "password"
                                              prop.value model.Password
                                              prop.onChange (SetPassword >> dispatch) ] ] ]
                            match model.AuthError with
                            | Some e -> Html.div [ prop.className "alert alert-danger py-2"; prop.text e ]
                            | None -> Html.none
                            Html.button
                                [ prop.className "btn btn-primary w-100"
                                  prop.disabled (model.Loading || model.Username.Trim() = "" || model.Password = "")
                                  prop.text (if isRegister then "Register" else "Sign In")
                                  prop.onClick (fun _ -> dispatch SubmitAuth) ]
                            Html.div
                                [ prop.className "text-center mt-3"
                                  prop.children
                                      [ Html.button
                                            [ prop.className "btn btn-link btn-sm"
                                              prop.text (if isRegister then "Have an account? Sign in" else "New here? Create an account")
                                              prop.onClick (fun _ ->
                                                  dispatch (SetAuthMode(if isRegister then LoginMode else RegisterMode))) ] ] ] ] ] ] ]

let private listPage (model: Model) (dispatch: Msg -> unit) =
    Html.div
        [ Html.div
              [ prop.className "d-flex justify-content-between align-items-center mb-4"
                prop.children
                    [ Html.h2 [ prop.text "Your Characters" ]
                      Html.button
                          [ prop.className "btn btn-primary"
                            prop.text "+ New Character"
                            prop.onClick (fun _ -> dispatch (GoTo CreateForm)) ] ] ]
          if List.isEmpty model.Characters then
              Html.p [ prop.className "text-muted"; prop.text "No characters yet. Create your first adventurer." ]
          else
              Html.div [ prop.children [ for c in model.Characters -> characterCard model.Content dispatch c ] ] ]

let private createPage (model: Model) (dispatch: Msg -> unit) =
    let races = model.Content |> Option.map (fun c -> c.Races) |> Option.defaultValue []
    let vocations = model.Content |> Option.map (fun c -> c.Vocations) |> Option.defaultValue []
    let prim = StatGeneration.primaryArray model.Array
    let sec = StatGeneration.secondaryArray model.Array

    Html.div
        [ prop.style [ style.maxWidth 640 ]
          prop.className "mx-auto"
          prop.children
              [ Html.h2 [ prop.className "mb-4"; prop.text "Create a Character" ]
                Html.div
                    [ prop.className "mb-3"
                      prop.children
                          [ Html.label [ prop.className "form-label"; prop.text "Name" ]
                            Html.input
                                [ prop.className "form-control"
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
                    [ prop.className "alert alert-secondary small"
                      prop.children
                          [ Html.strong [ prop.text "Primary: " ]
                            Html.span [ prop.text (prim |> List.map string |> String.concat ", ") ]
                            Html.br []
                            Html.strong [ prop.text "Secondary (WP/Fer/Arc): " ]
                            Html.span [ prop.text (sec |> List.map string |> String.concat ", ") ] ] ]
                Html.div
                    [ prop.className "mb-3"
                      prop.children
                          [ Html.label [ prop.className "form-label"; prop.text "HP Roll (2d8)" ]
                            Html.input
                                [ prop.className "form-control"
                                  prop.type' "number"
                                  prop.value model.HpRoll
                                  prop.onChange (fun (v: string) ->
                                      match System.Int32.TryParse v with
                                      | true, n -> dispatch (SetHpRoll n)
                                      | _ -> ()) ] ] ]
                match model.Error with
                | Some e -> Html.div [ prop.className "alert alert-danger"; prop.text e ]
                | None -> Html.none
                Html.div
                    [ prop.className "d-flex gap-2"
                      prop.children
                          [ Html.button
                                [ prop.className "btn btn-primary"
                                  prop.disabled (model.Loading || model.Name.Trim() = "")
                                  prop.text "Create"
                                  prop.onClick (fun _ -> dispatch Submit) ]
                            Html.button
                                [ prop.className "btn btn-outline-secondary"
                                  prop.text "Cancel"
                                  prop.onClick (fun _ -> dispatch (GoTo CharacterList)) ] ] ] ] ]

let private navbar (user: User) (dispatch: Msg -> unit) =
    Html.div
        [ prop.className "d-flex justify-content-between align-items-center mb-2"
          prop.children
              [ Html.div
                    [ prop.children
                          [ Html.h1 [ prop.className "mb-0"; prop.text "Lords & Legends" ]
                            Html.span [ prop.className "text-muted"; prop.text "Character Manager" ] ] ]
                Html.div
                    [ prop.className "text-end"
                      prop.children
                          [ Html.div [ prop.className "small text-muted"; prop.text (sprintf "Signed in as %s" user.Username) ]
                            Html.button
                                [ prop.className "btn btn-sm btn-outline-secondary mt-1"
                                  prop.text "Log out"
                                  prop.onClick (fun _ -> dispatch Logout) ] ] ] ] ]

let view (model: Model) (dispatch: Msg -> unit) =
    Html.div
        [ prop.className "container py-4"
          prop.children
              [ if model.CheckingAuth then
                    Html.div [ prop.className "text-center py-5"; prop.text "Loading…" ]
                else
                    match model.CurrentUser with
                    | None ->
                        Html.div
                            [ Html.h1 [ prop.className "text-center mb-1"; prop.text "Lords & Legends" ]
                              Html.p [ prop.className "text-center text-muted"; prop.text "Character Manager" ]
                              authPage model dispatch ]
                    | Some user ->
                        Html.div
                            [ navbar user dispatch
                              Html.hr []
                              match model.Page with
                              | CharacterList -> listPage model dispatch
                              | CreateForm -> createPage model dispatch ] ] ]

// ---------------------------------------------------------------------------
// Program
// ---------------------------------------------------------------------------

Program.mkProgram init update view
|> Program.withReactSynchronous "root"
|> Program.run
