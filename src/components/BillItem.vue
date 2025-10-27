<template>
  <div class="bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-100">
    <div class="flex items-center justify-between">
      <!-- 左侧信息 -->
      <div class="flex items-center space-x-4 flex-1">
        <!-- 分类图标 -->
        <div :class="[categoryColor, 'w-12 h-12 rounded-xl flex items-center justify-center']">
          <font-awesome-icon :icon="['fas', categoryIcon]" class="text-white text-lg" />
        </div>

        <!-- 账单信息 -->
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-1">
            <h3 class="text-lg font-semibold text-gray-800">{{ bill.title }}</h3>
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
              {{ categoryLabel }}
            </span>
          </div>

          <div class="text-sm text-gray-500 flex items-center space-x-2">
            <font-awesome-icon :icon="['fas', 'calendar-day']" class="text-xs" />
            <span>{{ formatDate(bill.date) }}</span>
          </div>

          <p v-if="bill.description" class="text-sm text-gray-600 mt-1">
            {{ bill.description }}
          </p>
        </div>
      </div>

      <!-- 右侧金额和操作 -->
      <div class="flex items-center space-x-4">
        <div class="text-right">
          <div class="text-2xl font-bold text-red-600">
            -¥{{ bill.amount.toFixed(2) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            支出
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-2">
          <button
            @click="emit('edit', bill)"
            class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="编辑"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
          </button>
          <button
            @click="emit('delete', bill.id)"
            class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="删除"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Bill } from '../types/bill'
import { useCategoryStore } from '../composables/useCategoryStore'

const props = defineProps<{
  bill: Bill
}>()

const emit = defineEmits<{
  edit: [bill: Bill]
  delete: [id: string]
}>()

const { getCategoryById } = useCategoryStore()

// 获取分类信息
const categoryInfo = computed(() => {
  return getCategoryById(props.bill.category)
})

const categoryLabel = computed(() => categoryInfo.value?.name || '未知分类')
const categoryColor = computed(() => {
  const color = categoryInfo.value?.color || '#868e96'
  // 将十六进制颜色转换为 Tailwind 样式
  return `bg-[${color}]`
})
const categoryIcon = computed(() => categoryInfo.value?.icon || 'ellipsis-h')

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
