<template>
  <div class="bill-overview">
    <n-card title="账单总览" :bordered="false">
      <!-- 顶部统计区域 -->
      <div class="flex items-center justify-between mb-6">
        <n-space>
          <span class="text-gray-600">年份：</span>
          <n-select
            v-model:value="selectedYear"
            :options="yearOptions"
            style="width: 120px"
            size="small"
          />
        </n-space>

        <n-statistic label="年度总支出" tabular-nums>
          <n-number-animation
            :from="0"
            :to="yearTotal"
            :precision="2"
            :duration="500"
          />
          <template #prefix>¥</template>
        </n-statistic>
      </div>

      <!-- 月份数据表格 -->
      <n-data-table
        v-if="filteredMonths.length > 0"
        :columns="columns"
        :data="filteredMonths"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        striped
        size="small"
      />

      <!-- 无数据提示 -->
      <n-empty
        v-else
        description="暂无账单数据"
        class="my-8"
      />
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NDataTable,
  NEmpty,
  NSpace,
  NSelect,
  NStatistic,
  NNumberAnimation,
  NButton,
  type DataTableColumns,
  type SelectOption
} from 'naive-ui'
import { useBillStore } from '../composables/useBillStore'
import { BillType } from '../types/bill'

const router = useRouter()
const { bills } = useBillStore()

// 计算所有的月份数据
const allMonths = computed(() => {
  const monthMap = new Map<string, { year: number; month: number; total: number; count: number }>()

  bills.value
    .filter(bill => bill.type === BillType.EXPENSE)
    .forEach(bill => {
      const date = new Date(bill.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month}`

      const existing = monthMap.get(key) || { year, month, total: 0, count: 0 }
      monthMap.set(key, {
        year,
        month,
        total: existing.total + bill.amount,
        count: existing.count + 1
      })
    })

  // 按年月降序排序
  return Array.from(monthMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
    .map(item => ({
      ...item,
      key: `${item.year}-${item.month}`
    }))
})

// 可用的年份列表
const availableYears = computed(() => {
  const years = new Set<number>()
  allMonths.value.forEach(month => years.add(month.year))
  return Array.from(years).sort((a, b) => b - a)
})

// 年份选项
const yearOptions = computed<SelectOption[]>(() => {
  return availableYears.value.map(year => ({
    label: `${year}年`,
    value: year
  }))
})

// 选中的年份（默认为最新年份）
const selectedYear = ref<number>(availableYears.value[0] || new Date().getFullYear())

// 根据选中年份过滤月份
const filteredMonths = computed(() => {
  return allMonths.value.filter(month => month.year === selectedYear.value)
})

// 计算选中年份的总支出
const yearTotal = computed(() => {
  return filteredMonths.value.reduce((sum, month) => sum + month.total, 0)
})

// 表格列定义
const columns = computed<DataTableColumns<any>>(() => [
  {
    title: '月份',
    key: 'month',
    width: 100,
    render: (row) => `${row.month}月`
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
    render: (row) => h('span', {
      class: 'font-semibold text-red-600'
    }, `¥${row.total.toFixed(2)}`)
  },
  {
    title: '平均每笔',
    key: 'average',
    width: 120,
    render: (row) => `¥${(row.total / row.count).toFixed(2)}`
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
        onClick: () => goToMonthDetail(row.year, row.month)
      },
      { default: () => '查看详情' }
    )
  }
])

// 分页配置
const pagination = {
  pageSize: 12
}

// 跳转到月份详情
function goToMonthDetail(year: number, month: number) {
  router.push({
    path: '/bill-overview/month',
    query: { year: year.toString(), month: month.toString() }
  })
}
</script>

<style scoped>
.bill-overview {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
