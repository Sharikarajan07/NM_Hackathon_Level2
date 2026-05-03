# OAuth Setup (Google + GitHub)

This repo uses Spring Boot OAuth2 Login in Auth-Service and redirects to the frontend `/oauth-success` page with a JWT.

## Required Environment Variables

Set these for Auth-Service:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `AUTH_FRONTEND_REDIRECT_URL` (default: `http://localhost:3000/oauth-success`)

If using Docker Compose, you can export them in your shell before running:

```powershell
$env:GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
$env:GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
$env:GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
$env:GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"
$env:AUTH_FRONTEND_REDIRECT_URL="http://localhost:3000/oauth-success"
```

## Google OAuth Setup

1. Go to Google Cloud Console > APIs & Services > Credentials.
2. Create OAuth client ID (Web application).
3. Authorized redirect URI:
   - `http://localhost:8081/api/auth/oauth2/callback/google`
4. Copy the client ID and secret into env vars above.

## GitHub OAuth Setup

1. Go to GitHub > Settings > Developer settings > OAuth Apps.
2. Create a new OAuth app.
3. Authorization callback URL:
   - `http://localhost:8081/api/auth/oauth2/callback/github`
4. Copy the client ID and secret into env vars above.

## Frontend OAuth Flow

- Google: `http://localhost:8081/api/auth/oauth2/authorize/google`
- GitHub: `http://localhost:8081/api/auth/oauth2/authorize/github`

After login, Auth-Service redirects to:

```
http://localhost:3000/oauth-success?token=...&userId=...&email=...&firstName=...&lastName=...&role=...
```

The frontend stores the token and routes to `/dashboard`.

## Running

```powershell
docker-compose up --build -d
```
