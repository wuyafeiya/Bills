import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点定义（与 Tailwind CSS 一致）
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export type Breakpoint = keyof typeof breakpoints

// 屏幕宽度
const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// 更新屏幕宽度
const updateWidth = () => {
  screenWidth.value = window.innerWidth
}

// 设置监听器
if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateWidth)
}

export function useResponsive() {
  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  // 当前断点
  const currentBreakpoint = computed<Breakpoint>(() => {
    const width = screenWidth.value
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'sm'
  })

  // 是否为移动设备
  const isMobile = computed(() => screenWidth.value < breakpoints.md)

  // 是否为平板设备
  const isTablet = computed(() =>
    screenWidth.value >= breakpoints.md && screenWidth.value < breakpoints.lg
  )

  // 是否为桌面设备
  const isDesktop = computed(() => screenWidth.value >= breakpoints.lg)

  // 大于等于某个断点
  const isGreaterOrEqual = (bp: Breakpoint) => {
    return computed(() => screenWidth.value >= breakpoints[bp])
  }

  // 小于某个断点
  const isLessThan = (bp: Breakpoint) => {
    return computed(() => screenWidth.value < breakpoints[bp])
  }

  return {
    screenWidth,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isGreaterOrEqual,
    isLessThan
  }
}
