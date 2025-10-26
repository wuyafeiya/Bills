# 图片上传 Worker

这是一个 Cloudflare Worker，用于处理账单图片上传到 R2 存储。

## 快速开始

### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置 wrangler.toml

编辑 \`wrangler.toml\` 文件：

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "bill-images"  # 替换为你的 R2 存储桶名称

[vars]
R2_PUBLIC_URL = "https://images.yourdomain.com"  # 替换为你的 R2 公开域名
```

### 4. 部署

```bash
npm run deploy
# 或者
wrangler deploy
```

### 5. 获取 Worker URL

部署成功后，你会看到 Worker URL，例如：
\`\`\`
https://bill-image-upload.your-subdomain.workers.dev
\`\`\`

将此 URL 添加到前端项目的 \`.env\` 文件中：
\`\`\`env
VITE_CLOUDFLARE_WORKER_URL=https://bill-image-upload.your-subdomain.workers.dev
\`\`\`

## 本地开发

```bash
npm run dev
# 或者
wrangler dev
```

这会启动本地开发服务器，通常在 \`http://localhost:8787\`

## 查看日志

```bash
npm run tail
# 或者
wrangler tail
```

实时查看 Worker 的日志输出。

## API 端点

### POST /

上传图片到 R2

**请求**：
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'image' field

**响应**：
```json
{
  "success": true,
  "url": "https://images.yourdomain.com/bills/1234567890-abc123.jpg",
  "fileName": "bills/1234567890-abc123.jpg"
}
```

**错误响应**：
```json
{
  "error": "Error message"
}
```

## 支持的文件类型

- image/jpeg
- image/jpg
- image/png
- image/webp
- image/gif

## 文件大小限制

最大 5MB

## 更多信息

查看项目根目录的 \`R2_SETUP.md\` 获取完整设置指南。
