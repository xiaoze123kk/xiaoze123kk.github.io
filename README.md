# ZeYuan's Digital Garden

宁泽远的内容驱动个人网站，使用 Astro 构建并部署到 GitHub Pages。

## 本地运行

```powershell
npm install
npm run dev
```

访问 `http://127.0.0.1:4173/`。

生产构建：

```powershell
npm run build
npm run preview
```

## 添加内容

### 写一篇文章

在 `src/data/articles/` 新建 Markdown 文件：

```markdown
---
title: 文章标题
description: 一句话摘要
date: 2026-08-30
status: 生长中
topics:
  - AI Agent
  - 软件工程
readMinutes: 5
featured: false
draft: false
---

从这里开始写正文。
```

文件名会成为文章地址。例如 `my-note.md` 会生成 `/blog/my-note/`。首页、文章列表和详情页会自动更新。

### 添加项目、书籍、音乐或此刻

- 项目：`src/data/projects.json`
- 书架：`src/data/books.json`
- 音乐：`src/data/music.json`
- 此刻：`src/data/moments.json`
- 个人介绍、统计和技能：`src/data/site.json`

这些文件都有构建期 schema 校验。缺少字段、日期格式错误或链接无效时，`npm run build` 会直接指出问题。

### 使用拥有公开分发许可的音频

将音频放入 `public/audio/`，再在 `src/data/music.json` 对应歌曲中添加：

```json
"audio": "/audio/your-track.mp3"
```

播放器会优先使用站内音频；没有 `audio` 字段时，会自动寻找 Apple Music 官方试听。请勿把没有公开分发许可的商业录音提交到公开仓库。

### 更换头像与简历

- 头像：`public/assets/avatar.jpg`
- 简历：`public/resume.pdf`

## 项目结构

```text
src/
├─ components/        # 共享页面组件
├─ layouts/           # 页头、导航、开场与页脚
├─ pages/             # Astro 路由模板
├─ scripts/site.js    # 转场、3D 与交互
├─ styles/global.css  # 全站视觉系统
└─ data/
   ├─ articles/       # Markdown 文章
   ├─ projects.json
   ├─ books.json
   ├─ music.json
   ├─ moments.json
   └─ site.json
public/
├─ assets/
└─ resume.pdf
```

## 页面路由

- `/`：首页与内容预览
- `/blog/`：文章列表
- `/blog/<文件名>/`：文章详情
- `/projects/`：项目
- `/books/`：书架
- `/music/`：音乐
- `/moments/`：此刻

## GitHub Pages

`.github/workflows/deploy.yml` 会在推送到 `main` 后自动构建并发布 `dist/`。首次部署前，在仓库 **Settings → Pages → Source** 中选择 **GitHub Actions**。
