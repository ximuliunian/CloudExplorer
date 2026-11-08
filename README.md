# Cloud Explorer

本项目是一个网络分享资源管理平台，旨在为用户提供一个方便的方式来管理各种网络分享资源。使用者可以像使用 Win 的资源管理器一样来使用本项目

主要技术栈：NodeJS + pnpm + Vue3 + Vite + TypeScript

## 如何使用

> 前置条件：Node.js 18+、pnpm

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

启动后访问终端输出的地址（默认 `http://localhost:5173`）。项目已内置运行所需的 `.env`、`public`、`source`，无需额外准备上级目录。

```txt
CloudExplorer:
│  .env          # 环境变量
│
├─public         # 静态资源目录
│  │  favicon.svg    # 网站图标
│  │  disclaimer.md  # 免责声明（可选）
│  └─image
│      └─background  # 背景图片目录
│              bg-1.svg  # 背景图片
│              index.json    # 背景图片索引文件
│
└─source         # 分享资源源目录
```

> `public/api` 目录由开发服务器和构建过程自动生成，已加入 `.gitignore`，无需手动维护。

### 配置项目（环境配置）

打开项目根目录中的 `.env` 文件，按需修改以下内容

```bash
# 站点logo
VITE_FAVICON = "/favicon.svg"
# 站点标题
VITE_TITLE = ""
# 站点描述
VITE_DESCRIPTION = ""
# 站点关键字（每个使用英文逗号分割）
VITE_KEYWORDS = ""

# 秘笈
SECRET_KEY = "cloud-explorer"
# 秘笈过期时间（单位：天）
SECRET_EXPIRES = 7
```

以 `VITE_` 开头的配置项用于配置站点基本信息。`SECRET_KEY` 是访问隐藏资源的密码：分享资源的 JSON 中 `is_secret` 为 `true` 时，该资源不会直接展示在首页，只有在验证密码后才能展示和访问。`SECRET_EXPIRES` 是密钥的缓存期限（天）。

验证方式是在主页的搜索框中输入密码，然后点击搜索按钮。验证成功后即可看到隐藏资源，并按 `SECRET_EXPIRES` 天缓存验证结果。

### 配置项目（背景图片）

将背景图片放入 `public/image/background/` 目录，并在同目录的 `index.json` 中注册

```json
[
    "/image/background/1.jpg",
    "/image/background/2.jpg",
    "https://example.com/background.jpg"
]
```

既可以使用本地图片（路径以 `/image/background/` 开头），也可以直接填写网络图片地址。

### 配置项目（分享资源源目录）

将分享资源（JSON）放入 `source` 目录即可，项目会自动扫描该目录中的所有 JSON 文件。

`source` 中的文件夹会作为目录展示，目录名称就是文件夹名称；资源文件会以 JSON 中的 `title` 字段作为名称展示。

文件类型资源示例（`type` 为 `file`）：

```json
{
    "is_secret": false,
    "type": "file",
    "title": "资源名称",
    "cover": "/image/cover.png",
    "summary": "简介",
    "description": ["支持 Markdown 的多行介绍"],
    "file_url": [
        {
            "title": "分组名称",
            "content": [
                { "name": "链接名称", "url": "https://example.com" }
            ]
        }
    ]
}
```

URL 类型资源示例（`type` 为 `url`，点击后直接打开链接）：

```json
{
    "is_secret": false,
    "type": "url",
    "title": "资源名称",
    "url": "https://example.com"
}
```

> 注意：资源文件中的 `title` 字段建议不要重复，否则会出现资源名称冲突。
>
> 也可以访问 `[部署或本机地址]/add`（例如 `http://localhost:5173/#/add`）进入可视化添加资源页面，生成 JSON 后放入 `source` 目录。

### 免责声明

在 `public` 目录中创建名为 `disclaimer.md` 的文件并书写对应条款，首次访问时会弹出声明框；删除该文件则不会弹出。

## 构建与部署

```bash
# 类型检查并构建
pnpm build
```

构建产物输出到 `dist`。构建前会自动清理 `public/api`，并在 `dist/api` 中生成接口数据，部署时直接部署 `dist` 目录即可。

若使用 Vercel / Cloudflare Pages 等平台，框架预设选择 `Vite`，项目根目录选择本项目根目录，构建命令 `pnpm build`，输出目录 `dist`。

> 部署前请务必修改 `.env` 中的 `SECRET_KEY`，避免使用默认示例密码。
