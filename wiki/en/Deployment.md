> [← README](../../README.en.md) · [Wiki](../README.md) · [中文](../zh/Home.md)
>
> [Overview](../en/Home.md) · [Features](../en/Features.md) · [Tech Stack](../en/Tech-Stack.md) · [Quick Start](../en/Getting-Started.md) · **Deployment** · [Docker](../en/Docker.md) · [Project Structure](../en/Project-Structure.md) · [Architecture](../en/Architecture.md) · [Widgets](../en/Widgets.md) · [API](../en/API.md) · [Database](../en/Database.md) · [Settings](../en/Settings.md) · [Security](../en/Security.md) · [Configuration](../en/Configuration.md) · [Roadmap](../en/Roadmap.md) · [License](../en/License.md)

## Deploy

Two Wrangler configs, different purposes:

| File | Purpose | D1 | Vars |
|------|---------|-----|------|
| `wrangler.jsonc` | Local `wrangler dev` | `local-ternssh-db` | None (set Access in dashboard) |
| `wrangler.production.jsonc` | Production deploy (gitignored) | Real remote ID | None |

#### Deploy commands

| Command | When | What it does |
|---------|------|--------------|
| **`npm run deploy`** | Cloudflare one-click / Builds Deploy step (auto-detected) | Generate production config → D1 migrate → `wrangler deploy --config wrangler.production.jsonc` |
| **`npm run release`** | Local one-shot (build + publish) | `build` → `deploy` |
| **`npm run cf:deploy`** | Same as `deploy` (legacy alias) | Same as above |
| ~~`npx wrangler deploy`~~ | **Do not use in production** | Uses `wrangler.jsonc`, local D1 placeholder, no migrations |

**Rule: Cloudflare one-click auto-detects `npm run build` + `npm run deploy` — accept as-is. Never bare `npx wrangler deploy`.**

How `npm run deploy` differs from bare `wrangler deploy`:

1. **Config file**: `wrangler.production.jsonc` (real D1 ID) vs `wrangler.jsonc` (local dev)
2. **D1 migrations**: runs `migrations apply --remote` vs none
3. **Dashboard vars**: production config has no `vars`, so `ACCESS_*` set in the dashboard are not overwritten

**First deploy to Cloudflare:**

```bash
# 1. Create remote D1 database
npx wrangler d1 create ternssh
# Note the database_id from the output

# 2. Create local production config (pick one)

# Option A: copy template and edit account_id / database_id
npm run deploy:config
# Edit wrangler.production.jsonc

# Option B: generate from env vars (good for CI / Cloudflare Builds)
export D1_DATABASE_ID=<database_id from step 1>
export CLOUDFLARE_ACCOUNT_ID=<optional, required with multiple accounts>

# 3. Deploy
npm run release
```

**Cloudflare one-click deploy / Workers Builds (Git)**:

Cloudflare auto-detects the `build` and `deploy` scripts in `package.json`:

| Step | Command (auto-detected) |
|------|-------------------------|
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |

Accept these as-is — do not switch to `npx wrangler deploy`. The build step runs `postbuild` to generate production config; the deploy step runs migrations and publishes.

D1 is auto-discovered (database named `ternssh` on the account), or set `D1_DATABASE_ID` / `CLOUDFLARE_ACCOUNT_ID` in Build variables.

Configure auth variables (`ACCESS_*`, `BASICAUTH_*`) **only in Workers Dashboard → Variables and Secrets or Docker env**, not in wrangler config files.

> If the Deploy command uses `npx wrangler deploy`, the wrong wrangler config may overwrite dashboard variables. Switch back to `npm run deploy`.

| Component | Platform |
|-----------|----------|
| API + frontend | Cloudflare Workers (`server/public/` is the Vite output) |
| Database | Cloudflare D1 |
| SSH sessions | Durable Objects (`SshSession`) |
| Auth (optional) | Cloudflare Access / HTTP Basic Auth | Optional gate; shared workspace after auth |

**Open mode**: No auth variables configured below.

**Access mode** (Cloudflare edge): Create a Self-hosted Application in Zero Trust, then set in **Workers → Settings → Variables and Secrets**:

| Name | Type | Example |
|------|------|---------|
| `ACCESS_TEAM_DOMAIN` | Variable | `your-team.cloudflareaccess.com` (no `https://`) |
| `ACCESS_AUD` | Secret or Variable | AUD Tag from your Access app (64-char hex) |

**Basic Auth mode** (Docker / self-hosted): Set both username and password:

| Name | Type | Notes |
|------|------|-------|
| `BASICAUTH_USERNAME` | Variable | HTTP Basic Auth username |
| `BASICAUTH_PASSWORD` | Secret | HTTP Basic Auth password |

Access and Basic Auth can be enabled together (both must pass). Configure in the dashboard or Docker env vars, not in `wrangler.production.jsonc`.

When Basic Auth is enabled, **3** failed password attempts from the same IP lock access for **1 hour** (via `CF-Connecting-IP`; cleared on successful login).

The Access application **domain** must match the URL you actually visit (`workers.dev` vs custom domain need matching apps and AUD tags).
