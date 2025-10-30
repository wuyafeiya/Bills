-- 创建食谱表
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS recipes_date_idx ON recipes (date);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes (created_at DESC);

-- 添加注释
COMMENT ON TABLE recipes IS '每日食谱表';
COMMENT ON COLUMN recipes.id IS '主键';
COMMENT ON COLUMN recipes.date IS '日期 (YYYY-MM-DD)';
COMMENT ON COLUMN recipes.meals IS '餐次数据 (JSON格式)';
COMMENT ON COLUMN recipes.created_at IS '创建时间';
COMMENT ON COLUMN recipes.updated_at IS '更新时间';

-- 启用 RLS (Row Level Security)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有操作（根据实际需求调整）
CREATE POLICY "Enable all operations for all users" ON recipes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 或者如果你需要用户认证，可以使用以下策略（需要先设置认证）
-- CREATE POLICY "Enable read access for all users" ON recipes FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON recipes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY "Enable update for authenticated users only" ON recipes FOR UPDATE USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "Enable delete for authenticated users only" ON recipes FOR DELETE USING (auth.uid() IS NOT NULL);
