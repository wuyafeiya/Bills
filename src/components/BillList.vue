<template>
  <div>
    <!-- 筛选器 -->
    <BillFilter v-model="filters" />

    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-3">
      <n-space :size="8">
        <n-button
          size="small"
          :type="viewMode === 'list' ? 'primary' : 'default'"
          @click="viewMode = 'list'"
        >
          <template #icon>
            <n-icon size="14">
              <font-awesome-icon :icon="['fas', 'list']" />
            </n-icon>
          </template>
          列表
        </n-button>
        <n-button
          size="small"
          :type="viewMode === 'calendar' ? 'primary' : 'default'"
          @click="viewMode = 'calendar'"
        >
          <template #icon>
            <n-icon size="14">
              <font-awesome-icon :icon="['fas', 'calendar']" />
            </n-icon>
          </template>
          日历
        </n-button>
      </n-space>

      <n-tag :bordered="false" type="info" size="small">
        共 {{ filteredBills.length }} 条
      </n-tag>
    </div>

    <!-- 表格视图 -->
    <n-card v-if="viewMode === 'list'" :bordered="false" class="shadow-sm" size="small">
      <n-data-table
        v-if="filteredBills.length > 0"
        :columns="columns"
        :data="filteredBills"
        :bordered="false"
        :single-line="false"
        size="small"
        :row-key="(row: Bill) => row.id"
        :pagination="pagination"
      />

      <!-- 空状态 -->
      <n-empty
        v-else
        description="暂无符合条件的账单"
        size="medium"
        style="padding: 40px 0"
      >
        <template #icon>
          <n-icon size="48" :depth="3">
            <font-awesome-icon :icon="['fas', 'receipt']" />
          </n-icon>
        </template>
      </n-empty>
    </n-card>

    <!-- 日历视图 -->
    <BillCalendar
      v-else
      :bills="filteredBills"
      @select-date="handleSelectDate"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, h } from 'vue'
import { NCard, NTag, NEmpty, NIcon, NButton, NSpace, NDataTable, useDialog, type DataTableColumns } from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useBillStore } from '../composables/useBillStore'
import BillFilter from './BillFilter.vue'
import BillCalendar from './BillCalendar.vue'
import type { Bill } from '../types/bill'
import type { BillFilters } from './BillFilter.vue'
import { BillType, CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from '../types/bill'

const { bills, deleteBill } = useBillStore()
const dialog = useDialog()

// 定义事件
const emit = defineEmits<{
  edit: [bill: Bill]
}>()

// 视图模式
const viewMode = ref<'list' | 'calendar'>('list')

// 筛选条件
const filters = ref<BillFilters>({})

// 筛选后的账单列表
const filteredBills = computed(() => {
  return bills.value.filter((bill) => {
    // 关键词搜索
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      const matchTitle = bill.title.toLowerCase().includes(keyword)
      const matchDescription = bill.description?.toLowerCase().includes(keyword)
      const matchTags = bill.tags?.some(tag => tag.toLowerCase().includes(keyword))

      if (!matchTitle && !matchDescription && !matchTags) {
        return false
      }
    }

    // 类型筛选
    if (filters.value.type && bill.type !== filters.value.type) {
      return false
    }

    // 分类筛选
    if (filters.value.category && bill.category !== filters.value.category) {
      return false
    }

    // 支付方式筛选
    if (filters.value.paymentMethod && bill.paymentMethod !== filters.value.paymentMethod) {
      return false
    }

    // 日期范围筛选
    if (filters.value.dateRange) {
      const [start, end] = filters.value.dateRange
      const billDate = new Date(bill.date).getTime()
      if (billDate < start || billDate > end) {
        return false
      }
    }

    return true
  })
})

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.value.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }
})

// 表格列定义
const columns: DataTableColumns<Bill> = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    align: 'center',
    render(_row, index) {
      return h('span', { class: 'text-sm text-gray-600' }, index + 1)
    }
  },
  {
    title: '标题',
    key: 'title',
    width: 180,
    align: 'center',
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('span', { class: 'font-medium text-sm' }, row.title)
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    align: 'center',
    render(row) {
      return h(
        NTag,
        {
          type: 'error',
          size: 'small',
          bordered: false
        },
        { default: () => '支出' }
      )
    }
  },
  {
    title: '分类',
    key: 'category',
    width: 100,
    align: 'center',
    render(row) {
      return h('span', { class: 'text-sm' }, CATEGORY_LABELS[row.category])
    }
  },
  {
    title: '支付方式',
    key: 'paymentMethod',
    width: 100,
    align: 'center',
    render(row) {
      if (!row.paymentMethod) return h('span', { class: 'text-sm text-gray-400' }, '-')
      return h('span', { class: 'text-sm' }, PAYMENT_METHOD_LABELS[row.paymentMethod])
    }
  },
  {
    title: '日期',
    key: 'date',
    width: 110,
    align: 'center',
    render(row) {
      const date = new Date(row.date)
      return h('span', { class: 'text-sm' },
        `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
      )
    }
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    align: 'center',
    render(row) {
      return h(
        'span',
        {
          class: 'font-semibold text-sm text-red-600'
        },
        `-¥${row.amount.toFixed(2)}`
      )
    }
  },
  {
    title: '备注',
    key: 'description',
    align: 'center',
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('span', { class: 'text-sm text-gray-500' }, row.description || '-')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 6, justify: 'center' }, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              circle: true,
              type: 'primary',
              onClick: () => handleEdit(row)
            },
            {
              icon: () => h(NIcon, { size: 14 }, {
                default: () => h(FontAwesomeIcon, { icon: ['fas', 'edit'] })
              })
            }
          ),
          h(
            NButton,
            {
              size: 'small',
              circle: true,
              type: 'error',
              onClick: () => handleDelete(row.id)
            },
            {
              icon: () => h(NIcon, { size: 14 }, {
                default: () => h(FontAwesomeIcon, { icon: ['fas', 'trash'] })
              })
            }
          )
        ]
      })
    }
  }
]

function handleEdit(bill: Bill) {
  emit('edit', bill)
}

function handleDelete(id: string) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条账单吗？此操作不可恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      deleteBill(id)
    }
  })
}

function handleSelectDate(date: string) {
  // 选择日期后，设置日期范围为该天
  const selectedDate = new Date(date)
  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0))
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999))

  filters.value.dateRange = [startOfDay.getTime(), endOfDay.getTime()]
  viewMode.value = 'list'
}
</script>
