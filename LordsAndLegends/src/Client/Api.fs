module Client.Api

open Fable.Remoting.Client
open LordsAndLegends.Shared

/// Typed proxies for the server APIs. Calls look like ordinary async function
/// calls; Fable.Remoting handles the HTTP under the hood using the same
/// Route.builder the server registered with. Cookies ride along automatically.
let characterApi: ICharacterApi =
    Remoting.createApi ()
    |> Remoting.withRouteBuilder Route.builder
    |> Remoting.buildProxy<ICharacterApi>

let authApi: IAuthApi =
    Remoting.createApi ()
    |> Remoting.withRouteBuilder Route.builder
    |> Remoting.buildProxy<IAuthApi>
