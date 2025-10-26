<template>
  <div class="chart-container">
    <!-- 周期选择按钮 -->
    <div class="flex justify-end mb-3">
      <n-button-group size="small">
        <n-button
          v-for="period in periods"
          :key="period.value"
          :type="selectedPeriod === period.value ? 'primary' : 'default'"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </n-button>
      </n-button-group>
    </div>

    <div v-if="displayData.length > 0" class="chart-wrapper">
      <!-- ECharts 折线图 -->
      <v-chart
        class="chart"
        :option="chartOption"
        autoresize
      />
    </div>

    <n-empty
      v-else
      description="暂无趋势数据"
      size="large"
      style="padding: 60px 0"
    >
      <template #icon>
        <n-icon size="60" :depth="3">
          <font-awesome-icon :icon="['fas', 'chart-line']" />
        </n-icon>
      </template>
    </n-empty>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { NEmpty, NIcon, NButton, NButtonGroup } from 'naive-ui'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import type { TrendData } from '../types/bill'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const props = defineProps<{
  trendData: TrendData[]
}>()

const periods = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 }
]

const selectedPeriod = ref(30)

// 根据选择的周期过滤数据
const displayData = computed(() => {
  return props.trendData.slice(-selectedPeriod.value)
})

// ECharts 配置
const chartOption = computed<EChartsOption>(() => {
  const dates = displayData.value.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const expenseData = displayData.value.map(item => item.expense)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ¥${item.value.toFixed(2)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['支出'],
      bottom: 0,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: selectedPeriod.value === 30 ? 45 : 0,
        interval: selectedPeriod.value === 30 ? Math.floor(displayData.value.length / 10) : 0,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000) {
            return `¥${(value / 1000).toFixed(1)}k`
          }
          return `¥${value}`
        },
        fontSize: 11
      }
    },
    series: [
      {
        name: '支出',
        type: 'line',
        data: expenseData,
        smooth: true,
        itemStyle: {
          color: '#ef4444'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
            ]
          }
        }
      }
    ]
  }
})
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
}

.chart {
  height: 100%;
  width: 100%;
}
</style>
