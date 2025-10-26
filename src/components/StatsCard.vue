<template>
  <div :class="[
    'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md',
    bgClass
  ]">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="text-sm font-medium text-gray-500 mb-1">{{ title }}</div>
        <div class="text-3xl font-bold text-gray-900">
          ¥{{ amount.toFixed(2) }}
        </div>
        <div v-if="subtitle" class="text-xs text-gray-400 mt-2">
          {{ subtitle }}
        </div>
      </div>
      <div :class="[
        'w-12 h-12 rounded-xl flex items-center justify-center',
        iconBgClass
      ]">
        <font-awesome-icon :icon="['fas', icon]" :class="['text-xl', iconColorClass]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  amount: number
  icon: string
  subtitle?: string
  bgClass?: string
  iconBgClass?: string
  iconColorClass?: string
}>()
</script>
