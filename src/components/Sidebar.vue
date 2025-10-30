<template>
  <div class="h-full flex flex-col">
    <!-- Logo区域 -->
    <div class="logo-container p-6 border-b border-gray-200 flex-shrink-0">
      <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <font-awesome-icon :icon="['fas', 'wallet']" class="text-white text-lg" />
        </div>
        <div :class="['logo-text', { 'collapsed': collapsed }]">
          <h1 class="text-base font-bold text-gray-800 whitespace-nowrap">账单管理</h1>
          <p class="text-xs text-gray-500 whitespace-nowrap">Bill Manager</p>
        </div>
      </router-link>
    </div>

    <!-- 菜单列表 -->
    <div class="flex-1 overflow-y-auto py-4">
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="selectedKey"
        @update:value="handleMenuSelect"
      />
    </div>

    <!-- 底部信息 -->
    <div :class="['footer-info p-6 border-t border-gray-200 flex-shrink-0', { 'collapsed': collapsed }]">
      <div class="text-xs text-gray-400">
        <p class="whitespace-nowrap">版本 v1.0.0</p>
        <p class="mt-1 whitespace-nowrap">© 2025 账单管理系统</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NMenu, NIcon, type MenuOption } from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{
  collapsed?: boolean
}>()

const router = useRouter()
const route = useRoute()

// 渲染图标
function renderIcon(icon: string) {
  return () => h(NIcon, { size: 17 }, {
    default: () => h(FontAwesomeIcon, { icon: ['fas', icon] })
  })
}

// 菜单选项
const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: '/',
    icon: renderIcon('home')
  },
  {
    label: '账单列表',
    key: '/bills',
    icon: renderIcon('list')
  },
  {
    label: '添加账单',
    key: '/add',
    icon: renderIcon('plus')
  },
  {
    label: '账单总览',
    key: '/bill-overview',
    icon: renderIcon('chart-line')
  },
  {
    label: '食谱计划',
    key: '/recipe-planner',
    icon: renderIcon('utensils')
  },
  {
    label: '设置',
    key: '/settings',
    icon: renderIcon('gear')
  }
]

// 当前选中的菜单
const selectedKey = computed(() => route.path)

// 处理菜单选择
function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<style scoped>
/* Logo 文字淡入淡出动画 */
.logo-text {
  opacity: 1;
  max-width: 150px;
  overflow: hidden;
  transition: opacity 0.3s ease, max-width 0.3s ease;
}

.logo-text.collapsed {
  opacity: 0;
  max-width: 0;
  pointer-events: none;
}

/* 底部信息淡入淡出动画 */
.footer-info {
  opacity: 1;
  max-height: 100px;
  overflow: hidden;
  transition: opacity 0.3s ease, max-height 0.3s ease;
}

.footer-info.collapsed {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  pointer-events: none;
}

/* 优化图标显示 - 让图标看起来更精致轻盈 */
:deep(.n-menu-item-content__icon) {
  opacity: 0.7;
  transition: all 0.3s ease;
  color: #6b7280;
}

:deep(.n-menu-item--selected .n-menu-item-content__icon) {
  opacity: 1;
  color: #3b82f6;
}

:deep(.n-menu-item:hover .n-menu-item-content__icon) {
  opacity: 0.95;
  color: #1f2937;
}

/* 菜单文字样式 */
:deep(.n-menu-item-content__text) {
  font-weight: 500;
  color: #4b5563;
}

:deep(.n-menu-item--selected .n-menu-item-content__text) {
  color: #3b82f6;
  font-weight: 600;
}

:deep(.n-menu-item:hover .n-menu-item-content__text) {
  color: #1f2937;
}

/* Logo图标 - 保持原始样式 */
.logo-container :deep(.n-icon) {
  opacity: 1;
}
</style>
