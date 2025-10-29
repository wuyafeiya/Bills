<template>
  <div class="category-bill-list">
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
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: categoryInfo.color }"
              >
                <n-icon size="16" color="white">
                  <font-awesome-icon :icon="['fas', categoryInfo.icon]" />
                </n-icon>
              </div>
              <span class="text-lg font-semibold">{{ year }}年{{ month }}月 - {{ categoryInfo.name }}</span>
            </div>
          </div>
          <n-statistic label="分类总支出" tabular-nums>
            <n-number-animation
              :from="0"
              :to="categoryTotal"
              :precision="2"
              :duration="500"
            />
            <template #prefix>¥</template>
          </n-statistic>
        </div>
      </template>

      <!-- 账单列表表格 -->
      <n-data-table
        v-if="categoryBills.length > 0"
        :columns="columns"
        :data="categoryBills"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        striped
        size="small"
      />

      <!-- 无数据提示 -->
      <n-empty
        v-else
        description="该分类暂无账单数据"
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
  NTag,
  NSpace,
  type DataTableColumns
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useBillStore } from '../composables/useBillStore'
import { useCategoryStore } from '../composables/useCategoryStore'
import { BillType, PaymentMethod, PAYMENT_METHOD_LABELS } from '../types/bill'

const router = useRouter()
const route = useRoute()
const { bills } = useBillStore()
const { getCategoryById } = useCategoryStore()

// 从路由获取参数
const year = computed(() => parseInt(route.query.year as string))
const month = computed(() => parseInt(route.query.month as string))
const categoryId = computed(() => route.query.category as string)

// 获取分类信息
const categoryInfo = computed(() => {
  const category = getCategoryById(categoryId.value)
  return {
    name: category?.name || '未知分类',
    color: category?.color || '#868e96',
    icon: category?.icon || 'ellipsis-h'
  }
})

// 过滤当前分类的账单
const categoryBills = computed(() => {
  return bills.value.filter(bill => {
    if (bill.type !== BillType.EXPENSE) return false
    if (bill.category !== categoryId.value) return false

    const date = new Date(bill.date)
    return date.getFullYear() === year.value && date.getMonth() + 1 === month.value
  })
})

// 计算分类总计
const categoryTotal = computed(() => {
  return categoryBills.value.reduce((sum, bill) => sum + bill.amount, 0)
})

// 获取支付方式标签
function getPaymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_LABELS[method] || '未知'
}

// 获取支付方式图标
function getPaymentIcon(method: PaymentMethod) {
  const icons: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'money-bill',
    [PaymentMethod.WECHAT]: 'comments',
    [PaymentMethod.ALIPAY]: 'mobile-screen',
    [PaymentMethod.CARD]: 'credit-card',
    [PaymentMethod.OTHER]: 'wallet'
  }
  return icons[method] || 'wallet'
}

// 格式化日期为简短格式
function formatDateShort(dateString: string) {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

// 表格列定义
const columns = computed<DataTableColumns<any>>(() => [
  {
    title: '日期',
    key: 'date',
    width: 80,
    render: (row) => formatDateShort(row.date)
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    render: (row) => h('span', {
      class: 'font-semibold text-red-600'
    }, `¥${row.amount.toFixed(2)}`)
  },
  {
    title: '支付方式',
    key: 'paymentMethod',
    width: 100,
    render: (row) => {
      if (!row.paymentMethod) return '-'
      return h('div', { class: 'flex items-center gap-1' }, [
        h(NIcon, { size: 14 }, {
          default: () => h(FontAwesomeIcon, { icon: ['fas', getPaymentIcon(row.paymentMethod)] })
        }),
        h('span', { class: 'text-sm' }, getPaymentMethodLabel(row.paymentMethod))
      ])
    }
  },
  {
    title: '备注',
    key: 'description',
    ellipsis: {
      tooltip: true
    },
    render: (row) => row.description || '-'
  },
  {
    title: '标签',
    key: 'tags',
    width: 120,
    render: (row) => {
      if (!row.tags || row.tags.length === 0) return '-'
      return h(NSpace, { size: 4 }, {
        default: () => row.tags.map((tag: string) =>
          h(NTag, { size: 'small', type: 'info' }, { default: () => tag })
        )
      })
    }
  }
])

// 分页配置
const pagination = {
  pageSize: 15
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<style scoped>
.category-bill-list {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
