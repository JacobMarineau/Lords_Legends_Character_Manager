# =============================================================================
# Build stage: compile the F# server AND the Fable/Vite client in one image
# (needs both the .NET SDK and Node.js).
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Install Node.js 20 for the client build.
RUN apt-get update \
    && apt-get install -y ca-certificates curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . .

# Restore the local dotnet tools (Fable).
RUN dotnet tool restore

# Build the client: Fable (F# -> JS) then Vite bundles to src/Client/dist.
WORKDIR /src/src/Client
RUN npm install
RUN npm run build

# Publish the server to /app.
WORKDIR /src
RUN dotnet publish src/Server/Server.fsproj -c Release -o /app

# Embed the built client into the server's static folder.
RUN mkdir -p /app/public && cp -r src/Client/dist/* /app/public/

# =============================================================================
# Runtime stage: slim ASP.NET image with just the published output.
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# Fly routes to this port; the server reads PORT (see Program.fs).
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Server.dll"]
