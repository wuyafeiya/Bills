import { ref, computed, onMounted } from 'vue'
import type { CustomCategory, DatabaseCategory, Tag } from '../types/category'
import { supabase } from '../lib/supabase'

const TAGS_STORAGE_KEY = 'bill_tags'
const MIGRATION_FLAG_KEY = 'categories_migrated_to_supabase'
const OLD_CATEGORIES_KEY = 'bill_custom_categories'

// 旧枚举值到新分类ID的映射（用于兼容旧数据）
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'food': 'cat_food',
  'transport': 'cat_transport',
  'shopping': 'cat_shopping',
  'entertainment': 'cat_entertainment',
  'utilities': 'cat_utilities',
  'health': 'cat_health',
  'education': 'cat_education',
  'other': 'cat_other_expense'
}

// 转换函数：数据库格式 -> 应用格式
function dbCategoryToCategory(dbCategory: DatabaseCategory): CustomCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    type: dbCategory.type,
    color: dbCategory.color,
    icon: dbCategory.icon,
    isDefault: dbCategory.is_default,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

// 转换函数：应用格式 -> 数据库格式
function categoryToDbCategory(category: Partial<CustomCategory>): Partial<DatabaseCategory> {
  const dbCategory: Partial<DatabaseCategory> = {
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
  }

  if (category.id !== undefined) {
    dbCategory.id = category.id
  }
  if (category.isDefault !== undefined) {
    dbCategory.is_default = category.isDefault
  }
  if (category.createdAt !== undefined) {
    dbCategory.created_at = category.createdAt
  }
  if (category.updatedAt !== undefined) {
    dbCategory.updated_at = category.updatedAt
  }

  return dbCategory
}

// 默认分类数据（只有支出分类）
const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'cat_food', name: '餐饮', type: 'expense', color: '#ff922b', icon: 'utensils', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_transport', name: '交通', type: 'expense', color: '#339af0', icon: 'bus', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_shopping', name: '购物', type: 'expense', color: '#f06595', icon: 'shopping-cart', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_entertainment', name: '娱乐', type: 'expense', color: '#cc5de8', icon: 'film', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_utilities', name: '水电费', type: 'expense', color: '#51cf66', icon: 'bolt', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_health', name: '医疗', type: 'expense', color: '#ff6b6b', icon: 'heartbeat', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_education', name: '教育', type: 'expense', color: '#fcc419', icon: 'graduation-cap', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat_other_expense', name: '其他', type: 'expense', color: '#868e96', icon: 'ellipsis-h', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

// 分类数据
const categories = ref<CustomCategory[]>([])
// 标签数据
const tags = ref<Tag[]>([])
// 加载状态
const loading = ref(false)
const error = ref<string | null>(null)

// 从 Supabase 获取所有分类
async function fetchCategories() {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError

    // 转换数据库格式到应用格式
    categories.value = (data as DatabaseCategory[])?.map(dbCategoryToCategory) || []

    // 如果数据库为空，初始化默认分类
    if (categories.value.length === 0) {
      await initializeDefaultCategories()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取分类失败'
    console.error('Error fetching categories:', err)
    // 如果获取失败，使用默认分类
    categories.value = [...DEFAULT_CATEGORIES]
  } finally {
    loading.value = false
  }
}

// 初始化默认分类到数据库
async function initializeDefaultCategories() {
  try {
    const dbCategories = DEFAULT_CATEGORIES.map(cat => categoryToDbCategory(cat))

    const { error: insertError } = await supabase
      .from('categories')
      .insert(dbCategories)

    if (insertError) throw insertError

    categories.value = [...DEFAULT_CATEGORIES]
  } catch (err) {
    console.error('Error initializing default categories:', err)
    categories.value = [...DEFAULT_CATEGORIES]
  }
}

// 从 LocalStorage 迁移分类到 Supabase（仅执行一次）
async function migrateFromLocalStorage() {
  const migrated = localStorage.getItem(MIGRATION_FLAG_KEY)
  if (migrated) return // 已经迁移过

  const oldCategories = localStorage.getItem(OLD_CATEGORIES_KEY)
  if (!oldCategories) {
    // 没有旧数据，标记为已迁移
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true')
    return
  }

  try {
    const parsedCategories: CustomCategory[] = JSON.parse(oldCategories)

    // 获取数据库中现有的分类ID
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')

    const existingIds = new Set(existingCategories?.map(cat => cat.id) || [])

    // 过滤出不存在的分类
    const newCategories = parsedCategories.filter(cat => !existingIds.has(cat.id))

    if (newCategories.length > 0) {
      const dbCategories = newCategories.map(cat => categoryToDbCategory(cat))

      const { error: insertError } = await supabase
        .from('categories')
        .insert(dbCategories)

      if (insertError) throw insertError

      console.log(`成功迁移 ${newCategories.length} 个分类到 Supabase`)
    }

    // 标记为已迁移
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true')
  } catch (err) {
    console.error('Error migrating categories:', err)
  }
}

// 初始化标签数据
function initTags() {
  const stored = localStorage.getItem(TAGS_STORAGE_KEY)
  if (stored) {
    try {
      tags.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse tags from localStorage', e)
      tags.value = []
      saveTags()
    }
  } else {
    tags.value = []
    saveTags()
  }
}

// 保存标签到 localStorage
function saveTags() {
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags.value))
}

export function useCategoryStore() {
  // 初始化数据
  onMounted(async () => {
    if (categories.value.length === 0) {
      // 先尝试迁移 LocalStorage 数据
      await migrateFromLocalStorage()
      // 然后从 Supabase 获取分类
      await fetchCategories()
    }
    if (tags.value.length === 0) {
      initTags()
    }
  })

  // 计算属性：支出分类
  const expenseCategories = computed(() =>
    categories.value.filter(cat => cat.type === 'expense')
  )

  // 添加分类
  async function addCategory(category: Omit<CustomCategory, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null

    try {
      const newCategory: CustomCategory = {
        ...category,
        id: `cat_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 转换为数据库格式
      const dbCategory = categoryToDbCategory(newCategory)

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([dbCategory])
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        // 转换回应用格式并添加到列表
        categories.value.push(dbCategoryToCategory(data as DatabaseCategory))
      }

      return newCategory
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加分类失败'
      console.error('Error adding category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新分类
  async function updateCategory(id: string, updates: Partial<CustomCategory>) {
    loading.value = true
    error.value = null

    try {
      // 转换为数据库格式
      const dbUpdates = categoryToDbCategory({
        ...updates,
        updatedAt: new Date().toISOString()
      })

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = categories.value.findIndex(cat => cat.id === id)
        if (index !== -1) {
          // 转换回应用格式
          categories.value[index] = dbCategoryToCategory(data as DatabaseCategory)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新分类失败'
      console.error('Error updating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除分类（只能删除非默认分类）
  async function deleteCategory(id: string) {
    const category = categories.value.find(cat => cat.id === id)
    if (!category || category.isDefault) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      categories.value = categories.value.filter(cat => cat.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除分类失败'
      console.error('Error deleting category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 根据 ID 获取分类（兼容旧枚举值）
  function getCategoryById(id: string) {
    // 先尝试直接匹配
    let category = categories.value.find(cat => cat.id === id)

    // 如果没找到，尝试使用旧枚举值映射
    if (!category && LEGACY_CATEGORY_MAP[id]) {
      category = categories.value.find(cat => cat.id === LEGACY_CATEGORY_MAP[id])
    }

    return category
  }

  // 添加标签
  function addTag(tag: Omit<Tag, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) {
    const newTag: Tag = {
      ...tag,
      id: `tag_${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tags.value.push(newTag)
    saveTags()
    return newTag
  }

  // 更新标签
  function updateTag(id: string, updates: Partial<Tag>) {
    const index = tags.value.findIndex(tag => tag.id === id)
    if (index !== -1) {
      tags.value[index] = {
        ...tags.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveTags()
    }
  }

  // 删除标签
  function deleteTag(id: string) {
    tags.value = tags.value.filter(tag => tag.id !== id)
    saveTags()
  }

  // 增加标签使用次数
  function incrementTagUsage(id: string) {
    const tag = tags.value.find(t => t.id === id)
    if (tag) {
      tag.usageCount++
      saveTags()
    }
  }

  // 根据 ID 获取标签
  function getTagById(id: string) {
    return tags.value.find(tag => tag.id === id)
  }

  // 重置为默认分类
  async function resetToDefaultCategories() {
    loading.value = true
    error.value = null

    try {
      // 删除所有非默认分类
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('is_default', false)

      if (deleteError) throw deleteError

      // 重新获取分类
      await fetchCategories()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置分类失败'
      console.error('Error resetting categories:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 分类相关
    categories: computed(() => categories.value),
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    resetToDefaultCategories,
    fetchCategories,
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 标签相关
    tags: computed(() => tags.value),
    addTag,
    updateTag,
    deleteTag,
    incrementTagUsage,
    getTagById
  }
}
