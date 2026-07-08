namespace LordsAndLegends.Shared

// ---------------------------------------------------------------------------
// The remote API contract. The server implements this interface; the client
// calls it through a typed proxy (Fable.Remoting). Because the contract is an
// ordinary F# type shared by both, request/response shapes can never drift.
// ---------------------------------------------------------------------------

/// Content the character builder needs: races and vocations, served as data.
type Content =
    { Races: Race list
      Vocations: Vocation list }

/// Payload to create a character. The client supplies the player's choices and
/// the 2d8 HP roll; the server computes every derived stat from the ruleset so
/// the rules can't be faked client-side.
type NewCharacter =
    { Name: string
      RaceId: string
      VocationId: string
      Primary: PrimaryStats
      Secondary: SecondaryStats
      /// Result of the player's 2d8 roll for starting HP.
      HpRoll: int }

/// A signed-in user, as exposed to the client (never includes the hash).
type User = { Id: int; Username: string }

/// Login / registration payload.
type Credentials = { Username: string; Password: string }

[<RequireQualifiedAccess>]
module Route =
    /// URL pattern Fable.Remoting uses for every method on the API.
    let builder (typeName: string) (methodName: string) =
        sprintf "/api/%s/%s" typeName methodName

/// Authentication API. register/login set a session cookie on success.
type IAuthApi =
    { register: Credentials -> Async<Result<User, string>>
      login: Credentials -> Async<Result<User, string>>
      logout: unit -> Async<unit>
      getCurrentUser: unit -> Async<User option> }

type ICharacterApi =
    { getContent: unit -> Async<Content>
      getCharacters: unit -> Async<Character list>
      getCharacter: int -> Async<Character option>
      createCharacter: NewCharacter -> Async<Character>
      deleteCharacter: int -> Async<unit> }
