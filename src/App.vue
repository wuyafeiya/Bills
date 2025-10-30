<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-message-provider>
      <n-dialog-provider>
        <n-layout :has-sider="!isMobile" position="absolute" class="h-screen">
          <!-- 移动端菜单抽屉 -->
          <MobileNav v-if="isMobile" v-model="mobileMenuOpen" />

          <!-- 左侧边栏（桌面端） -->
          <n-layout-sider
            v-if="!isMobile"
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            :width="240"
            :collapsed="collapsed"
            show-trigger
            @collapse="collapsed = true"
            @expand="collapsed = false"
          >
            <Sidebar :collapsed="collapsed" />
          </n-layout-sider>

          <!-- 右侧主内容区 -->
          <n-layout>
            <!-- 面包屑导航 -->
            <n-layout-header
              bordered
              :style="isMobile ? 'height: 56px; padding: 12px 16px' : 'height: 64px; padding: 16px 24px'"
            >
              <div class="flex items-center justify-between h-full">
                <div class="flex items-center gap-3">
                  <!-- 移动端汉堡菜单按钮 -->
                  <n-button
                    v-if="isMobile"
                    text
                    @click="mobileMenuOpen = true"
                  >
                    <template #icon>
                      <n-icon :size="20">
                        <font-awesome-icon :icon="['fas', 'bars']" />
                      </n-icon>
                    </template>
                  </n-button>

                  <!-- 移动端只显示当前页面标题 -->
                  <div v-if="isMobile" class="text-base font-semibold">
                    {{ breadcrumbs[breadcrumbs.length - 1]?.title || '账单管理' }}
                  </div>

                  <!-- 桌面端显示完整面包屑 -->
                  <n-breadcrumb v-else>
                    <n-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                      <router-link v-if="item.path" :to="item.path" class="hover:text-blue-500">
                        {{ item.title }}
                      </router-link>
                      <span v-else>{{ item.title }}</span>
                    </n-breadcrumb-item>
                  </n-breadcrumb>
                </div>

                <!-- 主题切换按钮 -->
                <n-button
                  circle
                  @click="toggleTheme"
                  :size="isMobile ? 'small' : 'medium'"
                >
                  <template #icon>
                    <n-icon :size="isMobile ? 16 : 18">
                      <font-awesome-icon :icon="['fas', themeIcon]" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </n-layout-header>

            <!-- 内容区域 -->
            <n-layout-content
              :content-style="isMobile ? 'padding: 16px;' : 'padding: 24px;'"
              :native-scrollbar="false"
            >
              <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </n-layout-content>
          </n-layout>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  NDialogProvider,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NIcon
} from 'naive-ui'
import { provideBillStore } from './composables/useBillStore'
import { useTheme } from './composables/useTheme'
import { useResponsive } from './composables/useResponsive'
import Sidebar from './components/Sidebar.vue'
import MobileNav from './components/MobileNav.vue'

// 提供全局账单存储
provideBillStore()

// 主题系统
const { naiveTheme, themeOverrides, actualTheme, toggleTheme } = useTheme()

// 响应式布局
const { isMobile } = useResponsive()

// 主题图标
const themeIcon = computed(() => {
  return actualTheme.value === 'dark' ? 'sun' : 'moon'
})

// 侧边栏折叠状态
const collapsed = ref(false)

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 路由配置
const route = useRoute()

// 面包屑配置
const breadcrumbMap: Record<string, string> = {
  '/': '首页',
  '/bills': '账单列表',
  '/add': '添加账单',
  '/bill-overview': '账单总览',
  '/bill-overview/month': '月度分类统计',
  '/bill-overview/category': '分类账单详情',
  '/recipe-planner': '食谱计划',
  '/stats': '统计分析',
  '/settings': '设置'
}

// 计算面包屑
const breadcrumbs = computed(() => {
  const path = route.path
  const title = breadcrumbMap[path] || '未知页面'

  const items = [
    { title: '首页', path: path === '/' ? '' : '/' }
  ]

  if (path !== '/') {
    items.push({ title, path: '' })
  }

  return items
})
</script>

<style>
/* 响应式基础样式 */
* {
  box-sizing: border-box;
}

/* 滚动条样式 - 浅色主题 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 滚动条样式 - 深色主题 */
.dark ::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark ::-webkit-scrollbar-thumb {
  background: #555;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #777;
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 更小的滚动条 */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  /* 移动端字体大小调整 */
  body {
    font-size: 14px;
  }
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

