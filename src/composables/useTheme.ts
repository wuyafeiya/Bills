import { ref, computed, watch } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

const THEME_KEY = 'bill-app-theme'

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'auto'

// 从 localStorage 读取主题设置
const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }
  return 'auto'
}

// 检测系统主题
const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

// 主题模式状态
const themeMode = ref<ThemeMode>(getStoredTheme())

// 实际使用的主题（解析 auto 模式）
const actualTheme = computed<'light' | 'dark'>(() => {
  if (themeMode.value === 'auto') {
    return getSystemTheme()
  }
  return themeMode.value
})

// Naive UI 主题对象
const naiveTheme = computed(() => {
  return actualTheme.value === 'dark' ? darkTheme : undefined
})

// 浅色主题覆盖
const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#3b82f6',
    primaryColorHover: '#2563eb',
    primaryColorPressed: '#1d4ed8',
    borderRadius: '8px'
  }
}

// 深色主题覆盖
const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#60a5fa',
    primaryColorHover: '#3b82f6',
    primaryColorPressed: '#2563eb',
    borderRadius: '8px'
  }
}

// 主题覆盖配置
const themeOverrides = computed(() => {
  return actualTheme.value === 'dark' ? darkThemeOverrides : lightThemeOverrides
})

// 监听系统主题变化
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    // 触发响应式更新
    if (themeMode.value === 'auto') {
      themeMode.value = 'auto'
    }
  })
}

// 保存主题设置
watch(themeMode, (newMode) => {
  localStorage.setItem(THEME_KEY, newMode)
})

// 应用主题到 body
watch(actualTheme, (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

export function useTheme() {
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
  }

  const toggleTheme = () => {
    if (themeMode.value === 'light') {
      themeMode.value = 'dark'
    } else if (themeMode.value === 'dark') {
      themeMode.value = 'light'
    } else {
      // auto 模式下，切换到相反的手动模式
      const system = getSystemTheme()
      themeMode.value = system === 'dark' ? 'light' : 'dark'
    }
  }

  return {
    themeMode,
    actualTheme,
    naiveTheme,
    themeOverrides,
    setThemeMode,
    toggleTheme
  }
}
