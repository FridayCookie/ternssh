> [← README](../../README.md) · [Wiki](../README.md) · [English](../en/Home.md)
>
> [简介](../zh/Home.md) · [功能特性](../zh/Features.md) · [技术栈](../zh/Tech-Stack.md) · [快速开始](../zh/Getting-Started.md) · [部署](../zh/Deployment.md) · **Docker** · [项目结构](../zh/Project-Structure.md) · [系统架构](../zh/Architecture.md) · [小部件](../zh/Widgets.md) · [API](../zh/API.md) · [数据库](../zh/Database.md) · [设置](../zh/Settings.md) · [安全](../zh/Security.md) · [配置](../zh/Configuration.md) · [路线](../zh/Roadmap.md) · [License](../zh/License.md)

## Docker 部署（自托管）

ternssh 基于 Cloudflare Workers 运行时。Docker 镜像通过 **Wrangler 本地模式** 启动完整应用（API + 前端 + 本地 D1 + Durable Objects），适合内网自托管或快速体验，**不等同于** Cloudflare 边缘生产部署。

官方镜像托管于 [GitHub Container Registry](https://github.com/HaradaKashiwa/ternssh/pkgs/container/ternssh)。推送 `v*` 标签（如 `v1.0.0`）时会自动构建并发布到 `ghcr.io/haradakashiwa/ternssh`。

#### 使用预构建镜像（推荐）

```bash
# 拉取最新版
docker pull ghcr.io/haradakashiwa/ternssh:latest

# 启动
docker run -d \
  --name ternssh \
  -p 8787:8787 \
  -v ternssh-data:/app/.wrangler \
  --restart unless-stopped \
  ghcr.io/haradakashiwa/ternssh:latest

# 访问
open http://localhost:8787
```

指定版本（去掉 `v` 前缀，例如 tag `v1.0.0` 对应镜像 `1.0.0`）：

```bash
docker run -d \
  --name ternssh \
  -p 8787:8787 \
  -v ternssh-data:/app/.wrangler \
  ghcr.io/haradakashiwa/ternssh:1.0.0
```

Docker Compose：

```bash
# 默认 latest
docker compose -f docker-compose.ghcr.yml up -d

# 指定版本
TERNSSH_TAG=1.0.0 docker compose -f docker-compose.ghcr.yml up -d

# 自定义端口
PORT=8080 docker compose -f docker-compose.ghcr.yml up -d
```

#### 从源码构建

```bash
# 构建并启动
docker compose up -d --build

# 访问
open http://localhost:8787
```

仅使用 Docker CLI：

```bash
docker build -t ternssh .
docker run -d \
  --name ternssh \
  -p 8787:8787 \
  -v ternssh-data:/app/.wrangler \
  ternssh
```

| 项 | 说明 |
|----|------|
| 镜像地址 | `ghcr.io/haradakashiwa/ternssh`（`:latest` / `:1.0.0` / `:1.0` / `:1`） |
| 默认端口 | `8787`（可通过环境变量 `PORT` 修改） |
| 数据持久化 | 挂载卷 `/app/.wrangler`（本地 D1 与 DO 状态） |
| 健康检查 | `GET /api/health` |
| 认证 | 容器内默认为开放模式；Access 需额外配置 Workers 环境变量 |
| 发布触发 | 推送 Git tag `v*` → [docker-publish.yml](../../.github/workflows/docker-publish.yml) 自动推送到 GHCR |

> 生产环境若需全球边缘、托管 D1 与 Access 集成，请使用 `npm run release` 部署到 Cloudflare（或 Cloudflare 一键部署，自动检测 `build` + `deploy`）。
