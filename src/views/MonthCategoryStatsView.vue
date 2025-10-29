<template>
  <div class="month-category-stats">
    <n-card :bordered="false">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <n-button text @click="goBack">
              <template #icon>
                <n-icon>
                  <font-awesome-icon :icon="['fas', 'arrow-left']" />
                </n-icon>
              </template>
            </n-button>
            <span class="text-lg font-semibold">{{ year }}年{{ month }}月分类统计</span>
          </div>
          <n-statistic label="本月总支出" tabular-nums>
            <n-number-animation
              :from="0"
              :to="monthTotal"
              :precision="2"
              :duration="500"
            />
            <template #prefix>¥</template>
          </n-statistic>
        </div>
      </template>

      <!-- 分类统计表格 -->
      <n-data-table
        v-if="categoryStats.length > 0"
        :columns="columns"
        :data="categoryStats"
        :pagination="false"
        :bordered="false"
        :single-line="false"
        striped
        size="small"
      />

      <!-- 无数据提示 -->
      <n-empty
        v-else
        description="该月暂无账单数据"
        class="my-8"
      />
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NCard,
  NDataTable,
  NEmpty,
  NIcon,
  NButton,
  NStatistic,
  NNumberAnimation,
  NProgress,
  type DataTableColumns
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useBillStore } from '../composables/useBillStore'
import { useCategoryStore } from '../composables/useCategoryStore'
import { BillType } from '../types/bill'

const router = useRouter()
const route = useRoute()
const { bills } = useBillStore()
const { getCategoryById } = useCategoryStore()

// 从路由获取年月参数
const year = computed(() => parseInt(route.query.year as string))
const month = computed(() => parseInt(route.query.month as string))

// 过滤当月账单
const monthBills = computed(() => {
  return bills.value.filter(bill => {
    if (bill.type !== BillType.EXPENSE) return false
    const date = new Date(bill.date)
    return date.getFullYear() === year.value && date.getMonth() + 1 === month.value
  })
})

// 计算月度总计
const monthTotal = computed(() => {
  return monthBills.value.reduce((sum, bill) => sum + bill.amount, 0)
})

// 按分类统计
const categoryStats = computed(() => {
  const categoryMap = new Map<string, { total: number; count: number }>()

  monthBills.value.forEach(bill => {
    const existing = categoryMap.get(bill.category) || { total: 0, count: 0 }
    categoryMap.set(bill.category, {
      total: existing.total + bill.amount,
      count: existing.count + 1
    })
  })

  const total = monthTotal.value

  return Array.from(categoryMap.entries())
    .map(([categoryId, data]) => {
      const category = getCategoryById(categoryId)
      return {
        categoryId,
        categoryName: category?.name || '未知分类',
        categoryColor: category?.color || '#868e96',
        categoryIcon: category?.icon || 'ellipsis-h',
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0
      }
    })
    .sort((a, b) => b.total - a.total)
})

// 表格列定义
const columns = computed<DataTableColumns<any>>(() => [
  {
    title: '分类',
    key: 'categoryName',
    width: 150,
    render: (row) => h('div', { class: 'flex items-center gap-2' }, [
      h('div', {
        class: 'w-8 h-8 rounded-lg flex items-center justify-center',
        style: { backgroundColor: row.categoryColor }
      }, [
        h(NIcon, { size: 14, color: 'white' }, {
          default: () => h(FontAwesomeIcon, { icon: ['fas', row.categoryIcon] })
        })
      ]),
      h('span', { class: 'font-medium' }, row.categoryName)
    ])
  },
  {
    title: '账单数量',
    key: 'count',
    width: 120,
    render: (row) => `${row.count} 笔`
  },
  {
    title: '总支出',
    key: 'total',
    width: 150,
    render: (row) => h('span', {
      class: 'font-semibold text-red-600 text-base'
    }, `¥${row.total.toFixed(2)}`)
  },
  {
    title: '占比',
    key: 'percentage',
    render: (row) => h('div', { class: 'flex items-center gap-3' }, [
      h(NProgress, {
        type: 'line',
        percentage: row.percentage,
        height: 8,
        borderRadius: 4,
        fillBorderRadius: 4,
        showIndicator: false,
        style: { width: '120px' }
      }),
      h('span', { class: 'text-gray-600 text-sm w-12' }, `${row.percentage.toFixed(1)}%`)
    ])
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => h(
      NButton,
      {
        text: true,
        type: 'primary',
        size: 'small',
        onClick: () => goToCategoryDetail(row.categoryId)
      },
      { default: () => '查看详情' }
    )
  }
])

// 返回上一页
function goBack() {
  router.back()
}

// 跳转到分类详情
function goToCategoryDetail(categoryId: string) {
  router.push({
    path: '/bill-overview/category',
    query: {
      year: year.value.toString(),
      month: month.value.toString(),
      category: categoryId
    }
  })
}
</script>

<style scoped>
.month-category-stats {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
