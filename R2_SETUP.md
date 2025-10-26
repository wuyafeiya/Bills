# Cloudflare R2 图片存储设置指南

## 概述

本指南将帮助你设置 Cloudflare R2 对象存储来存储账单图片，替代 base64 方式存储图片。

## 优势

- ✅ **性能更好**：图片存储在 CDN，加载速度快
- ✅ **数据库更轻**：不在数据库中存储大型 base64 字符串
- ✅ **成本更低**：R2 存储非常便宜，无出口流量费用
- ✅ **可扩展**：支持大量图片存储

## 前置条件

- Cloudflare 账号（免费账号即可）
- 已安装 Node.js 和 npm
- Wrangler CLI（Cloudflare 的命令行工具）

## 步骤 1：创建 Cloudflare R2 存储桶

### 1.1 登录 Cloudflare Dashboard

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)

### 1.2 创建 R2 存储桶

1. 在左侧菜单中选择 **R2**
2. 点击 **Create bucket**
3. 输入存储桶名称，例如：\`bill-images\`
4. 选择位置（建议选择离你用户最近的区域）
5. 点击 **Create bucket**

### 1.3 配置公开访问（可选但推荐）

有两种方式让图片可以公开访问：

**方式 1：自定义域名（推荐）**

1. 在存储桶设置中，点击 **Settings** 标签
2. 找到 **Public access** 部分
3. 点击 **Connect Domain**
4. 选择或添加你的域名（例如：\`images.yourdomain.com\`）
5. 按照提示完成 DNS 设置

**方式 2：使用 R2.dev 域名**

1. 在存储桶设置中，启用 **Public access**
2. 你会获得一个 \`.r2.dev\` 域名
3. 注意：这个域名有使用限制，不建议生产环境使用

## 步骤 2：安装 Wrangler CLI

```bash
# 全局安装 Wrangler
npm install -g wrangler

# 或者使用项目本地安装
npm install --save-dev wrangler
```

## 步骤 3：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器进行认证。

## 步骤 4：配置 Worker

### 4.1 编辑 wrangler.toml

打开 \`worker/wrangler.toml\`，修改以下配置：

```toml
#:schema node_modules/wrangler/config-schema.json
name = "bill-image-upload"  # 你的 Worker 名称
main = "upload-image.js"
compatibility_date = "2024-01-01"

# R2 存储桶绑定
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "bill-images"  # 替换为你在步骤 1.2 创建的存储桶名称

# 环境变量
[vars]
R2_PUBLIC_URL = "https://images.yourdomain.com"  # 替换为你的 R2 公开域名
```

**重要**：
- \`bucket_name\` 必须与你在步骤 1.2 创建的存储桶名称完全一致
- \`R2_PUBLIC_URL\` 应该是你的自定义域名，不要包含结尾的斜杠

## 步骤 5：部署 Worker

```bash
# 进入 worker 目录
cd worker

# 部署到 Cloudflare
wrangler deploy
```

部署成功后，你会看到类似输出：

```
✨ Published bill-image-upload (0.01 sec)
  https://bill-image-upload.your-subdomain.workers.dev
```

**记下这个 URL**，你需要在下一步使用它。

## 步骤 6：配置前端环境变量

编辑项目根目录的 \`.env\` 文件（如果不存在，从 \`.env.example\` 复制）：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudflare R2 图片上传配置
VITE_CLOUDFLARE_WORKER_URL=https://bill-image-upload.your-subdomain.workers.dev
```

将 \`VITE_CLOUDFLARE_WORKER_URL\` 替换为步骤 5 中获得的 Worker URL。

## 步骤 7：测试上传

1. 重启开发服务器：
   ```bash
   # 按 Ctrl+C 停止当前服务器
   # 然后重新启动
   pnpm dev
   ```

2. 打开应用，尝试添加一个账单并上传图片

3. 如果配置正确，你应该看到：
   - "正在上传图片..." 提示
   - "图片上传成功" 提示
   - 图片预览正常显示

## 验证上传

### 在 Cloudflare Dashboard 中查看

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **R2** → 选择你的存储桶
3. 你应该能看到上传的图片文件（在 \`bills/\` 目录下）

### 检查图片 URL

上传成功后，数据库中保存的 \`image_url\` 应该类似：

```
https://images.yourdomain.com/bills/1234567890-abc123.jpg
```

## 故障排除

### 问题 1：上传失败，显示 "未配置 Cloudflare Worker URL"

**解决**：
1. 确认 \`.env\` 文件中有 \`VITE_CLOUDFLARE_WORKER_URL\`
2. 重启开发服务器（环境变量只在启动时加载）

### 问题 2：上传失败，CORS 错误

**解决**：Worker 已经配置了 CORS，但如果还有问题：
1. 检查 Worker 部署是否成功
2. 确认 Worker URL 正确

### 问题 3：图片上传成功但无法显示

**原因**：公开访问未正确配置

**解决**：
1. 确认 R2 存储桶已启用公开访问
2. 确认自定义域名 DNS 设置正确
3. 检查 \`wrangler.toml\` 中的 \`R2_PUBLIC_URL\` 是否正确

### 问题 4：Worker 部署失败

**可能原因**：
- Wrangler 未登录：运行 \`wrangler login\`
- 存储桶不存在：确认存储桶名称正确
- 权限不足：确认你的 Cloudflare 账号有权限

## 备用方案

如果 R2 上传失败，应用会**自动回退**到 base64 存储：

1. 你会看到警告消息："已使用本地存储（图片较大时可能影响性能）"
2. 图片仍然会保存，但会存储在数据库中
3. 这样可以确保应用始终可用，即使 R2 配置有问题

## 成本说明

Cloudflare R2 定价（截至 2024 年）：

- **存储**：$0.015/GB/月
- **Class A 操作**（写入）：$4.50/百万次请求
- **Class B 操作**（读取）：$0.36/百万次请求
- **出口流量**：**免费**（这是最大优势！）

### 成本估算

假设你每月：
- 上传 1000 张图片，平均每张 500KB
- 查看这些图片 10000 次

**月成本**：
- 存储：1000 × 0.5MB = 500MB ≈ 0.5GB → $0.0075
- 写入：1000 次 → $0.0045
- 读取：10000 次 → $0.0036
- **总计**：约 $0.02（2 分钱）

实际上，免费额度已经足够大多数个人使用！

## 下一步优化

设置完成后，你可以考虑：

1. **图片优化**：在 Worker 中添加图片压缩和格式转换
2. **CDN 加速**：Cloudflare 会自动提供全球 CDN
3. **访问控制**：添加更严格的权限验证
4. **监控和日志**：在 Cloudflare Dashboard 查看使用情况

## 需要帮助？

如果遇到问题：

1. 检查浏览器控制台的错误信息
2. 查看 Cloudflare Dashboard 的 Worker 日志
3. 确认所有配置文件正确
4. 检查 \`DEBUG_GUIDE.md\` 中的调试步骤
