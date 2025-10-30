// 餐次类型
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

// 餐次显示名称
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.BREAKFAST]: '早餐',
  [MealType.LUNCH]: '午餐',
  [MealType.DINNER]: '晚餐',
  [MealType.SNACK]: '加餐'
}

// 餐次图标
export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  [MealType.BREAKFAST]: 'coffee',
  [MealType.LUNCH]: 'utensils',
  [MealType.DINNER]: 'pizza-slice',
  [MealType.SNACK]: 'ice-cream'
}

// 餐次颜色
export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  [MealType.BREAKFAST]: '#ffd93d',
  [MealType.LUNCH]: '#6bcf7f',
  [MealType.DINNER]: '#ff6b9d',
  [MealType.SNACK]: '#c9a0dc'
}

// 菜品接口
export interface Dish {
  id: string
  name: string
  ingredients?: string[]  // 食材列表
  notes?: string          // 备注
}

// 单个餐次接口
export interface Meal {
  id: string
  type: MealType
  dishes: Dish[]
  notes?: string
}

// 每日食谱接口
export interface DailyRecipe {
  id: string
  date: string           // YYYY-MM-DD 格式
  meals: Meal[]
  createdAt: string
  updatedAt: string
}

// 数据库食谱接口（snake_case，匹配 Supabase 表结构）
export interface DatabaseRecipe {
  id: string
  date: string
  meals: Meal[]          // JSON 格式存储
  created_at: string
  updated_at: string
}
