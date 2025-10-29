<template>
  <!-- 移动端菜单抽屉 -->
  <Transition name="slide">
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-50 bg-black bg-opacity-50"
      @click="close"
    >
      <div
        class="w-64 h-full bg-white shadow-2xl dark:bg-gray-800"
        @click.stop
      >
        <div class="flex flex-col h-full">
          <!-- Logo区域 -->
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <router-link to="/" class="flex items-center space-x-3" @click="close">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <font-awesome-icon :icon="['fas', 'wallet']" class="text-white text-xl" />
              </div>
              <div>
                <h1 class="text-lg font-bold text-gray-800 dark:text-white">账单管理</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Bill Manager</p>
              </div>
            </router-link>
          </div>

          <!-- 菜单列表 -->
          <nav class="p-4 space-y-1 flex-1 overflow-y-auto">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              v-slot="{ isActive }"
              custom
            >
              <a
                :href="item.path"
                @click.prevent="handleMenuClick(item.path)"
                :class="[
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                ]"
              >
                <font-awesome-icon :icon="['fas', item.icon]" class="text-lg w-5" />
                <span class="font-medium">{{ item.label }}</span>
              </a>
            </router-link>
          </nav>

          <!-- 底部信息 -->
          <div class="p-6 border-t border-gray-200 dark:border-gray-700">
            <div class="text-xs text-gray-400">
              <p>版本 v1.0.0</p>
              <p class="mt-1">© 2025 账单管理系统</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

interface MenuItem {
  path: string
  label: string
  icon: string
}

const router = useRouter()

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const menuItems: MenuItem[] = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/bills', label: '账单列表', icon: 'list' },
  { path: '/add', label: '添加账单', icon: 'plus' },
  { path: '/bill-overview', label: '账单总览', icon: 'chart-line' },
  { path: '/settings', label: '设置', icon: 'gear' }
]

const isMenuOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleMenuClick(path: string) {
  router.push(path)
  close()
}

function close() {
  emit('update:modelValue', false)
}
</script>

<script lang="ts">
import { computed } from 'vue'
export default {
  name: 'MobileNav'
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from > div,
.slide-leave-to > div {
  transform: translateX(-100%);
}
</style>
