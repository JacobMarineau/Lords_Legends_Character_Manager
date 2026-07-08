module Client.Main

open Elmish
open Elmish.React
open Feliz
open LordsAndLegends.Shared

// ---------------------------------------------------------------------------
// Small list helpers for editing collections by index
// ---------------------------------------------------------------------------

let private updateAt i f xs =
    xs |> List.mapi (fun idx x -> if idx = i then f x else x)

let private removeAt i xs =
    xs |> List.mapi (fun idx x -> idx, x) |> List.choose (fun (idx, x) -> if idx = i then None else Some x)

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

type Page =
    | CharacterList
    | CreateForm
    | Sheet

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
      // Creator (multi-step)
      Step: int
      Name: string
      RaceId: string
      VocationId: string
      Specialty: string
      Height: string
      Age: int
      Array: StartingArray
      HpRoll: int
      // Sheet editing
      Draft: Character option
      Saving: bool
      SaveMsg: string option }

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
    // Data
    | ContentLoaded of Content
    | CharactersLoaded of Character list
    | Failed of exn
    // Creator
    | GoTo of Page
    | SetStep of int
    | SetName of string
    | SetRace of string
    | SetVocation of string
    | SetSpecialty of string
    | SetHeight of string
    | SetAge of int
    | SetArray of StartingArray
    | SetHpRoll of int
    | Submit
    | Created of Character
    // Sheet
    | OpenSheet of Character
    | UpdateDraft of (Character -> Character)
    | SaveDraft
    | Saved of Character
    | Delete of int
    | Deleted of int

// ---------------------------------------------------------------------------
// Init / update
// ---------------------------------------------------------------------------

let private freshCreator (m: Model) =
    { m with
        Step = 1
        Name = ""
        Specialty = ""
        Height = ""
        Age = 0
        Array = NormalPerson
        HpRoll = 9 }

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
          Step = 1
          Name = ""
          RaceId = ""
          VocationId = ""
          Specialty = ""
          Height = ""
          Age = 0
          Array = NormalPerson
          HpRoll = 9
          Draft = None
          Saving = false
          SaveMsg = None }

    model, Cmd.OfAsync.either Api.authApi.getCurrentUser () GotCurrentUser Failed

let private loadAppData =
    Cmd.batch
        [ Cmd.OfAsync.either Api.characterApi.getContent () ContentLoaded Failed
          Cmd.OfAsync.either Api.characterApi.getCharacters () CharactersLoaded Failed ]

let private buildNewCharacter (m: Model) : NewCharacter =
    let p = StatGeneration.primaryArray m.Array
    let s = StatGeneration.secondaryArray m.Array

    { Name = m.Name
      RaceId = m.RaceId
      VocationId = m.VocationId
      Specialty = m.Specialty
      Height = m.Height
      Age = m.Age
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
        { model with Loading = false; CurrentUser = Some user; Password = ""; AuthError = None }, loadAppData
    | AuthResult(Error e) -> { model with Loading = false; AuthError = Some e }, Cmd.none
    | Logout -> model, Cmd.OfAsync.either Api.authApi.logout () (fun () -> LoggedOut) Failed
    | LoggedOut ->
        { model with CurrentUser = None; Characters = []; Username = ""; Password = ""; Page = CharacterList }, Cmd.none
    // -- Data --
    | ContentLoaded content ->
        let firstRace = content.Races |> List.tryHead |> Option.map (fun r -> r.Id) |> Option.defaultValue ""
        let firstVoc = content.Vocations |> List.tryHead |> Option.map (fun v -> v.Id) |> Option.defaultValue ""

        { model with
            Content = Some content
            RaceId = (if model.RaceId = "" then firstRace else model.RaceId)
            VocationId = (if model.VocationId = "" then firstVoc else model.VocationId) },
        Cmd.none
    | CharactersLoaded characters -> { model with Characters = characters }, Cmd.none
    | Failed ex ->
        { model with
            Loading = false
            Saving = false
            CheckingAuth = false
            AuthError = (if model.CurrentUser.IsNone then Some ex.Message else model.AuthError)
            Error = Some ex.Message },
        Cmd.none
    // -- Creator --
    | GoTo CreateForm -> (freshCreator { model with Page = CreateForm; Error = None }), Cmd.none
    | GoTo page -> { model with Page = page; Error = None; Draft = None; SaveMsg = None }, Cmd.none
    | SetStep n -> { model with Step = n }, Cmd.none
    | SetName name -> { model with Name = name }, Cmd.none
    | SetRace id -> { model with RaceId = id }, Cmd.none
    | SetVocation id -> { model with VocationId = id }, Cmd.none
    | SetSpecialty s -> { model with Specialty = s }, Cmd.none
    | SetHeight h -> { model with Height = h }, Cmd.none
    | SetAge a -> { model with Age = a }, Cmd.none
    | SetArray arr -> { model with Array = arr }, Cmd.none
    | SetHpRoll n -> { model with HpRoll = n }, Cmd.none
    | Submit ->
        { model with Loading = true; Error = None },
        Cmd.OfAsync.either Api.characterApi.createCharacter (buildNewCharacter model) Created Failed
    | Created character ->
        { model with
            Characters = model.Characters @ [ character ]
            Page = Sheet
            Draft = Some character
            Loading = false
            SaveMsg = None },
        Cmd.none
    // -- Sheet --
    | OpenSheet c -> { model with Page = Sheet; Draft = Some c; SaveMsg = None; Error = None }, Cmd.none
    | UpdateDraft f -> { model with Draft = model.Draft |> Option.map f; SaveMsg = None }, Cmd.none
    | SaveDraft ->
        match model.Draft with
        | Some c -> { model with Saving = true }, Cmd.OfAsync.either Api.characterApi.updateCharacter c Saved Failed
        | None -> model, Cmd.none
    | Saved c ->
        { model with
            Saving = false
            Draft = Some c
            SaveMsg = Some "Saved."
            Characters = model.Characters |> List.map (fun x -> if x.Id = c.Id then c else x) },
        Cmd.none
    | Delete id -> model, Cmd.OfAsync.either Api.characterApi.deleteCharacter id (fun () -> Deleted id) Failed
    | Deleted id ->
        { model with
            Characters = model.Characters |> List.filter (fun c -> c.Id <> id)
            Page = (if model.Page = Sheet then CharacterList else model.Page)
            Draft = None },
        Cmd.none

// ---------------------------------------------------------------------------
// View helpers
// ---------------------------------------------------------------------------

let private fmtMod (n: int) = if n >= 0 then sprintf "+%d" n else string n

let private nameOf (items: (string * string) list) (id: string) =
    items |> List.tryFind (fun (i, _) -> i = id) |> Option.map snd |> Option.defaultValue id

let private raceOptions (content: Content option) =
    content |> Option.map (fun c -> [ for r in c.Races -> r.Id, r.Name ]) |> Option.defaultValue []

let private vocationOptions (content: Content option) =
    content |> Option.map (fun c -> [ for v in c.Vocations -> v.Id, v.Name ]) |> Option.defaultValue []

let private statTile (variant: string) (label: string) (value: string) (sub: string) =
    Html.div
        [ prop.className (if variant = "" then "ll-stat" else "ll-stat " + variant)
          prop.children
              [ Html.div [ prop.className "ll-stat__label"; prop.text label ]
                Html.div [ prop.className "ll-stat__value"; prop.text value ]
                Html.div [ prop.className "ll-stat__mod"; prop.text sub ] ] ]

let private textField (label: string) (value: string) (onChange: string -> unit) =
    Html.div
        [ prop.className "ll-field"
          prop.children
              [ Html.label [ prop.className "ll-label"; prop.text label ]
                Html.input [ prop.className "ll-input"; prop.value value; prop.onChange onChange ] ] ]

let private numField (label: string) (value: int) (onChange: int -> unit) =
    Html.div
        [ prop.className "ll-field"
          prop.children
              [ Html.label [ prop.className "ll-label"; prop.text label ]
                Html.input
                    [ prop.className "ll-input"
                      prop.type' "number"
                      prop.value value
                      prop.onChange (fun (v: string) ->
                          match System.Int32.TryParse v with
                          | true, n -> onChange n
                          | _ -> ()) ] ] ]

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

/// A compact inline text box used inside collection rows.
let private inlineBox (placeholder: string) (value: string) (onChange: string -> unit) =
    Html.input
        [ prop.className "ll-input ll-inline"
          prop.placeholder placeholder
          prop.value value
          prop.onChange onChange ]

// ---------------------------------------------------------------------------
// Character card (list view)
// ---------------------------------------------------------------------------

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
                                              prop.text (
                                                  sprintf
                                                      "%s · %s%s"
                                                      (nameOf (raceOptions content) c.RaceId)
                                                      (nameOf (vocationOptions content) c.VocationId)
                                                      (if c.Specialty = "" then "" else " · " + c.Specialty)
                                              ) ] ] ]
                            Html.div
                                [ prop.className "ll-btn-row"
                                  prop.children
                                      [ Html.button
                                            [ prop.className "ll-btn ll-btn--sm"
                                              prop.text "Open Sheet"
                                              prop.onClick (fun _ -> dispatch (OpenSheet c)) ]
                                        Html.button
                                            [ prop.className "ll-btn ll-btn--danger ll-btn--sm"
                                              prop.text "Delete"
                                              prop.onClick (fun _ -> dispatch (Delete c.Id)) ] ] ] ] ]
                Html.div
                    [ prop.className "ll-stats"
                      prop.children
                          [ statTile "" "HP" (string c.CurrentHp) (sprintf "/ %d" c.MaxHp)
                            statTile "" "Mass" (string c.Mass) ""
                            statTile "" "Speed" (string c.SpeedClass) "SC"
                            statTile "" "Soul" (string c.SoulTier) "ST"
                            statTile "" "Glint" (string c.Glint) ""
                            statTile "" "Ext. WP" (string c.ExtendedWillpower) "" ] ]
                Html.div
                    [ prop.className "ll-stats"
                      prop.children
                          [ for stat in PrimaryStat.all do
                                let v = c.Primary.Value stat
                                let variant = "ll-stat--" + (PrimaryStat.name stat).ToLower()
                                statTile variant (PrimaryStat.name stat) (string v) (fmtMod (Mechanics.primaryModifier v)) ] ] ] ]

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
                            Html.button [ prop.className "ll-nav__link"; prop.text "Log out"; prop.onClick (fun _ -> dispatch Logout) ] ] ]
                Html.div
                    [ prop.className "ll-subnav"
                      prop.children
                          [ Html.button
                                [ prop.className (subCls (page = CreateForm))
                                  prop.text "Character Creator"
                                  prop.onClick (fun _ -> dispatch (GoTo CreateForm)) ]
                            Html.button
                                [ prop.className (subCls (page = CharacterList || page = Sheet))
                                  prop.text "Characters"
                                  prop.onClick (fun _ -> dispatch (GoTo CharacterList)) ] ] ] ] ]

let private footer =
    Html.footer [ prop.className "ll-footer"; prop.text (sprintf "© %d Lords and Legends" (System.DateTime.Now.Year)) ]

// ---------------------------------------------------------------------------
// Auth page
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
                      textField "Username" model.Username (SetUsername >> dispatch)
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
                                        prop.onClick (fun _ -> dispatch (SetAuthMode(if isRegister then LoginMode else RegisterMode))) ] ] ] ] ] ]

// ---------------------------------------------------------------------------
// Character list page
// ---------------------------------------------------------------------------

let private listPage (model: Model) (dispatch: Msg -> unit) =
    Html.div
        [ prop.className "ll-panel"
          prop.children
              [ Html.div
                    [ prop.style [ style.display.flex; style.justifyContent.spaceBetween; style.alignItems.center; style.marginBottom 20 ]
                      prop.children
                          [ Html.h1 [ prop.className "ll-page-title"; prop.style [ style.marginBottom 0 ]; prop.text "Your Characters" ]
                            Html.button [ prop.className "ll-btn ll-btn--accent"; prop.text "+ New Character"; prop.onClick (fun _ -> dispatch (GoTo CreateForm)) ] ] ]
                if List.isEmpty model.Characters then
                    Html.p [ prop.className "ll-muted"; prop.text "No characters yet. Create your first adventurer." ]
                else
                    Html.div [ prop.children [ for c in model.Characters -> characterCard model.Content dispatch c ] ] ] ]

// ---------------------------------------------------------------------------
// Multi-step creator
// ---------------------------------------------------------------------------

let private stepper (current: int) =
    let labels = [ 1, "Identity"; 2, "Stats"; 3, "Review" ]

    Html.div
        [ prop.className "ll-steps"
          prop.children
              [ for (n, label) in labels ->
                    Html.div
                        [ prop.className (if n = current then "ll-step is-active" elif n < current then "ll-step is-done" else "ll-step")
                          prop.children [ Html.span [ prop.className "ll-step__num"; prop.text (string n) ]; Html.span [ prop.text label ] ] ] ] ]

let private createPage (model: Model) (dispatch: Msg -> unit) =
    let prim = StatGeneration.primaryArray model.Array
    let sec = StatGeneration.secondaryArray model.Array

    let stepBody =
        match model.Step with
        | 1 ->
            Html.div
                [ textField "Name" model.Name (SetName >> dispatch)
                  selectField "Race" model.RaceId (raceOptions model.Content) (SetRace >> dispatch)
                  selectField "Vocation" model.VocationId (vocationOptions model.Content) (SetVocation >> dispatch)
                  textField "Specialty" model.Specialty (SetSpecialty >> dispatch)
                  textField "Height" model.Height (SetHeight >> dispatch)
                  numField "Age" model.Age (SetAge >> dispatch) ]
        | 2 ->
            Html.div
                [ selectField
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
                  numField "HP Roll (2d8)" model.HpRoll (SetHpRoll >> dispatch) ]
        | _ ->
            Html.div
                [ Html.div
                      [ prop.className "ll-alert ll-alert--info"
                        prop.children
                            [ Html.strong [ prop.text (if model.Name = "" then "(unnamed)" else model.Name) ]
                              Html.text (
                                  sprintf
                                      " — %s %s%s"
                                      (nameOf (raceOptions model.Content) model.RaceId)
                                      (nameOf (vocationOptions model.Content) model.VocationId)
                                      (if model.Specialty = "" then "" else ", " + model.Specialty)
                              )
                              Html.br []
                              Html.text (sprintf "Primary %s · Secondary %s · HP roll %d" (prim |> List.map string |> String.concat "/") (sec |> List.map string |> String.concat "/") model.HpRoll) ] ]
                  Html.p [ prop.className "ll-muted"; prop.text "You can add weapons, spells, gear and more on the character sheet after creating." ] ]

    let navButtons =
        Html.div
            [ prop.className "ll-btn-row"
              prop.style [ style.marginTop 8 ]
              prop.children
                  [ if model.Step > 1 then
                        Html.button [ prop.className "ll-btn ll-btn--ghost"; prop.text "Back"; prop.onClick (fun _ -> dispatch (SetStep(model.Step - 1))) ]
                    if model.Step < 3 then
                        Html.button
                            [ prop.className "ll-btn ll-btn--accent"
                              prop.disabled (model.Step = 1 && model.Name.Trim() = "")
                              prop.text "Next"
                              prop.onClick (fun _ -> dispatch (SetStep(model.Step + 1))) ]
                    else
                        Html.button
                            [ prop.className "ll-btn ll-btn--accent"
                              prop.disabled (model.Loading || model.Name.Trim() = "")
                              prop.text "Create Character"
                              prop.onClick (fun _ -> dispatch Submit) ]
                    Html.button [ prop.className "ll-btn ll-btn--ghost"; prop.text "Cancel"; prop.onClick (fun _ -> dispatch (GoTo CharacterList)) ] ] ]

    Html.div
        [ prop.className "ll-panel ll-panel--narrow"
          prop.children
              [ Html.h1 [ prop.className "ll-page-title"; prop.text "Create a Character" ]
                stepper model.Step
                stepBody
                (match model.Error with
                 | Some e -> Html.div [ prop.className "ll-alert ll-alert--error"; prop.text e ]
                 | None -> Html.none)
                navButtons ] ]

// ---------------------------------------------------------------------------
// Editable character sheet
// ---------------------------------------------------------------------------

let private sheetSection (title: string) (children: ReactElement list) =
    Html.div
        [ prop.className "ll-sheet-section"
          prop.children [ Html.div [ prop.className "ll-section-label"; prop.text title ]; yield! children ] ]

/// Render an editable collection as a grid of item cards + an "add" button.
let private collectionEditor
    (title: string)
    (addLabel: string)
    (cards: ReactElement list)
    (onAdd: unit -> unit)
    =
    sheetSection
        title
        [ (if List.isEmpty cards then
               Html.none
           else
               Html.div [ prop.className "ll-cardlist"; prop.children cards ])
          Html.button [ prop.className "ll-btn ll-btn--sm"; prop.style [ style.marginTop 6 ]; prop.text addLabel; prop.onClick (fun _ -> onAdd ()) ] ]

/// One labeled field inside an item card.
let private cardBox (label: string) (value: string) (onChange: string -> unit) =
    Html.label
        [ prop.className "ll-cardfield"
          prop.children
              [ Html.span [ prop.className "ll-cardfield__label"; prop.text label ]
                Html.input [ prop.className "ll-input ll-input--sm"; prop.value value; prop.onChange onChange ] ] ]

/// A neat card for a single collection item, with a corner delete button.
let private itemCard (fields: ReactElement list) (onRemove: unit -> unit) =
    Html.div
        [ prop.className "ll-itemcard"
          prop.children
              [ Html.button [ prop.className "ll-itemcard__x"; prop.text "✕"; prop.onClick (fun _ -> onRemove ()) ]
                Html.div [ prop.className "ll-cardgrid"; prop.children fields ] ] ]

let private sheetPage (model: Model) (c: Character) (dispatch: Msg -> unit) =
    let d f = dispatch (UpdateDraft f)

    // Identity
    let identity =
        sheetSection
            "Identity"
            [ Html.div
                  [ prop.className "ll-grid-2"
                    prop.children
                        [ textField "Name" c.Name (fun v -> d (fun x -> { x with Name = v }))
                          textField "Specialty" c.Specialty (fun v -> d (fun x -> { x with Specialty = v }))
                          selectField "Race" c.RaceId (raceOptions model.Content) (fun v -> d (fun x -> { x with RaceId = v }))
                          selectField "Vocation" c.VocationId (vocationOptions model.Content) (fun v -> d (fun x -> { x with VocationId = v }))
                          textField "Height" c.Height (fun v -> d (fun x -> { x with Height = v }))
                          numField "Age" c.Age (fun v -> d (fun x -> { x with Age = v })) ] ] ]

    // Vitals & pools
    let vitals =
        sheetSection
            "Vitals & Pools"
            [ Html.div
                  [ prop.className "ll-grid-4"
                    prop.children
                        [ numField "Current HP" c.CurrentHp (fun v -> d (fun x -> { x with CurrentHp = v }))
                          numField "Max HP" c.MaxHp (fun v -> d (fun x -> { x with MaxHp = v }))
                          numField "Injuries" c.Injuries (fun v -> d (fun x -> { x with Injuries = v }))
                          numField "Max Injuries" c.MaxInjuries (fun v -> d (fun x -> { x with MaxInjuries = v }))
                          numField "Mass" c.Mass (fun v -> d (fun x -> { x with Mass = v }))
                          numField "Speed Class" c.SpeedClass (fun v -> d (fun x -> { x with SpeedClass = v }))
                          numField "Soul Tier" c.SoulTier (fun v -> d (fun x -> { x with SoulTier = v }))
                          numField "Focus Points" c.FocusPoints (fun v -> d (fun x -> { x with FocusPoints = v }))
                          numField "Glint" c.Glint (fun v -> d (fun x -> { x with Glint = v }))
                          numField "Temp HP" c.Thp (fun v -> d (fun x -> { x with Thp = v }))
                          numField "AR" c.Ar (fun v -> d (fun x -> { x with Ar = v }))
                          numField "OS" c.Os (fun v -> d (fun x -> { x with Os = v }))
                          numField "MR" c.Mr (fun v -> d (fun x -> { x with Mr = v })) ] ] ]

    // Stats (editable, with live modifiers)
    let statInput (label: string) (value: int) (modifier: string) (onChange: int -> unit) =
        Html.div
            [ prop.className "ll-statedit"
              prop.children
                  [ Html.div [ prop.className "ll-stat__label"; prop.text label ]
                    Html.input
                        [ prop.className "ll-input ll-statedit__input"
                          prop.type' "number"
                          prop.value value
                          prop.onChange (fun (v: string) ->
                              match System.Int32.TryParse v with
                              | true, n -> onChange n
                              | _ -> ()) ]
                    Html.div [ prop.className "ll-stat__mod"; prop.text modifier ] ] ]

    let primaryStats =
        sheetSection
            "Primary Stats"
            [ Html.div
                  [ prop.className "ll-stats"
                    prop.children
                        [ statInput "Might" c.Primary.Might (fmtMod (Mechanics.primaryModifier c.Primary.Might)) (fun v -> d (fun x -> { x with Primary = { x.Primary with Might = v } }))
                          statInput "Agility" c.Primary.Agility (fmtMod (Mechanics.primaryModifier c.Primary.Agility)) (fun v -> d (fun x -> { x with Primary = { x.Primary with Agility = v } }))
                          statInput "Vitality" c.Primary.Vitality (fmtMod (Mechanics.primaryModifier c.Primary.Vitality)) (fun v -> d (fun x -> { x with Primary = { x.Primary with Vitality = v } }))
                          statInput "Intelligence" c.Primary.Intelligence (fmtMod (Mechanics.primaryModifier c.Primary.Intelligence)) (fun v -> d (fun x -> { x with Primary = { x.Primary with Intelligence = v } }))
                          statInput "Cunning" c.Primary.Cunning (fmtMod (Mechanics.primaryModifier c.Primary.Cunning)) (fun v -> d (fun x -> { x with Primary = { x.Primary with Cunning = v } }))
                          statInput "Presence" c.Primary.Presence (fmtMod (Mechanics.primaryModifier c.Primary.Presence)) (fun v -> d (fun x -> { x with Primary = { x.Primary with Presence = v } })) ] ] ]

    let secondaryStats =
        let secMod stat v =
            match Mechanics.secondaryModifier stat v with
            | Some n -> fmtMod n
            | None -> "—"

        sheetSection
            "Secondary Stats"
            [ Html.div
                  [ prop.className "ll-stats"
                    prop.children
                        [ statInput "Willpower · Innate" c.Secondary.Willpower "cost" (fun v -> d (fun x -> { x with Secondary = { x.Secondary with Willpower = v } }))
                          statInput "Willpower · Extended" c.ExtendedWillpower "pool" (fun v -> d (fun x -> { x with ExtendedWillpower = v }))
                          statInput "Ferocity" c.Secondary.Ferocity (secMod Ferocity c.Secondary.Ferocity) (fun v -> d (fun x -> { x with Secondary = { x.Secondary with Ferocity = v } }))
                          statInput "Arcana" c.Secondary.Arcana (secMod Arcana c.Secondary.Arcana) (fun v -> d (fun x -> { x with Secondary = { x.Secondary with Arcana = v } })) ] ] ]

    // Minor Stats: the fixed taxonomy, grouped under their governing major stat.
    let minorStats =
        let getVal name = c.MinorStats |> Map.tryFind name |> Option.defaultValue 0

        sheetSection
            "Minor Stats"
            [ for (group, names) in MinorStats.groups ->
                  Html.div
                      [ prop.className "ll-minorgroup"
                        prop.children
                            [ Html.div [ prop.className "ll-minorgroup__title"; prop.text group ]
                              Html.div
                                  [ prop.className "ll-minorgrid"
                                    prop.children
                                        [ for name in names ->
                                              Html.label
                                                  [ prop.className "ll-minorstat"
                                                    prop.children
                                                        [ Html.span [ prop.className "ll-minorstat__label"; prop.text name ]
                                                          Html.input
                                                              [ prop.className "ll-input ll-minorstat__input"
                                                                prop.type' "number"
                                                                prop.value (getVal name)
                                                                prop.onChange (fun (v: string) ->
                                                                    match System.Int32.TryParse v with
                                                                    | true, n -> d (fun x -> { x with MinorStats = Map.add name n x.MinorStats })
                                                                    | _ -> ()) ] ] ] ] ] ] ] ]

    // Collections (rendered as neat cards)
    let weapons =
        collectionEditor
            "Weapons"
            "+ Weapon"
            [ for i, w in List.indexed c.Weapons ->
                  itemCard
                      [ cardBox "Name" w.Name (fun v -> d (fun x -> { x with Weapons = updateAt i (fun it -> { it with Name = v }) x.Weapons }))
                        cardBox "Damage die" w.DamageDie (fun v -> d (fun x -> { x with Weapons = updateAt i (fun it -> { it with DamageDie = v }) x.Weapons }))
                        cardBox "Description" w.Description (fun v -> d (fun x -> { x with Weapons = updateAt i (fun it -> { it with Description = v }) x.Weapons })) ]
                      (fun () -> d (fun x -> { x with Weapons = removeAt i x.Weapons })) ]
            (fun () -> d (fun x -> { x with Weapons = x.Weapons @ [ Items.emptyWeapon ] }))

    let spells =
        collectionEditor
            "Magic / Spells"
            "+ Spell"
            [ for i, s in List.indexed c.Spells ->
                  itemCard
                      [ cardBox "Name" s.Name (fun v -> d (fun x -> { x with Spells = updateAt i (fun (it: Spell) -> { it with Name = v }) x.Spells }))
                        cardBox "Damage die" s.DamageDie (fun v -> d (fun x -> { x with Spells = updateAt i (fun (it: Spell) -> { it with DamageDie = v }) x.Spells }))
                        cardBox "Cost" s.Cost (fun v -> d (fun x -> { x with Spells = updateAt i (fun (it: Spell) -> { it with Cost = v }) x.Spells }))
                        cardBox "Action" s.ActionType (fun v -> d (fun x -> { x with Spells = updateAt i (fun (it: Spell) -> { it with ActionType = v }) x.Spells }))
                        cardBox "Description" s.Description (fun v -> d (fun x -> { x with Spells = updateAt i (fun (it: Spell) -> { it with Description = v }) x.Spells })) ]
                      (fun () -> d (fun x -> { x with Spells = removeAt i x.Spells })) ]
            (fun () -> d (fun x -> { x with Spells = x.Spells @ [ Items.emptySpell ] }))

    let skills =
        collectionEditor
            "Skills"
            "+ Skill"
            [ for i, s in List.indexed c.Skills ->
                  itemCard
                      [ cardBox "Name" s.Name (fun v -> d (fun x -> { x with Skills = updateAt i (fun it -> { it with Name = v }) x.Skills }))
                        cardBox "Damage die" s.DamageDie (fun v -> d (fun x -> { x with Skills = updateAt i (fun it -> { it with DamageDie = v }) x.Skills }))
                        cardBox "Cost" s.Cost (fun v -> d (fun x -> { x with Skills = updateAt i (fun it -> { it with Cost = v }) x.Skills }))
                        cardBox "Action" s.ActionType (fun v -> d (fun x -> { x with Skills = updateAt i (fun it -> { it with ActionType = v }) x.Skills }))
                        cardBox "Description" s.Description (fun v -> d (fun x -> { x with Skills = updateAt i (fun it -> { it with Description = v }) x.Skills })) ]
                      (fun () -> d (fun x -> { x with Skills = removeAt i x.Skills })) ]
            (fun () -> d (fun x -> { x with Skills = x.Skills @ [ Items.emptySkill ] }))

    let equipment =
        collectionEditor
            "Equipment"
            "+ Item"
            [ for i, e in List.indexed c.Equipment ->
                  itemCard
                      [ cardBox "Name" e.Name (fun v -> d (fun x -> { x with Equipment = updateAt i (fun it -> { it with Name = v }) x.Equipment }))
                        cardBox "Type" e.ItemType (fun v -> d (fun x -> { x with Equipment = updateAt i (fun it -> { it with ItemType = v }) x.Equipment }))
                        cardBox "Description" e.Description (fun v -> d (fun x -> { x with Equipment = updateAt i (fun it -> { it with Description = v }) x.Equipment })) ]
                      (fun () -> d (fun x -> { x with Equipment = removeAt i x.Equipment })) ]
            (fun () -> d (fun x -> { x with Equipment = x.Equipment @ [ Items.emptyEquipment ] }))

    let languages =
        collectionEditor
            "Languages"
            "+ Language"
            [ for i, l in List.indexed c.Languages ->
                  itemCard
                      [ cardBox "Language" l (fun v -> d (fun x -> { x with Languages = updateAt i (fun _ -> v) x.Languages })) ]
                      (fun () -> d (fun x -> { x with Languages = removeAt i x.Languages })) ]
            (fun () -> d (fun x -> { x with Languages = x.Languages @ [ "" ] }))

    let microStats =
        collectionEditor
            "Micro-stats"
            "+ Micro-stat"
            [ for i, ms in List.indexed c.MicroStats ->
                  itemCard
                      [ cardBox "Name" ms.Name (fun v -> d (fun x -> { x with MicroStats = updateAt i (fun it -> { it with Name = v }) x.MicroStats }))
                        Html.label
                            [ prop.className "ll-cardfield"
                              prop.children
                                  [ Html.span [ prop.className "ll-cardfield__label"; prop.text "Value" ]
                                    Html.input
                                        [ prop.className "ll-input ll-input--sm"
                                          prop.type' "number"
                                          prop.value ms.Value
                                          prop.onChange (fun (v: string) ->
                                              match System.Int32.TryParse v with
                                              | true, n -> d (fun x -> { x with MicroStats = updateAt i (fun it -> { it with Value = n }) x.MicroStats })
                                              | _ -> ()) ] ] ] ]
                      (fun () -> d (fun x -> { x with MicroStats = removeAt i x.MicroStats })) ]
            (fun () -> d (fun x -> { x with MicroStats = x.MicroStats @ [ Items.emptyMicroStat ] }))

    Html.div
        [ prop.className "ll-panel"
          prop.children
              [ Html.div
                    [ prop.className "ll-sheet-head"
                      prop.children
                          [ Html.div
                                [ prop.children
                                      [ Html.h1 [ prop.className "ll-page-title"; prop.style [ style.marginBottom 0; style.textAlign.left ]; prop.text (if c.Name = "" then "(unnamed)" else c.Name) ]
                                        Html.div [ prop.className "ll-muted"; prop.text (sprintf "%s · %s" (nameOf (raceOptions model.Content) c.RaceId) (nameOf (vocationOptions model.Content) c.VocationId)) ] ] ]
                            Html.div
                                [ prop.className "ll-btn-row"
                                  prop.children
                                      [ (match model.SaveMsg with
                                         | Some m -> Html.span [ prop.className "ll-saved-msg"; prop.text m ]
                                         | None -> Html.none)
                                        Html.button [ prop.className "ll-btn ll-btn--ghost"; prop.text "Back"; prop.onClick (fun _ -> dispatch (GoTo CharacterList)) ]
                                        Html.button
                                            [ prop.className "ll-btn ll-btn--accent"
                                              prop.disabled model.Saving
                                              prop.text (if model.Saving then "Saving…" else "Save")
                                              prop.onClick (fun _ -> dispatch SaveDraft) ] ] ] ] ]
                identity
                vitals
                primaryStats
                secondaryStats
                minorStats
                weapons
                spells
                skills
                equipment
                languages
                microStats ] ]

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
                                Html.div [ prop.className "ll-panel ll-panel--narrow"; prop.style [ style.textAlign.center ]; prop.text "Loading…" ]
                            else
                                match model.CurrentUser with
                                | None -> authView model dispatch
                                | Some _ ->
                                    match model.Page, model.Draft with
                                    | CharacterList, _ -> listPage model dispatch
                                    | CreateForm, _ -> createPage model dispatch
                                    | Sheet, Some c -> sheetPage model c dispatch
                                    | Sheet, None -> listPage model dispatch ] ]
                footer ] ]

Program.mkProgram init update view
|> Program.withReactSynchronous "root"
|> Program.run
