import { ref, computed, provide, inject, type InjectionKey } from 'vue'
import type { Todo, DatabaseTodo, TodoPriority } from '../types/todo'
import { supabase } from '../lib/supabase'

// 定义注入键
export const TodoStoreKey: InjectionKey<ReturnType<typeof createTodoStore>> = Symbol('TodoStore')

// 转换函数：数据库格式 -> 应用格式
function dbTodoToTodo(dbTodo: DatabaseTodo): Todo {
  return {
    id: dbTodo.id,
    title: dbTodo.title,
    description: dbTodo.description,
    completed: dbTodo.completed,
    priority: dbTodo.priority,
    date: dbTodo.date,
    dueTime: dbTodo.due_time,
    createdAt: dbTodo.created_at,
    updatedAt: dbTodo.updated_at
  }
}

// 转换函数：应用格式 -> 数据库格式
function todoToDbTodo(todo: Partial<Todo>): Partial<DatabaseTodo> {
  const dbTodo: Partial<DatabaseTodo> = {
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    priority: todo.priority,
    date: todo.date,
    due_time: todo.dueTime
  }

  if (todo.createdAt !== undefined) {
    dbTodo.created_at = todo.createdAt
  }
  if (todo.updatedAt !== undefined) {
    dbTodo.updated_at = todo.updatedAt
  }

  return dbTodo
}

// 创建 Todo 存储
export function createTodoStore() {
  // 状态
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 从 Supabase 获取 Todo 数据
  async function fetchTodos(startDate?: string, endDate?: string) {
    loading.value = true
    error.value = null

    try {
      let query = supabase.from('todos').select('*')

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error: fetchError } = await query.order('date', { ascending: true }).order('due_time', { ascending: true })

      if (fetchError) throw fetchError

      todos.value = (data as DatabaseTodo[])?.map(dbTodoToTodo) || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取待办事项失败'
      console.error('Error fetching todos:', err)
    } finally {
      loading.value = false
    }
  }

  // 根据日期获取 Todos
  function getTodosByDate(date: string): Todo[] {
    return todos.value.filter(t => t.date === date)
  }

  // 添加 Todo
  async function addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null

    try {
      const dbTodo = todoToDbTodo({
        ...todo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      const { data, error: insertError } = await supabase
        .from('todos')
        .insert([dbTodo])
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        todos.value.push(dbTodoToTodo(data as DatabaseTodo))
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加待办事项失败'
      console.error('Error adding todo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新 Todo
  async function updateTodo(id: string, updates: Partial<Todo>) {
    loading.value = true
    error.value = null

    try {
      const dbUpdates = todoToDbTodo({
        ...updates,
        updatedAt: new Date().toISOString()
      })

      const { data, error: updateError } = await supabase
        .from('todos')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = todos.value.findIndex(t => t.id === id)
        if (index !== -1) {
          todos.value[index] = dbTodoToTodo(data as DatabaseTodo)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新待办事项失败'
      console.error('Error updating todo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 切换完成状态
  async function toggleTodo(id: string) {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    await updateTodo(id, { completed: !todo.completed })
  }

  // 删除 Todo
  async function deleteTodo(id: string) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      todos.value = todos.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除待办事项失败'
      console.error('Error deleting todo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除某日的所有 Todos
  async function deleteTodosByDate(date: string) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('date', date)

      if (deleteError) throw deleteError

      todos.value = todos.value.filter(t => t.date !== date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除待办事项失败'
      console.error('Error deleting todos by date:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取今日 Todos
  const todayTodos = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return getTodosByDate(today)
  })

  // 获取今日完成数
  const todayCompletedCount = computed(() => {
    return todayTodos.value.filter(t => t.completed).length
  })

  // 获取今日总数
  const todayTotalCount = computed(() => {
    return todayTodos.value.length
  })

  // 获取今日完成率
  const todayCompletionRate = computed(() => {
    if (todayTotalCount.value === 0) return 0
    return Math.round((todayCompletedCount.value / todayTotalCount.value) * 100)
  })

  // 获取未完成的今日 Todos（按优先级排序）
  const todayPendingTodos = computed(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return todayTodos.value
      .filter(t => !t.completed)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  })

  return {
    // 状态
    todos: computed(() => todos.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    todayTodos,
    todayCompletedCount,
    todayTotalCount,
    todayCompletionRate,
    todayPendingTodos,

    // 方法
    fetchTodos,
    getTodosByDate,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    deleteTodosByDate
  }
}

// 提供 Todo 存储
export function provideTodoStore() {
  const store = createTodoStore()
  provide(TodoStoreKey, store)
  return store
}

// 使用 Todo 存储
export function useTodoStore() {
  const store = inject(TodoStoreKey)
  if (!store) {
    throw new Error('TodoStore not provided! Make sure to call provideTodoStore() in a parent component.')
  }
  return store
}
