<template>
  <div class="space-y-6">
    <!-- 标题栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">总览仪表盘</h1>
        <p class="text-gray-500 mt-1 text-sm">欢迎回来！这是你的财务概况</p>
      </div>
      <button
        @click="emit('addBill')"
        class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 whitespace-nowrap"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="text-sm" />
        <span class="font-medium text-sm sm:text-base">添加账单</span>
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="今日支出"
        :amount="stats.todayExpense"
        icon="calendar-day"
        icon-bg-class="bg-red-50"
        icon-color-class="text-red-500"
      />
      <StatsCard
        title="本月支出"
        :amount="stats.monthExpense"
        icon="calendar"
        icon-bg-class="bg-orange-50"
        icon-color-class="text-orange-500"
      />
      <StatsCard
        title="本年支出"
        :amount="stats.yearExpense"
        icon="chart-bar"
        icon-bg-class="bg-purple-50"
        icon-color-class="text-purple-500"
      />
      <StatsCard
        title="总收入"
        :amount="stats.totalIncome"
        icon="money-bill-wave"
        :subtitle="`支出: ¥${stats.totalExpense.toFixed(2)}`"
        icon-bg-class="bg-green-50"
        icon-color-class="text-green-500"
      />
    </div>

    <!-- 收入支出对比卡片 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4">收支对比</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 收入 -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div class="flex items-center justify-between mb-4">
            <span class="text-green-700 font-semibold">总收入</span>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'arrow-trend-up']" class="text-green-600 text-lg" />
            </div>
          </div>
          <div class="text-3xl font-bold text-green-600">
            ¥{{ stats.totalIncome.toFixed(2) }}
          </div>
        </div>

        <!-- 支出 -->
        <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
          <div class="flex items-center justify-between mb-4">
            <span class="text-red-700 font-semibold">总支出</span>
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'arrow-trend-down']" class="text-red-600 text-lg" />
            </div>
          </div>
          <div class="text-3xl font-bold text-red-600">
            ¥{{ stats.totalExpense.toFixed(2) }}
          </div>
        </div>

        <!-- 余额 -->
        <div class="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div class="flex items-center justify-between mb-4">
            <span class="text-blue-700 font-semibold">净余额</span>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'wallet']" class="text-blue-600 text-lg" />
            </div>
          </div>
          <div :class="[
            'text-3xl font-bold',
            balance >= 0 ? 'text-green-600' : 'text-red-600'
          ]">
            {{ balance >= 0 ? '+' : '' }}¥{{ balance.toFixed(2) }}
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ balance >= 0 ? '收支平衡良好' : '支出超过收入' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 分类占比饼图 -->
      <CategoryPieChart :category-stats="stats.categoryStats" />

      <!-- 支出趋势折线图 -->
      <TrendChart :trend-data="trendData" />
    </div>

    <!-- 最近账单 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">最近账单</h3>
        <button
          @click="emit('viewAllBills')"
          class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
        >
          <span>查看全部</span>
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
        </button>
      </div>

      <div v-if="stats.recentBills.length > 0" class="space-y-3">
        <div
          v-for="bill in stats.recentBills"
          :key="bill.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
        >
          <div class="flex items-center space-x-4">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center',
              bill.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            ]">
              <font-awesome-icon
                :icon="['fas', bill.type === 'income' ? 'arrow-trend-up' : 'arrow-trend-down']"
                :class="bill.type === 'income' ? 'text-green-600' : 'text-red-600'"
              />
            </div>
            <div>
              <div class="font-semibold text-gray-800">{{ bill.title }}</div>
              <div class="text-sm text-gray-500">
                {{ formatDate(bill.date) }} · {{ getCategoryLabel(bill.category) }}
              </div>
            </div>
          </div>
          <div :class="[
            'text-xl font-bold',
            bill.type === 'income' ? 'text-green-600' : 'text-red-600'
          ]">
            {{ bill.type === 'income' ? '+' : '-' }}¥{{ bill.amount.toFixed(2) }}
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        <font-awesome-icon :icon="['fas', 'receipt']" class="text-4xl mb-2 opacity-50" />
        <p>暂无账单记录</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useBillStore } from '../composables/useBillStore'
import { useCategoryStore } from '../composables/useCategoryStore'
import StatsCard from './StatsCard.vue'
import CategoryPieChart from './CategoryPieChart.vue'
import TrendChart from './TrendChart.vue'

const emit = defineEmits<{
  addBill: []
  viewAllBills: []
}>()

const { stats, trendData } = useBillStore()
const { getCategoryById } = useCategoryStore()

const balance = computed(() => stats.value.totalIncome - stats.value.totalExpense)

function getCategoryLabel(categoryId: string) {
  const category = getCategoryById(categoryId)
  return category?.name || '未知分类'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}
</script>
