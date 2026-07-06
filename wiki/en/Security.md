> [← README](../../README.en.md) · [Wiki](../README.md) · [中文](../zh/Home.md)
>
> [Overview](../en/Home.md) · [Features](../en/Features.md) · [Tech Stack](../en/Tech-Stack.md) · [Quick Start](../en/Getting-Started.md) · [Deployment](../en/Deployment.md) · [Docker](../en/Docker.md) · [Project Structure](../en/Project-Structure.md) · [Architecture](../en/Architecture.md) · [Widgets](../en/Widgets.md) · [API](../en/API.md) · [Database](../en/Database.md) · [Settings](../en/Settings.md) · **Security** · [Configuration](../en/Configuration.md) · [Roadmap](../en/Roadmap.md) · [License](../en/License.md)

## Security

- **Open mode** has no application-layer authentication—do not expose sensitive environments on the public internet
- Access mode is a login gate only; all verified requests use the built-in `default` user data
- SSH passwords/keys are stored in D1 `credentials` (per server); vault entries in `saved_passwords` / `saved_private_keys`
- Full-site HTTPS / WSS; DO instances isolated per session
