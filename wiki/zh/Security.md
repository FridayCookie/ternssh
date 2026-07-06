> [← README](../../README.md) · [Wiki](../README.md) · [English](../en/Home.md)
>
> [简介](../zh/Home.md) · [功能特性](../zh/Features.md) · [技术栈](../zh/Tech-Stack.md) · [快速开始](../zh/Getting-Started.md) · [部署](../zh/Deployment.md) · [Docker](../zh/Docker.md) · [项目结构](../zh/Project-Structure.md) · [系统架构](../zh/Architecture.md) · [小部件](../zh/Widgets.md) · [API](../zh/API.md) · [数据库](../zh/Database.md) · [设置](../zh/Settings.md) · **安全** · [配置](../zh/Configuration.md) · [路线](../zh/Roadmap.md) · [License](../zh/License.md)

## 安全说明

- **开放模式**无应用层认证，请勿在公网暴露敏感环境
- Access 模式仅作登录门禁，所有通过校验的请求使用内置用户 `default` 的数据
- SSH 密码/私钥存于 D1 `credentials` 表（按服务器引用）；vault 条目存于 `saved_passwords` / `saved_private_keys`
- 全站 HTTPS / WSS；DO 实例按 session 隔离
