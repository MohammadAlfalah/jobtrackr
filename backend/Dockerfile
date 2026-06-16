# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first (better layer caching) then copy the rest.
COPY JobTrackr.Api/JobTrackr.Api.csproj JobTrackr.Api/
RUN dotnet restore JobTrackr.Api/JobTrackr.Api.csproj

COPY JobTrackr.Api/ JobTrackr.Api/
RUN dotnet publish JobTrackr.Api/JobTrackr.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# curl is used by the docker-compose healthcheck to know when the API is ready.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "JobTrackr.Api.dll"]
