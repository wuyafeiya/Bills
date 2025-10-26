<template>
  <div class="chart-container">
    <div v-if="categoryStats.length > 0" class="h-full">
      <!-- ECharts 饼图 -->
      <v-chart
        class="h-full"
        :option="chartOption"
        autoresize
      />
    </div>

    <n-empty
      v-else
      description="暂无分类数据"
      size="large"
      style="padding: 60px 0"
    >
      <template #icon>
        <n-icon size="60" :depth="3">
          <font-awesome-icon :icon="['fas', 'chart-bar']" />
        </n-icon>
      </template>
    </n-empty>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NEmpty, NIcon } from 'naive-ui'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { CATEGORY_LABELS, type BillCategory } from '../types/bill'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

const props = defineProps<{
  categoryStats: {
    category: BillCategory
    total: number
    count: number
    percentage: number
  }[]
}>()

// 颜色映射
const colorMap: Record<string, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  shopping: '#ec4899',
  entertainment: '#a855f7',
  utilities: '#22c55e',
  health: '#ef4444',
  education: '#eab308',
  salary: '#10b981',
  bonus: '#14b8a6',
  other: '#6b7280'
}

function getCategoryLabel(category: BillCategory) {
  return CATEGORY_LABELS[category]
}

function getCategoryColor(category: BillCategory) {
  return colorMap[category] || '#6b7280'
}

// ECharts 配置
const chartOption = computed<EChartsOption>(() => {
  const data = props.categoryStats.map(item => ({
    value: item.total,
    name: getCategoryLabel(item.category),
    itemStyle: {
      color: getCategoryColor(item.category)
    }
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>金额: ¥${params.value.toFixed(2)}<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 12,
      textStyle: {
        fontSize: 13
      },
      formatter: (name: string) => {
        const item = props.categoryStats.find(s => getCategoryLabel(s.category) === name)
        if (item) {
          return `${name}: ¥${item.total.toFixed(2)}`
        }
        return name
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: (params: any) => {
            return `${params.percent.toFixed(1)}%`
          },
          fontSize: 12,
          fontWeight: 'bold'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: data
      }
    ]
  }
})
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
}
</style>
