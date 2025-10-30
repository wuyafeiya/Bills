<template>
  <div class="recipe-planner">
    <n-card :bordered="false" class="main-card">
      <!-- 头部导航 -->
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <div class="header-icon-wrapper">
              <n-icon size="28" color="white">
                <font-awesome-icon :icon="['fas', 'book-open']" />
              </n-icon>
            </div>
            <div class="header-info">
              <h1 class="page-title">食谱计划</h1>
              <p class="page-desc">规划每日饮食，健康生活</p>
            </div>
          </div>
          <n-space size="small" class="week-nav">
            <n-button @click="handleDeleteAll" size="medium" type="error" secondary>
              <template #icon>
                <n-icon><font-awesome-icon :icon="['fas', 'trash']" /></n-icon>
              </template>
              清空所有
            </n-button>
            <n-button @click="goToPreviousWeek" size="medium" circle>
              <template #icon>
                <n-icon><font-awesome-icon :icon="['fas', 'chevron-left']" /></n-icon>
              </template>
            </n-button>
            <n-button @click="goToCurrentWeek" size="medium" strong secondary type="primary">
              本周
            </n-button>
            <n-button @click="goToNextWeek" size="medium" circle>
              <template #icon>
                <n-icon><font-awesome-icon :icon="['fas', 'chevron-right']" /></n-icon>
              </template>
            </n-button>
          </n-space>
        </div>
      </template>

      <!-- 今日和明日快速查看 -->
      <div class="quick-view-section">
        <n-grid :x-gap="20" :cols="isMobile ? 1 : 2">
          <n-grid-item>
            <div class="quick-card today-quick-card">
              <div class="quick-card-header">
                <div class="quick-card-icon today-icon">
                  <n-icon size="22" color="white">
                    <font-awesome-icon :icon="['fas', 'sun']" />
                  </n-icon>
                </div>
                <div class="quick-card-title">
                  <h3>今日食谱</h3>
                  <span class="date-text">{{ formatDate(today) }}</span>
                </div>
                <n-button
                  text
                  size="small"
                  @click="editRecipe(today)"
                  class="quick-edit-btn"
                >
                  <template #icon>
                    <n-icon size="16"><font-awesome-icon :icon="['fas', 'pen']" /></n-icon>
                  </template>
                </n-button>
              </div>
              <div class="quick-card-body">
                <RecipePreview :recipe="todayRecipe" :date="today" @edit="editRecipe" />
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="quick-card tomorrow-quick-card">
              <div class="quick-card-header">
                <div class="quick-card-icon tomorrow-icon">
                  <n-icon size="22" color="white">
                    <font-awesome-icon :icon="['fas', 'moon']" />
                  </n-icon>
                </div>
                <div class="quick-card-title">
                  <h3>明日食谱</h3>
                  <span class="date-text">{{ formatDate(tomorrow) }}</span>
                </div>
                <n-button
                  text
                  size="small"
                  @click="editRecipe(tomorrow)"
                  class="quick-edit-btn"
                >
                  <template #icon>
                    <n-icon size="16"><font-awesome-icon :icon="['fas', 'pen']" /></n-icon>
                  </template>
                </n-button>
              </div>
              <div class="quick-card-body">
                <RecipePreview :recipe="tomorrowRecipe" :date="tomorrow" @edit="editRecipe" />
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>

      <!-- 周视图分隔 -->
      <div class="section-divider">
        <div class="divider-line"></div>
        <span class="divider-text">本周计划</span>
        <div class="divider-line"></div>
      </div>

      <!-- 周视图 -->
      <div class="week-view">
        <n-grid :x-gap="12" :y-gap="16" :cols="isMobile ? 1 : 7">
          <n-grid-item v-for="dayInfo in currentWeekDays" :key="dayInfo.date">
            <div
              :class="[
                'day-card',
                { 'is-today': isToday(dayInfo.date) },
                { 'has-recipe': dayInfo.recipe }
              ]"
              @click="editRecipe(dayInfo.date)"
            >
              <div class="day-header">
                <span class="weekday-text">{{ dayInfo.weekday }}</span>
                <span class="day-number" :class="{ 'is-today-number': isToday(dayInfo.date) }">
                  {{ dayInfo.day }}
                </span>
              </div>

              <div class="day-body">
                <div v-if="dayInfo.recipe && dayInfo.recipe.meals.length > 0" class="recipe-preview-mini">
                  <div
                    v-for="meal in dayInfo.recipe.meals"
                    :key="meal.id"
                    class="meal-badge"
                    :style="{ background: getMealColor(meal.type) }"
                  >
                    <n-icon size="12" color="white">
                      <font-awesome-icon :icon="['fas', getMealIcon(meal.type)]" />
                    </n-icon>
                    <span>{{ meal.dishes.length }}</span>
                  </div>
                </div>
                <div v-else class="day-empty-text">
                  未规划
                </div>
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </n-card>

    <!-- 编辑食谱弹窗 -->
    <RecipeEditModal
      v-model:show="showEditModal"
      :date="selectedDate"
      :recipe="selectedRecipe"
      @save="handleSave"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import {
  NCard,
  NGrid,
  NGridItem,
  NButton,
  NSpace,
  NIcon,
  NEmpty,
  useDialog,
  useMessage
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createRecipeStore } from '../composables/useRecipeStore'
import { useResponsive } from '../composables/useResponsive'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, MEAL_TYPE_COLORS, type MealType, type DailyRecipe, type Meal } from '../types/recipe'
import RecipePreview from '../components/RecipePreview.vue'
import RecipeEditModal from '../components/RecipeEditModal.vue'

const { isMobile } = useResponsive()
const dialog = useDialog()
const message = useMessage()

// 直接创建食谱存储
const recipeStore = createRecipeStore()
const { fetchRecipes, todayRecipe, tomorrowRecipe, getRecipeByDate, saveRecipe, deleteAllRecipes } = recipeStore

// 当前周的起始日期
const currentWeekStart = ref(getWeekStart(new Date()))

// 今日和明日
const today = new Date().toISOString().split('T')[0]
const tomorrow = (() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
})()

// 编辑相关
const showEditModal = ref(false)
const selectedDate = ref('')
const selectedRecipe = ref<DailyRecipe | undefined>()

// 初始化
onMounted(async () => {
  await fetchRecipes()
})

// 获取周的起始日期（周日）
function getWeekStart(date: Date) {
  const result = new Date(date)
  result.setDate(result.getDate() - result.getDay())
  result.setHours(0, 0, 0, 0)
  return result
}

// 当前周的日期列表
const currentWeekDays = computed(() => {
  const days = []
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    days.push({
      date: dateStr,
      day: date.getDate(),
      weekday: weekdays[i],
      recipe: getRecipeByDate(dateStr)
    })
  }

  return days
})

// 判断是否是今天
function isToday(date: string) {
  return date === today
}

// 格式化日期
function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 获取餐次标签
function getMealLabel(type: MealType) {
  return MEAL_TYPE_LABELS[type]
}

// 获取餐次图标
function getMealIcon(type: MealType) {
  return MEAL_TYPE_ICONS[type]
}

// 获取餐次颜色
function getMealColor(type: MealType) {
  return MEAL_TYPE_COLORS[type]
}

// 上一周
function goToPreviousWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() - 7)
  currentWeekStart.value = newStart
}

// 下一周
function goToNextWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + 7)
  currentWeekStart.value = newStart
}

// 回到本周
function goToCurrentWeek() {
  currentWeekStart.value = getWeekStart(new Date())
}

// 编辑食谱
function editRecipe(date: string) {
  selectedDate.value = date
  selectedRecipe.value = getRecipeByDate(date)
  showEditModal.value = true
}

// 保存食谱
async function handleSave(date: string, meals: Meal[]) {
  await saveRecipe(date, meals)
  showEditModal.value = false
}

// 删除所有食谱
function handleDeleteAll() {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除所有食谱吗？此操作不可恢复！',
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteAllRecipes()
        message.success('已删除所有食谱')
      } catch (error) {
        message.error('删除失败，请重试')
      }
    }
  })
}
</script>

<style scoped>
.recipe-planner {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  margin: 0;
  font-weight: 500;
  opacity: 0.7;
}

.week-nav {
  display: flex;
  align-items: center;
}

/* 快速查看区域 */
.quick-view-section {
  margin: 24px 0;
}

.quick-card {
  border: 2px solid;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
}

.quick-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.today-quick-card {
  border-color: #10b981;
}

.tomorrow-quick-card {
  border-color: #3b82f6;
}

/* 暗色模式适配 */
html.dark .today-quick-card {
  background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), transparent);
}

html.dark .tomorrow-quick-card {
  background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), transparent);
}

html:not(.dark) .today-quick-card {
  background: linear-gradient(to bottom right, #ecfdf5, white);
}

html:not(.dark) .tomorrow-quick-card {
  background: linear-gradient(to bottom right, #eff6ff, white);
}

.quick-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 2px solid rgba(128, 128, 128, 0.1);
}

html.dark .quick-card-header {
  background: rgba(255, 255, 255, 0.05);
}

html:not(.dark) .quick-card-header {
  background: rgba(255, 255, 255, 0.8);
}

.quick-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.today-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.tomorrow-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.quick-card-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick-card-title h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.date-text {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
}

.quick-edit-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.quick-edit-btn:hover {
  opacity: 1;
}

.quick-card-body {
  padding: 20px;
}

/* 分隔线 */
.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0 24px 0;
}

.divider-line {
  flex: 1;
  height: 2px;
}

html.dark .divider-line {
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
}

html:not(.dark) .divider-line {
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
}

.divider-text {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 周视图 */
.week-view {
  margin-top: 20px;
}

.day-card {
  cursor: pointer;
  border: 2px solid;
  border-radius: 12px;
  padding: 16px 12px;
  transition: all 0.3s ease;
  height: 160px;
  display: flex;
  flex-direction: column;
}

html.dark .day-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .day-card {
  background: white;
  border-color: #e5e7eb;
}

.day-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

html.dark .day-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

html:not(.dark) .day-card:hover {
  border-color: #9ca3af;
}

.day-card.is-today {
  border-color: #10b981;
  border-width: 3px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

html.dark .day-card.is-today {
  background: linear-gradient(to bottom, rgba(16, 185, 129, 0.15), rgba(255, 255, 255, 0.05));
}

html:not(.dark) .day-card.is-today {
  background: linear-gradient(to bottom, #f0fdf4, white);
}

.day-card.has-recipe {
  border-color: #3b82f6;
}

html.dark .day-card.has-recipe {
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.15), rgba(255, 255, 255, 0.05));
}

html:not(.dark) .day-card.has-recipe {
  background: linear-gradient(to bottom, #f0f9ff, white);
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 2px solid;
}

html.dark .day-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .day-header {
  border-bottom-color: #f3f4f6;
}

.weekday-text {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.6;
}

.day-number {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.day-number.is-today-number {
  color: #10b981;
}

.day-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.recipe-preview-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-content: center;
  width: 100%;
}

.meal-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.day-empty-text {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.5;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-desc {
    font-size: 13px;
  }

  .week-nav {
    width: 100%;
    justify-content: center;
  }

  .quick-view-section {
    margin: 20px 0;
  }

  .quick-card-header {
    padding: 14px 16px;
  }

  .quick-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .quick-card-title h3 {
    font-size: 15px;
  }

  .date-text {
    font-size: 12px;
  }

  .quick-card-body {
    padding: 16px;
  }

  .day-card {
    padding: 12px 10px;
    height: 140px;
  }

  .day-number {
    font-size: 20px;
  }
}
</style>
