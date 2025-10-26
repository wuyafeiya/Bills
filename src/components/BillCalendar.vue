<template>
  <n-card :bordered="false" class="shadow-sm" size="small">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-1.5">
          <n-icon size="16" color="#3b82f6">
            <font-awesome-icon :icon="['fas', 'calendar']" />
          </n-icon>
          <h3 class="text-base font-semibold text-gray-800">日历视图</h3>
        </div>

        <!-- 月份切换 -->
        <div class="flex items-center space-x-1.5">
          <n-button size="tiny" @click="previousMonth">
            <template #icon>
              <n-icon size="14">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
              </n-icon>
            </template>
          </n-button>
          <span class="text-sm font-medium text-gray-700 min-w-[100px] text-center">
            {{ currentMonthLabel }}
          </span>
          <n-button size="tiny" @click="nextMonth">
            <template #icon>
              <n-icon size="14">
                <font-awesome-icon :icon="['fas', 'arrow-right']" />
              </n-icon>
            </template>
          </n-button>
          <n-button size="tiny" @click="goToToday" type="primary" secondary>
            今天
          </n-button>
        </div>
      </div>
    </template>

    <!-- 日历 -->
    <div class="calendar-grid">
      <!-- 星期标题 -->
      <div class="weekday-header">
        <div v-for="day in weekDays" :key="day" class="weekday-cell">
          {{ day }}
        </div>
      </div>

      <!-- 日期单元格 -->
      <div class="calendar-body">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="[
            'calendar-cell',
            {
              'is-other-month': !day.isCurrentMonth,
              'is-today': day.isToday,
              'is-selected': day.isSelected,
              'has-bills': day.billCount > 0
            }
          ]"
          @click="handleSelectDate(day)"
        >
          <div class="cell-content">
            <div class="date-number">{{ day.day }}</div>

            <!-- 账单信息 -->
            <div v-if="day.isCurrentMonth && day.billCount > 0" class="bill-info">
              <div class="bill-stats">
                <div v-if="day.expense > 0" class="expense">
                  <span class="label">支</span>
                  <span class="amount">¥{{ formatAmount(day.expense) }}</span>
                </div>
                <div v-if="day.income > 0" class="income">
                  <span class="label">收</span>
                  <span class="amount">¥{{ formatAmount(day.income) }}</span>
                </div>
              </div>
              <div class="bill-count">{{ day.billCount }}笔</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center space-x-1.5">
        <div class="w-3 h-3 rounded bg-blue-100 border-2 border-blue-500"></div>
        <span class="text-xs text-gray-600">今天</span>
      </div>
      <div class="flex items-center space-x-1.5">
        <div class="w-3 h-3 rounded bg-green-50 border border-green-200"></div>
        <span class="text-xs text-gray-600">有账单</span>
      </div>
      <div class="flex items-center space-x-1.5">
        <span class="text-xs text-red-600 font-medium">支</span>
        <span class="text-xs text-gray-600">支出</span>
      </div>
      <div class="flex items-center space-x-1.5">
        <span class="text-xs text-green-600 font-medium">收</span>
        <span class="text-xs text-gray-600">收入</span>
      </div>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { NCard, NButton, NIcon } from 'naive-ui'
import type { Bill } from '../types/bill'
import { BillType } from '../types/bill'
import { formatDateLocal } from '../utils/date'

interface Props {
  bills: Bill[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'select-date': [date: string]
}>()

// 当前月份
const currentDate = ref(new Date())
const selectedDate = ref<string | null>(null)

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前月份标签
const currentMonthLabel = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 日历日期数据
interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  billCount: number
  expense: number
  income: number
}

// 生成日历数据
const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // 当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 日历开始日期（包含上月末尾）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // 日历结束日期（包含下月开头，确保6行42天）
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 41)

  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateString = formatDateLocal(d)
    const isCurrentMonth = d.getMonth() === month

    // 统计当天的账单
    const dayBills = props.bills.filter(bill => bill.date === dateString)
    const expense = dayBills
      .filter(b => b.type === BillType.EXPENSE)
      .reduce((sum, b) => sum + b.amount, 0)
    const income = dayBills
      .filter(b => b.type === BillType.INCOME)
      .reduce((sum, b) => sum + b.amount, 0)

    days.push({
      date: dateString,
      day: d.getDate(),
      isCurrentMonth,
      isToday: d.getTime() === today.getTime(),
      isSelected: selectedDate.value === dateString,
      billCount: dayBills.length,
      expense,
      income
    })
  }

  return days
})

// 格式化金额
function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + 'w'
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k'
  }
  return amount.toFixed(0)
}

// 选择日期
function handleSelectDate(day: CalendarDay) {
  if (!day.isCurrentMonth) return

  selectedDate.value = day.date
  emit('select-date', day.date)
}

// 上一月
function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

// 下一月
function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// 回到今天
function goToToday() {
  currentDate.value = new Date()
}
</script>

<style scoped>
.calendar-grid {
  width: 100%;
  margin-top: 12px;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
}

.weekday-cell {
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  padding: 8px 0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-cell {
  height: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  display: flex;
  flex-direction: column;
}

.calendar-cell:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.calendar-cell.is-other-month {
  opacity: 0.3;
  pointer-events: none;
}

.calendar-cell.is-today {
  background: #eff6ff;
  border: 2px solid #3b82f6;
}

.calendar-cell.is-selected {
  background: #dbeafe;
  border: 2px solid #2563eb;
}

.calendar-cell.has-bills {
  background: #f0fdf4;
  border-color: #86efac;
}

.calendar-cell.has-bills.is-today {
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
}

.cell-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.date-number {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.bill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: auto;
}

.bill-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
}

.expense,
.income {
  display: flex;
  align-items: center;
  gap: 3px;
}

.expense .label {
  display: inline-block;
  background: #fef2f2;
  color: #ef4444;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 9px;
}

.income .label {
  display: inline-block;
  background: #f0fdf4;
  color: #22c55e;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 9px;
}

.expense .amount {
  color: #dc2626;
  font-weight: 600;
  font-size: 10px;
}

.income .amount {
  color: #16a34a;
  font-weight: 600;
  font-size: 10px;
}

.bill-count {
  font-size: 9px;
  color: #6b7280;
  margin-top: 2px;
  text-align: center;
}
</style>
