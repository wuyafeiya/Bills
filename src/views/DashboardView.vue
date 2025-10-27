<template>
  <div class="space-y-6">
    <!-- 数据概览卡片 - 四个卡片横排 -->
    <n-grid :x-gap="16" :y-gap="16" :cols="isMobile ? 2 : 4" responsive="screen">
      <n-grid-item>
        <n-card :bordered="false" class="stat-card stat-card-orange">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">今日支出</div>
              <div class="stat-value">
                ¥<n-number-animation
                  :from="0"
                  :to="stats.todayExpense"
                  :precision="2"
                  :duration="2000"
                  :active="true"
                />
              </div>
              <div class="stat-trend">
                <span class="stat-trend-label">
                  较昨日
                  <span :class="expenseChange >= 0 ? 'trend-up' : 'trend-down'">
                    {{ expenseChange >= 0 ? '+' : '' }}{{ expenseChange.toFixed(1) }}%
                  </span>
                </span>
              </div>
            </div>
            <div class="stat-icon">
              <n-icon size="32">
                <font-awesome-icon :icon="['fas', 'calendar-day']" />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card :bordered="false" class="stat-card stat-card-cyan">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">昨日支出</div>
              <div class="stat-value">
                ¥<n-number-animation
                  :from="0"
                  :to="stats.yesterdayExpense"
                  :precision="2"
                  :duration="2000"
                  :active="true"
                />
              </div>
              <div class="stat-description">
                对比参考
              </div>
            </div>
            <div class="stat-icon">
              <n-icon size="32">
                <font-awesome-icon :icon="['fas', 'history']" />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card :bordered="false" class="stat-card stat-card-pink">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">本月支出</div>
              <div class="stat-value">
                ¥<n-number-animation
                  :from="0"
                  :to="stats.monthExpense"
                  :precision="2"
                  :duration="2000"
                  :active="true"
                />
              </div>
              <div class="stat-description">
                当月累计
              </div>
            </div>
            <div class="stat-icon">
              <n-icon size="32">
                <font-awesome-icon :icon="['fas', 'calendar']" />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card :bordered="false" class="stat-card stat-card-purple">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">总支出</div>
              <div class="stat-value">
                ¥<n-number-animation
                  :from="0"
                  :to="stats.totalExpense"
                  :precision="2"
                  :duration="2000"
                  :active="true"
                />
              </div>
              <div class="stat-description">
                累计金额
              </div>
            </div>
            <div class="stat-icon">
              <n-icon size="32">
                <font-awesome-icon :icon="['fas', 'wallet']" />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 图表区域 -->
    <n-grid :x-gap="16" :y-gap="16" :cols="isMobile ? 1 : 2" responsive="screen">
      <n-grid-item>
        <n-card title="分类占比" :bordered="true" :class="isMobile ? 'chart-card-mobile' : 'chart-card'">
          <CategoryPieChart :category-stats="stats.categoryStats" />
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="支出趋势" :bordered="true" :class="isMobile ? 'chart-card-mobile' : 'chart-card'">
          <TrendChart :trend-data="trendData" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 最近交易表格 -->
    <n-card title="最近交易" :bordered="false">
      <n-data-table
        :columns="isMobile ? mobileColumns : columns"
        :data="tableData"
        :pagination="false"
        :bordered="false"
        :single-line="false"
        :size="isMobile ? 'small' : 'medium'"
        :scroll-x="isMobile ? 600 : undefined"
      />
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableColumns } from 'naive-ui'
import { NCard, NStatistic, NGrid, NGridItem, NDataTable, NIcon, NTag, NNumberAnimation } from 'naive-ui'
import { useBillStore } from '../composables/useBillStore'
import { useResponsive } from '../composables/useResponsive'
import CategoryPieChart from '../components/CategoryPieChart.vue'
import TrendChart from '../components/TrendChart.vue'
import { CATEGORY_LABELS } from '../types/bill'
import type { Bill } from '../types/bill'

const router = useRouter()
const { stats, trendData } = useBillStore()
const { isMobile } = useResponsive()

// 计算今日支出相比昨日的变化百分比
const expenseChange = computed(() => {
  if (stats.value.yesterdayExpense === 0) {
    return stats.value.todayExpense > 0 ? 100 : 0
  }
  return ((stats.value.todayExpense - stats.value.yesterdayExpense) / stats.value.yesterdayExpense) * 100
})

function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]
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
    month: '2-digit',
    day: '2-digit'
  })
}

// 表格列定义
const columns: DataTableColumns<Bill> = [
  {
    title: '标题',
    key: 'title',
    width: 200,
    render(row) {
      return h('div', { class: 'font-medium' }, row.title)
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: 'default',
          size: 'small'
        },
        { default: () => '支出' }
      )
    }
  },
  {
    title: '分类',
    key: 'category',
    width: 120,
    render(row) {
      return getCategoryLabel(row.category)
    }
  },
  {
    title: '日期',
    key: 'date',
    width: 120,
    render(row) {
      return formatDate(row.date)
    }
  },
  {
    title: '金额',
    key: 'amount',
    width: 150,
    align: 'right',
    render(row) {
      return h(
        'span',
        {
          class: 'font-semibold'
        },
        `-¥${row.amount.toFixed(2)}`
      )
    }
  }
]

// 移动端表格列定义（简化版）
const mobileColumns: DataTableColumns<Bill> = [
  {
    title: '标题',
    key: 'title',
    render(row) {
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'font-medium text-sm' }, row.title),
        h('div', { class: 'text-xs text-gray-500' }, [
          h('span', { class: 'mr-2' }, getCategoryLabel(row.category)),
          h('span', {}, formatDate(row.date))
        ])
      ])
    }
  },
  {
    title: '金额',
    key: 'amount',
    align: 'right',
    width: 100,
    render(row) {
      return h(
        'span',
        {
          class: 'font-semibold text-sm'
        },
        `-¥${row.amount.toFixed(2)}`
      )
    }
  }
]

// 表格数据
const tableData = computed(() => stats.value.recentBills)
</script>

<style scoped>
/* 统计卡片样式 */
.stat-card {
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 120px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.15);
}

.stat-card-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-cyan {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-value {
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.stat-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 4px;
}

.stat-trend {
  margin-top: 6px;
}

.stat-trend-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  color: #dc2626;
  font-weight: 700;
}

.trend-down {
  color: #16a34a;
  font-weight: 700;
}

.stat-icon {
  color: rgba(255, 255, 255, 0.3);
}

/* 图表卡片样式 */
.chart-card {
  height: 450px;
}

.chart-card :deep(.n-card__content) {
  height: calc(100% - 56px);
  padding: 20px;
}

/* 移动端图表卡片样式 */
.chart-card-mobile {
  height: 350px;
}

.chart-card-mobile :deep(.n-card__content) {
  height: calc(100% - 56px);
  padding: 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stat-card {
    min-height: 100px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-icon {
    opacity: 0.5;
  }

  .stat-icon :deep(.n-icon) {
    font-size: 24px !important;
  }
}

/* 平板适配 */
@media (min-width: 768px) and (max-width: 1280px) {
  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 13px;
  }

  .stat-description,
  .stat-trend-label {
    font-size: 11px;
  }
}
</style>
