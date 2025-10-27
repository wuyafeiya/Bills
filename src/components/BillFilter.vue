<template>
  <n-card :bordered="false" class="shadow-sm mb-4" size="small">
    <div class="space-y-3">
      <!-- 筛选条件 - 一行显示 -->
      <n-space :size="12" :wrap="false" class="filter-row">
        <n-input
          v-model:value="filters.keyword"
          placeholder="搜索标题、备注..."
          size="small"
          clearable
          @update:value="handleFilterChange"
          style="width: 180px"
        >
          <template #prefix>
            <n-icon size="14">
              <font-awesome-icon :icon="['fas', 'search']" />
            </n-icon>
          </template>
        </n-input>

        <n-select
          v-model:value="filters.type"
          :options="typeOptions"
          placeholder="类型"
          size="small"
          clearable
          @update:value="handleFilterChange"
          style="width: 100px"
        />

        <n-select
          v-model:value="filters.category"
          :options="categoryOptions"
          placeholder="分类"
          size="small"
          clearable
          @update:value="handleFilterChange"
          style="width: 110px"
        />

        <n-select
          v-model:value="filters.paymentMethod"
          :options="paymentMethodOptions"
          placeholder="支付方式"
          size="small"
          clearable
          @update:value="handleFilterChange"
          style="width: 110px"
        />

        <n-date-picker
          v-model:value="filters.dateRange"
          type="daterange"
          size="small"
          clearable
          placeholder="日期范围"
          style="width: 240px"
          @update:value="handleFilterChange"
        />

        <n-button
          v-if="hasFilters"
          text
          size="small"
          @click="handleReset"
          type="error"
        >
          <template #icon>
            <n-icon size="14">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </n-icon>
          </template>
          清空
        </n-button>
      </n-space>

      <!-- 活动的筛选标签 -->
      <div v-if="activeFilters.length > 0" class="flex flex-wrap gap-2">
        <n-tag
          v-for="filter in activeFilters"
          :key="filter.key"
          :type="filter.type"
          size="small"
          closable
          @close="handleRemoveFilter(filter.key)"
        >
          {{ filter.label }}
        </n-tag>
      </div>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  NCard,
  NInput,
  NSelect,
  NDatePicker,
  NButton,
  NIcon,
  NTag,
  NSpace
} from 'naive-ui'
import {
  BillType,
  PaymentMethod,
  PAYMENT_METHOD_LABELS
} from '../types/bill'
import { useCategoryStore } from '../composables/useCategoryStore'

// 筛选条件接口
export interface BillFilters {
  keyword?: string
  type?: BillType
  category?: string  // 改为字符串类型，存储分类ID
  paymentMethod?: PaymentMethod
  dateRange?: [number, number]
}

// Props
const props = defineProps<{
  modelValue: BillFilters
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [filters: BillFilters]
}>()

const { expenseCategories, getCategoryById } = useCategoryStore()

// 筛选条件
const filters = ref<BillFilters>({ ...props.modelValue })

// 类型选项（只有支出）
const typeOptions = [
  { label: '支出', value: BillType.EXPENSE }
]

// 分类选项（从 LocalStorage 读取）
const categoryOptions = computed(() => {
  return expenseCategories.value.map(cat => ({
    label: cat.name,
    value: cat.id
  }))
})

// 支付方式选项
const paymentMethodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
  label,
  value: value as PaymentMethod
}))

// 是否有筛选条件
const hasFilters = computed(() => {
  return !!(
    filters.value.keyword ||
    filters.value.type ||
    filters.value.category ||
    filters.value.paymentMethod ||
    filters.value.dateRange
  )
})

// 活动的筛选标签
const activeFilters = computed(() => {
  const result: Array<{ key: string; label: string; type: 'info' | 'success' | 'warning' | 'error' }> = []

  if (filters.value.keyword) {
    result.push({
      key: 'keyword',
      label: `关键词: ${filters.value.keyword}`,
      type: 'info'
    })
  }

  if (filters.value.type) {
    result.push({
      key: 'type',
      label: `类型: 支出`,
      type: 'error'
    })
  }

  if (filters.value.category) {
    const category = getCategoryById(filters.value.category)
    result.push({
      key: 'category',
      label: `分类: ${category?.name || '未知'}`,
      type: 'warning'
    })
  }

  if (filters.value.paymentMethod) {
    result.push({
      key: 'paymentMethod',
      label: `支付: ${PAYMENT_METHOD_LABELS[filters.value.paymentMethod]}`,
      type: 'info'
    })
  }

  if (filters.value.dateRange) {
    const [start, end] = filters.value.dateRange
    const startDate = new Date(start).toLocaleDateString('zh-CN')
    const endDate = new Date(end).toLocaleDateString('zh-CN')
    result.push({
      key: 'dateRange',
      label: `日期: ${startDate} - ${endDate}`,
      type: 'info'
    })
  }

  return result
})

// 处理筛选变化
function handleFilterChange() {
  emit('update:modelValue', { ...filters.value })
}

// 移除单个筛选条件
function handleRemoveFilter(key: string) {
  switch (key) {
    case 'keyword':
      filters.value.keyword = undefined
      break
    case 'type':
      filters.value.type = undefined
      break
    case 'category':
      filters.value.category = undefined
      break
    case 'paymentMethod':
      filters.value.paymentMethod = undefined
      break
    case 'dateRange':
      filters.value.dateRange = undefined
      break
  }
  handleFilterChange()
}

// 重置所有筛选条件
function handleReset() {
  filters.value = {}
  handleFilterChange()
}
</script>

<style scoped>
.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
