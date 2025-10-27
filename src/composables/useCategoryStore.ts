import { ref, computed } from 'vue'
import type { CustomCategory, Tag } from '../types/category'

const CATEGORIES_STORAGE_KEY = 'bill_custom_categories'
const TAGS_STORAGE_KEY = 'bill_tags'

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

// 初始化分类数据
function initCategories() {
  const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY)
  if (stored) {
    try {
      categories.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse categories from localStorage', e)
      categories.value = [...DEFAULT_CATEGORIES]
      saveCategories()
    }
  } else {
    categories.value = [...DEFAULT_CATEGORIES]
    saveCategories()
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

// 保存分类到 localStorage
function saveCategories() {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories.value))
}

// 保存标签到 localStorage
function saveTags() {
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags.value))
}

export function useCategoryStore() {
  // 初始化数据
  if (categories.value.length === 0) {
    initCategories()
  }
  if (tags.value.length === 0) {
    initTags()
  }

  // 计算属性：支出分类
  const expenseCategories = computed(() =>
    categories.value.filter(cat => cat.type === 'expense')
  )

  // 添加分类
  function addCategory(category: Omit<CustomCategory, 'id' | 'createdAt' | 'updatedAt'>) {
    const newCategory: CustomCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    categories.value.push(newCategory)
    saveCategories()
    return newCategory
  }

  // 更新分类
  function updateCategory(id: string, updates: Partial<CustomCategory>) {
    const index = categories.value.findIndex(cat => cat.id === id)
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveCategories()
    }
  }

  // 删除分类（只能删除非默认分类）
  function deleteCategory(id: string) {
    const category = categories.value.find(cat => cat.id === id)
    if (category && !category.isDefault) {
      categories.value = categories.value.filter(cat => cat.id !== id)
      saveCategories()
      return true
    }
    return false
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
  function resetToDefaultCategories() {
    categories.value = [...DEFAULT_CATEGORIES]
    saveCategories()
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

    // 标签相关
    tags: computed(() => tags.value),
    addTag,
    updateTag,
    deleteTag,
    incrementTagUsage,
    getTagById
  }
}
