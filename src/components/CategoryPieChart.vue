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
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
import { useCategoryStore } from '../composables/useCategoryStore'

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
    category: string  // 改为字符串类型
    total: number
    count: number
    percentage: number
  }[]
}>()

const { getCategoryById } = useCategoryStore()

// 响应式窗口宽度
const isMobile = ref(window.innerWidth < 768)

function updateMobileState() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', updateMobileState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileState)
})

function getCategoryLabel(categoryId: string) {
  const category = getCategoryById(categoryId)
  return category?.name || '未知分类'
}

function getCategoryColor(categoryId: string) {
  const category = getCategoryById(categoryId)
  return category?.color || '#6b7280'
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
      orient: isMobile.value ? 'horizontal' : 'vertical',
      right: isMobile.value ? 'center' : '5%',
      top: isMobile.value ? 'bottom' : 'center',
      bottom: isMobile.value ? '0%' : 'auto',
      itemGap: isMobile.value ? 8 : 12,
      textStyle: {
        fontSize: isMobile.value ? 11 : 13
      },
      formatter: (name: string) => {
        const item = props.categoryStats.find(s => getCategoryLabel(s.category) === name)
        if (item) {
          return isMobile.value ? name : `${name}: ¥${item.total.toFixed(2)}`
        }
        return name
      }
    },
    series: [
      {
        type: 'pie',
        radius: isMobile.value ? ['35%', '55%'] : ['40%', '65%'],
        center: isMobile.value ? ['50%', '40%'] : ['35%', '50%'],
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
          fontSize: isMobile.value ? 11 : 12,
          fontWeight: 'bold'
        },
        labelLine: {
          show: true,
          length: isMobile.value ? 10 : 15,
          length2: isMobile.value ? 5 : 10,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile.value ? 12 : 14,
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
