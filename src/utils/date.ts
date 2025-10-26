/**
 * 格式化日期为本地时间 YYYY-MM-DD
 * 避免使用 toISOString() 导致的时区问题
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 */
export function getTodayDateString(): string {
  return formatDateLocal(new Date())
}
