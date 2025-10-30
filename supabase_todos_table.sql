-- 创建 todos 表
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
    date DATE NOT NULL,
    due_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_todos_date ON public.todos(date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略（RLS）
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（如果需要认证，可以修改这些策略）
CREATE POLICY "Enable all access for todos" ON public.todos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 添加注释
COMMENT ON TABLE public.todos IS '每日计划待办事项表';
COMMENT ON COLUMN public.todos.id IS '待办事项唯一标识';
COMMENT ON COLUMN public.todos.title IS '待办事项标题';
COMMENT ON COLUMN public.todos.description IS '待办事项详细描述';
COMMENT ON COLUMN public.todos.completed IS '是否已完成';
COMMENT ON COLUMN public.todos.priority IS '优先级：low(低), medium(中), high(高)';
COMMENT ON COLUMN public.todos.date IS '计划日期';
COMMENT ON COLUMN public.todos.due_time IS '截止时间（可选）';
COMMENT ON COLUMN public.todos.created_at IS '创建时间';
COMMENT ON COLUMN public.todos.updated_at IS '更新时间';
