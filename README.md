# 刘亿照个人主页

基于 Vue 3 + TypeScript + Vite + Vue Router，保留参考站的配色、排版、动画、响应式布局和原有 `.html` 链接。接口暂时使用 MSW 本地 Mock，首页、作品列表和文章均通过 `fetch` 请求统一 API。

## 开发

需要 Node.js 20.19+ 或 22.12+，推荐 Node.js 24 与 pnpm 11.25。

```sh
pnpm install
pnpm dev
```

访问 http://127.0.0.1:5173/ 。

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

构建结果在 `dist/`，可部署到静态服务器。构建脚本会生成原有作品子页的 HTML 入口，支持直接访问和刷新。

## 目录

- `src/views/`：首页、作品列表、文章详情、404 页面。
- `src/components/`：公共导航和页脚。
- `src/composables/`：滚动入场动画与生命周期清理。
- `src/api/`：请求封装、接口类型和错误处理；页面只依赖这里。
- `src/mocks/handlers.ts`：本地 Mock 接口，含模拟延迟和错误响应。
- `src/mocks/data/`：作品 JSON、文章 Markdown。
- `src/styles/`：保留的原站样式。
- `public/works/posts/assets/`：本地文章图片。

## 接口约定

成功响应为 `{ "data": ... }`，失败为 `{ "message": "..." }`。

| 接口 | 返回内容 |
| --- | --- |
| `GET /api/profile` | 姓名、主攻方向 |
| `GET /api/works?category=reverse` | 逆向项目；也支持 `review`、`tools`，省略分类返回全部 |
| `GET /api/posts/:id` | 文章元数据 `entry` 和正文 `markdown` |

文章不存在返回 404，草稿返回 409，分类无效返回 400。`src/api/types.ts` 定义字段类型。

Mock 使用浏览器 Service Worker 拦截请求，不依赖后端进程，开发和当前演示构建均默认启用。MSW 启动完成后才挂载页面，避免首个请求遗漏。Service Worker 需要 HTTPS 或 localhost。

## 接入真实后端

在 `.env.local` 中配置：

```dotenv
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-backend.example/api
```

重启开发服务或重新构建；后端按上述接口约定返回数据即可。跨域部署时配置后端 CORS 或 Vite 代理。真实后端模式不注册 Mock Worker，也不加载 Mock 数据；已有 Worker 会随页面会话退出停止拦截。

## 保留行为

整理中的作品点击后显示提示，已发布文章支持 Markdown、代码高亮、内容清理及本地图片。支持加载、空列表、请求失败重试和文章不存在状态。组件卸载时会取消请求、定时器和滚动监听。
