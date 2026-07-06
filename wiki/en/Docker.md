> [← README](../../README.en.md) · [Wiki](../README.md) · [中文](../zh/Home.md)
>
> [Overview](../en/Home.md) · [Features](../en/Features.md) · [Tech Stack](../en/Tech-Stack.md) · [Quick Start](../en/Getting-Started.md) · [Deployment](../en/Deployment.md) · **Docker** · [Project Structure](../en/Project-Structure.md) · [Architecture](../en/Architecture.md) · [Widgets](../en/Widgets.md) · [API](../en/API.md) · [Database](../en/Database.md) · [Settings](../en/Settings.md) · [Security](../en/Security.md) · [Configuration](../en/Configuration.md) · [Roadmap](../en/Roadmap.md) · [License](../en/License.md)

## Docker (self-hosted)

ternssh is built on the Cloudflare Workers runtime. The Docker image runs the full app (API + frontend + local D1 + Durable Objects) via **Wrangler local mode**—suitable for private self-hosting or quick trials, **not equivalent** to Cloudflare edge production deployment.

Official images are hosted on [GitHub Container Registry](https://github.com/HaradaKashiwa/ternssh/pkgs/container/ternssh). Pushing a `v*` tag (e.g. `v1.0.0`) triggers a build and publish to `ghcr.io/haradakashiwa/ternssh`.

#### Pre-built image (recommended)

```bash
# Pull latest
docker pull ghcr.io/haradakashiwa/ternssh:latest

# Run
docker run -d \
  --name ternssh \
  -p 8787:8787 \
  -v ternssh-data:/app/.wrangler \
  --restart unless-stopped \
  ghcr.io/haradakashiwa/ternssh:latest

# Open
open http://localhost:8787
```

Pin a version (strip the `v` prefix; tag `v1.0.0` → image `1.0.0`):

```bash
docker run -d \
  --name ternssh \
  -p 8787:8787 \
  -v ternssh-data:/app/.wrangler \
  ghcr.io/haradakashiwa/ternssh:1.0.0
```

Docker Compose:

```bash
# Default latest
docker compose -f docker-compose.ghcr.yml up -d

# Pin version
TERNSSH_TAG=1.0.0 docker compose -f docker-compose.ghcr.yml up -d

# Custom port
PORT=8080 docker compose -f docker-compose.ghcr.yml up -d
```

#### Build from source

```bash
# Build and start
docker compose up -d --build

# Open
open http://localhost:8787
```

Docker CLI only:

```bash
docker build -t ternssh .
docker run -d \
  --name ternssh \
  -p 8787:8787 \
  -v ternssh-data:/app/.wrangler \
  ternssh
```

| Item | Notes |
|------|-------|
| Image | `ghcr.io/haradakashiwa/ternssh` (`:latest` / `:1.0.0` / `:1.0` / `:1`) |
| Default port | `8787` (override with `PORT`) |
| Persistence | Volume `/app/.wrangler` (local D1 and DO state) |
| Health check | `GET /api/health` |
| Auth | Open mode by default in container; Access requires extra Workers env vars |
| Publish trigger | Push Git tag `v*` → [docker-publish.yml](../../.github/workflows/docker-publish.yml) publishes to GHCR |

> For global edge, managed D1, and Access integration in production, deploy to Cloudflare with `npm run release` (or use Cloudflare one-click deploy, which auto-detects `build` + `deploy`).
