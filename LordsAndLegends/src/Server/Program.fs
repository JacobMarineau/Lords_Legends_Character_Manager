module Server.Program

open Giraffe
open Saturn
open Microsoft.AspNetCore.Http
open Fable.Remoting.Server
open Fable.Remoting.Giraffe
open LordsAndLegends.Shared

// Surface the real exception (server log + propagate the message to the client).
let private errorHandler (ex: exn) (routeInfo: RouteInfo<HttpContext>) =
    eprintfn "API error in %s:\n%s" routeInfo.methodName (ex.ToString())
    Propagate ex.Message

// Each API is built per request from the HttpContext, so it sees the
// authenticated user (cookie auth). Same Route.builder as the client proxy.
let private authApp =
    Remoting.createApi ()
    |> Remoting.withRouteBuilder Route.builder
    |> Remoting.withErrorHandler errorHandler
    |> Remoting.fromContext Api.authApiFor
    |> Remoting.buildHttpHandler

let private characterApp =
    Remoting.createApi ()
    |> Remoting.withRouteBuilder Route.builder
    |> Remoting.withErrorHandler errorHandler
    |> Remoting.fromContext Api.characterApiFor
    |> Remoting.buildHttpHandler

// Serve the built client (index.html) at the root. Static assets under
// /assets/* are served by use_static below. The Remoting handlers above only
// match /api/* and fall through to here for everything else.
let private spa = GET >=> route "/" >=> htmlFile "public/index.html"

let webApp = choose [ authApp; characterApp; spa ]

let port =
    match System.Environment.GetEnvironmentVariable "PORT" with
    | null
    | "" -> 5000
    | p -> int p

let app =
    application {
        // Sets up cookie auth on the default "Cookies" scheme (matches Api.AuthScheme)
        // and adds UseAuthentication to the pipeline in the right order.
        use_cookies_authentication "lords-legends"
        use_router webApp
        memory_cache
        use_static "public"
        use_gzip
        url (sprintf "http://0.0.0.0:%d/" port)
    }

[<EntryPoint>]
let main _ =
    // Create tables if needed before accepting requests (self-migrating deploy).
    Database.initialize ()
    run app
    0
