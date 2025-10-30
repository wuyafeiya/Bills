// Todo 优先级
export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// 优先级标签
export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  [TodoPriority.LOW]: '低',
  [TodoPriority.MEDIUM]: '中',
  [TodoPriority.HIGH]: '高'
}

// 优先级颜色
export const TODO_PRIORITY_COLORS: Record<TodoPriority, string> = {
  [TodoPriority.LOW]: '#10b981',
  [TodoPriority.MEDIUM]: '#f59e0b',
  [TodoPriority.HIGH]: '#ef4444'
}

// Todo 项
export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TodoPriority
  date: string // YYYY-MM-DD 格式
  dueTime?: string // HH:mm 格式，可选的截止时间
  createdAt: string
  updatedAt: string
}

// 数据库中的 Todo 格式（snake_case）
export interface DatabaseTodo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TodoPriority
  date: string
  due_time?: string
  created_at: string
  updated_at: string
}

// 每日 Todo 列表
export interface DailyTodos {
  date: string
  todos: Todo[]
  completedCount: number
  totalCount: number
}
