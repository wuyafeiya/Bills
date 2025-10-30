import { ref, computed, provide, inject, type InjectionKey } from 'vue'
import type { DailyRecipe, DatabaseRecipe, Meal, Dish, MealType } from '../types/recipe'
import { supabase } from '../lib/supabase'

// 定义注入键
export const RecipeStoreKey: InjectionKey<ReturnType<typeof createRecipeStore>> = Symbol('RecipeStore')

// 转换函数：数据库格式 -> 应用格式
function dbRecipeToRecipe(dbRecipe: DatabaseRecipe): DailyRecipe {
  return {
    id: dbRecipe.id,
    date: dbRecipe.date,
    meals: dbRecipe.meals,
    createdAt: dbRecipe.created_at,
    updatedAt: dbRecipe.updated_at
  }
}

// 转换函数：应用格式 -> 数据库格式
function recipeToDbRecipe(recipe: Partial<DailyRecipe>): Partial<DatabaseRecipe> {
  const dbRecipe: Partial<DatabaseRecipe> = {
    date: recipe.date,
    meals: recipe.meals
  }

  if (recipe.createdAt !== undefined) {
    dbRecipe.created_at = recipe.createdAt
  }
  if (recipe.updatedAt !== undefined) {
    dbRecipe.updated_at = recipe.updatedAt
  }

  return dbRecipe
}

// 创建食谱存储
export function createRecipeStore() {
  // 状态
  const recipes = ref<DailyRecipe[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 从 Supabase 获取食谱数据
  async function fetchRecipes(startDate?: string, endDate?: string) {
    loading.value = true
    error.value = null

    try {
      let query = supabase.from('recipes').select('*')

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error: fetchError } = await query.order('date', { ascending: true })

      if (fetchError) throw fetchError

      recipes.value = (data as DatabaseRecipe[])?.map(dbRecipeToRecipe) || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取食谱失败'
      console.error('Error fetching recipes:', err)
    } finally {
      loading.value = false
    }
  }

  // 根据日期获取食谱
  function getRecipeByDate(date: string): DailyRecipe | undefined {
    return recipes.value.find(r => r.date === date)
  }

  // 添加或更新食谱
  async function saveRecipe(date: string, meals: Meal[]) {
    loading.value = true
    error.value = null

    try {
      const existingRecipe = getRecipeByDate(date)

      if (existingRecipe) {
        // 更新现有食谱
        const dbUpdates = recipeToDbRecipe({
          meals,
          updatedAt: new Date().toISOString()
        })

        const { data, error: updateError } = await supabase
          .from('recipes')
          .update(dbUpdates)
          .eq('id', existingRecipe.id)
          .select()
          .single()

        if (updateError) throw updateError

        if (data) {
          const index = recipes.value.findIndex(r => r.id === existingRecipe.id)
          if (index !== -1) {
            recipes.value[index] = dbRecipeToRecipe(data as DatabaseRecipe)
          }
        }
      } else {
        // 创建新食谱
        const dbRecipe = recipeToDbRecipe({
          date,
          meals,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        const { data, error: insertError } = await supabase
          .from('recipes')
          .insert([dbRecipe])
          .select()
          .single()

        if (insertError) throw insertError

        if (data) {
          recipes.value.push(dbRecipeToRecipe(data as DatabaseRecipe))
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存食谱失败'
      console.error('Error saving recipe:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除食谱
  async function deleteRecipe(date: string) {
    loading.value = true
    error.value = null

    try {
      const recipe = getRecipeByDate(date)
      if (!recipe) return

      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id)

      if (deleteError) throw deleteError

      recipes.value = recipes.value.filter(r => r.id !== recipe.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除食谱失败'
      console.error('Error deleting recipe:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除所有食谱
  async function deleteAllRecipes() {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有记录

      if (deleteError) throw deleteError

      recipes.value = []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除所有食谱失败'
      console.error('Error deleting all recipes:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 复制食谱到其他日期
  async function copyRecipe(fromDate: string, toDate: string) {
    const sourceRecipe = getRecipeByDate(fromDate)
    if (!sourceRecipe) {
      throw new Error('源食谱不存在')
    }

    await saveRecipe(toDate, sourceRecipe.meals)
  }

  // 获取今日食谱
  const todayRecipe = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return getRecipeByDate(today)
  })

  // 获取明日食谱
  const tomorrowRecipe = computed(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    return getRecipeByDate(tomorrowStr)
  })

  // 获取本周食谱
  const weekRecipes = computed(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // 周日

    const weekDates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDates.push(date.toISOString().split('T')[0])
    }

    return weekDates.map(date => ({
      date,
      recipe: getRecipeByDate(date)
    }))
  })

  return {
    // 状态
    recipes: computed(() => recipes.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    todayRecipe,
    tomorrowRecipe,
    weekRecipes,

    // 方法
    fetchRecipes,
    getRecipeByDate,
    saveRecipe,
    deleteRecipe,
    deleteAllRecipes,
    copyRecipe
  }
}

// 提供食谱存储
export function provideRecipeStore() {
  const store = createRecipeStore()
  provide(RecipeStoreKey, store)
  return store
}

// 使用食谱存储
export function useRecipeStore() {
  const store = inject(RecipeStoreKey)
  if (!store) {
    throw new Error('RecipeStore not provided! Make sure to call provideRecipeStore() in a parent component.')
  }
  return store
}
