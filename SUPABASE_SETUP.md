# Supabase 设置指南

## 已完成的工作

1. ✅ 修改首页只保留2个统计卡片（本月支出、总支出）
2. ✅ 删除所有收入相关功能（只保留支出功能）
3. ✅ 清空示例数据
4. ✅ 安装 Supabase 客户端库
5. ✅ 配置 Supabase 客户端（`src/lib/supabase.ts`）
6. ✅ 更新 `useBillStore` 使用 Supabase 进行数据持久化

## 下一步：配置 Supabase

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建一个新账户或登录
3. 创建一个新项目
4. 等待项目初始化完成

### 2. 创建数据库表

在 Supabase 项目的 SQL Editor 中执行以下 SQL 语句创建 `bills` 表：

\`\`\`sql
-- 创建账单表
CREATE TABLE bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'expense',
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT,
  description TEXT,
  tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX idx_bills_date ON bills(date DESC);
CREATE INDEX idx_bills_category ON bills(category);
CREATE INDEX idx_bills_type ON bills(type);

-- 启用行级安全策略 (RLS)
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有操作（开发环境）
-- 生产环境请根据实际需求配置更严格的策略
CREATE POLICY "Enable all operations for authenticated users" ON bills
  FOR ALL
  USING (true)
  WITH CHECK (true);
\`\`\`

### 3. 配置环境变量

1. 在项目根目录创建 \`.env\` 文件：

\`\`\`bash
cp .env.example .env
\`\`\`

2. 在 Supabase 项目设置中找到 API 凭据：
   - 进入项目设置 (Project Settings)
   - 选择 API 选项卡
   - 复制 "Project URL" 和 "anon public" key

3. 编辑 \`.env\` 文件，填入你的 Supabase 配置：

\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
pnpm dev
\`\`\`

## 功能说明

### 数据库字段映射

| TypeScript 字段 | 数据库字段 | 类型 | 说明 |
|----------------|-----------|------|------|
| id | id | UUID | 主键，自动生成 |
| type | type | TEXT | 账单类型（固定为 'expense'） |
| title | title | TEXT | 账单标题 |
| amount | amount | DECIMAL | 金额 |
| category | category | TEXT | 分类 |
| date | date | DATE | 日期 |
| paymentMethod | payment_method | TEXT | 支付方式（可选） |
| description | description | TEXT | 描述（可选） |
| tags | tags | TEXT[] | 标签数组（可选） |
| imageUrl | image_url | TEXT | 图片 URL（可选） |
| createdAt | created_at | TIMESTAMPTZ | 创建时间 |
| updatedAt | updated_at | TIMESTAMPTZ | 更新时间 |

### 可用分类

- 餐饮 (food)
- 交通 (transport)
- 购物 (shopping)
- 娱乐 (entertainment)
- 水电费 (utilities)
- 医疗 (health)
- 教育 (education)
- 其他 (other)

### 可用支付方式

- 现金 (cash)
- 微信 (wechat)
- 支付宝 (alipay)
- 银行卡 (card)
- 其他 (other)

## 注意事项

1. **安全性**：生产环境请配置更严格的 RLS 策略
2. **类型检查**：Supabase 使用 snake_case，TypeScript 使用 camelCase，数据会自动转换
3. **图片存储**：当前使用 base64 存储图片，大规模使用建议改用 Supabase Storage
4. **错误处理**：所有数据库操作都包含错误处理，错误会在控制台显示

## 下一步优化建议

1. 配置 Supabase Auth 进行用户认证
2. 使用 Supabase Storage 存储账单图片
3. 启用实时订阅功能，多设备同步数据
4. 添加数据导出/导入功能
5. 配置更细粒度的 RLS 策略保护数据安全
