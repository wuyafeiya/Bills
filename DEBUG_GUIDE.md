# 数据库连接调试指南

## 已修复的问题

✅ **修复了字段名称映射问题**
- 添加了 `DatabaseBill` 类型，使用 snake_case 字段（`payment_method`, `image_url`, `created_at`, `updated_at`）
- 添加了转换函数 `dbBillToBill()` 和 `billToDbBill()` 在应用格式和数据库格式之间转换
- 更新了所有 Supabase 操作使用转换函数

✅ **修复了异步调用问题**
- 在 BillForm.vue 的 `handleSubmit` 函数中添加了 `await` 关键字
- 添加了错误日志输出到控制台

## 调试步骤

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 选项卡：

1. 尝试添加一条账单
2. 查看是否有红色错误信息
3. 检查是否有 "Error adding bill:" 开头的错误日志

### 2. 检查环境变量

确认 `.env` 文件配置正确：

\`\`\`bash
# 查看环境变量文件
cat .env
\`\`\`

应该包含：
\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...（很长的字符串）
\`\`\`

### 3. 验证 Supabase 连接

在浏览器控制台执行以下代码测试连接：

\`\`\`javascript
// 打开浏览器控制台（F12），粘贴以下代码：
const testConnection = async () => {
  const { createClient } = await import('@supabase/supabase-js')
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  console.log('Supabase URL:', url)
  console.log('Supabase Key (前20字符):', key?.substring(0, 20) + '...')

  const supabase = createClient(url, key)

  // 测试查询
  const { data, error } = await supabase.from('bills').select('count')

  if (error) {
    console.error('连接失败:', error)
  } else {
    console.log('连接成功!', data)
  }
}

testConnection()
\`\`\`

### 4. 检查数据库表结构

在 Supabase Dashboard 的 Table Editor 中确认：

1. ✅ 表名是 `bills`（小写）
2. ✅ 字段使用 snake_case：
   - `id` (uuid)
   - `type` (text)
   - `title` (text)
   - `amount` (numeric)
   - `category` (text)
   - `date` (date)
   - `payment_method` (text, nullable)
   - `description` (text, nullable)
   - `tags` (text[], nullable)
   - `image_url` (text, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### 5. 检查 RLS 策略

在 Supabase Dashboard 的 Authentication > Policies：

1. 确认 RLS 已启用
2. 确认有策略允许插入数据
3. 临时测试：可以暂时禁用 RLS 来确认是权限问题

\`\`\`sql
-- 临时禁用 RLS（仅用于测试，测试后记得重新启用）
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;

-- 测试后重新启用
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
\`\`\`

### 6. 手动测试插入

在 Supabase Dashboard 的 SQL Editor 中执行：

\`\`\`sql
-- 测试手动插入
INSERT INTO bills (type, title, amount, category, date)
VALUES ('expense', '测试账单', 100.00, 'food', CURRENT_DATE);

-- 查询确认
SELECT * FROM bills ORDER BY created_at DESC LIMIT 1;
\`\`\`

### 7. 查看网络请求

在浏览器开发者工具的 Network 选项卡：

1. 筛选 Fetch/XHR 请求
2. 尝试添加账单
3. 查找 supabase.co 的请求
4. 检查请求的 Response：
   - 如果状态码 200/201：成功
   - 如果状态码 400：请求格式错误
   - 如果状态码 401/403：权限问题
   - 如果状态码 500：服务器错误

## 常见问题解决方案

### 问题 1: "Missing Supabase environment variables"

**原因**: 环境变量未正确加载

**解决**:
1. 确认 .env 文件在项目根目录
2. 重启开发服务器：`Ctrl+C` 然后 `pnpm dev`
3. 确认变量名以 `VITE_` 开头

### 问题 2: "relation 'bills' does not exist"

**原因**: 数据库表未创建

**解决**:
在 Supabase SQL Editor 中运行 SUPABASE_SETUP.md 中的 SQL 脚本

### 问题 3: "new row violates row-level security policy"

**原因**: RLS 策略配置问题

**解决**:
\`\`\`sql
-- 创建允许所有操作的策略（开发环境）
CREATE POLICY "Enable all for development" ON bills
  FOR ALL
  USING (true)
  WITH CHECK (true);
\`\`\`

### 问题 4: 数据插入成功但界面不更新

**原因**: 前端状态未刷新

**解决**:
1. 检查 `provideBillStore()` 中的 `fetchBills()` 是否被调用
2. 检查 `addBill()` 函数是否正确更新了 `bills.value`

### 问题 5: "column 'paymentMethod' does not exist"

**原因**: 字段名称不匹配（已修复）

**解决**:
确保使用最新代码，已经添加了字段转换功能

## 获取详细错误信息

在 `src/lib/supabase.ts` 中添加调试日志：

\`\`\`typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase 初始化:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false  // 如果不需要用户认证，可以禁用会话持久化
  }
})
\`\`\`

## 需要更多帮助？

如果以上步骤都无法解决问题，请提供以下信息：

1. 浏览器控制台的完整错误信息
2. Network 选项卡中失败请求的详细信息
3. Supabase 表结构截图
4. RLS 策略配置
