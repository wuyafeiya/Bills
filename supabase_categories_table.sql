-- 创建 categories 表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense')),
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON categories(is_default);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

-- 启用行级安全策略 (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取分类
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  USING (true);

-- 创建策略：允许所有人插入分类（可以根据需要限制）
CREATE POLICY "Allow public insert access to categories"
  ON categories
  FOR INSERT
  WITH CHECK (true);

-- 创建策略：允许所有人更新分类
CREATE POLICY "Allow public update access to categories"
  ON categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 创建策略：只允许删除非默认分类
CREATE POLICY "Allow delete non-default categories"
  ON categories
  FOR DELETE
  USING (is_default = false);

-- 添加注释
COMMENT ON TABLE categories IS '账单分类表';
COMMENT ON COLUMN categories.id IS '分类ID';
COMMENT ON COLUMN categories.name IS '分类名称';
COMMENT ON COLUMN categories.type IS '分类类型（仅支出）';
COMMENT ON COLUMN categories.color IS '分类颜色（十六进制）';
COMMENT ON COLUMN categories.icon IS 'Font Awesome 图标名称';
COMMENT ON COLUMN categories.is_default IS '是否为默认分类';
COMMENT ON COLUMN categories.created_at IS '创建时间';
COMMENT ON COLUMN categories.updated_at IS '更新时间';
