# Assurance OS 技术实施说明

## 当前交付

本仓库已经新增 Next.js 16 App Router 演示产品，旧 HTML/CSS/JavaScript 文件保留作为回退版本。

新产品路由：

- `/`：营销首页与 R3F 3D 风险核心
- `/demo/assessment/`：AI 项目体检向导
- `/demo/assessment/report/`：体检报告
- `/workspace/demo/`：项目指挥中心
- `/workspace/demo/vendors/`：供应商评估
- `/workspace/demo/acceptance/`：PoC 验收

## 本地运行

```bash
npm install
npm run dev
```

生产检查：

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Cloudflare Pages

项目当前采用 Next.js Static Export。

- Build command：`npm run build`
- Build output directory：`out`
- Production branch：按仓库实际发布分支设置
- Node.js：建议使用 22 或更新的 LTS 版本

`wrangler.jsonc` 已将 Pages 输出目录配置为 `./out`。

## 架构边界

- R3F、Three.js、GSAP 与 Lenis 只运行在 Client Components。
- `<Canvas>` 通过 `next/dynamic` 且 `ssr: false` 加载。
- 业务工作台不会导入 Three.js。
- 演示业务数据通过 `demoRepository` 与领域类型访问。
- 正式产品可将 Repository 实现替换为 Cloudflare Workers + D1/R2。

## 下一阶段

正式上线还需要：

1. OpenNext + Cloudflare Workers 动态运行时。
2. D1 多租户业务数据。
3. R2 私有证据文件。
4. 服务端 Session 与组织权限。
5. 审计日志、文件扫描、通知和管理后台。
