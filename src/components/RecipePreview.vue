<template>
  <div class="recipe-preview">
    <div v-if="recipe && recipe.meals.length > 0" class="meals-container">
      <div v-for="meal in recipe.meals" :key="meal.id" class="meal-block">
        <!-- 餐次标题 -->
        <div class="meal-title-bar" :style="{ borderLeftColor: getMealColor(meal.type) }">
          <div class="meal-icon-wrapper" :style="{ background: getMealColor(meal.type) }">
            <n-icon size="16" color="white">
              <font-awesome-icon :icon="['fas', getMealIcon(meal.type)]" />
            </n-icon>
          </div>
          <span class="meal-name">{{ getMealLabel(meal.type) }}</span>
          <div class="dishes-count-badge">{{ meal.dishes.length }}道菜</div>
        </div>

        <!-- 菜品列表 -->
        <div class="dishes-container">
          <div
            v-for="(dish, index) in meal.dishes"
            :key="dish.id"
            class="dish-row"
          >
            <div class="dish-bullet" :style="{ background: getMealColor(meal.type) }"></div>
            <span class="dish-text">{{ dish.name }}</span>
          </div>
        </div>

        <!-- 餐次备注 -->
        <div v-if="meal.notes" class="meal-note">
          <n-icon size="14" color="#f59e0b" class="note-icon">
            <font-awesome-icon :icon="['fas', 'lightbulb']" />
          </n-icon>
          <span class="note-text">{{ meal.notes }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <div class="empty-icon">
        <n-icon size="64" color="#e0e0e0">
          <font-awesome-icon :icon="['fas', 'bowl-food']" />
        </n-icon>
      </div>
      <p class="empty-title">还没有规划食谱</p>
      <p class="empty-desc">点击下方按钮添加今日美食</p>
      <n-button type="primary" size="medium" @click="$emit('edit', date)" round>
        <template #icon>
          <n-icon><font-awesome-icon :icon="['fas', 'plus-circle']" /></n-icon>
        </template>
        添加食谱
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NIcon, NButton } from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, MEAL_TYPE_COLORS, type DailyRecipe, type MealType } from '../types/recipe'

defineProps<{
  recipe?: DailyRecipe
  date: string
}>()

defineEmits<{
  edit: [date: string]
}>()

function getMealLabel(type: MealType) {
  return MEAL_TYPE_LABELS[type]
}

function getMealIcon(type: MealType) {
  return MEAL_TYPE_ICONS[type]
}

function getMealColor(type: MealType) {
  return MEAL_TYPE_COLORS[type]
}
</script>

<style scoped>
.recipe-preview {
  min-height: 140px;
}

.meals-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meal-block {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid;
  transition: all 0.3s ease;
}

html.dark .meal-block {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .meal-block {
  background: #ffffff;
  border-color: #f0f0f0;
}

.meal-block:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.meal-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-left: 4px solid;
  border-bottom: 1px solid;
}

html.dark .meal-title-bar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .meal-title-bar {
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border-bottom-color: #f0f0f0;
}

.meal-icon-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.meal-name {
  font-size: 15px;
  font-weight: 700;
  flex: 1;
}

.dishes-count-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
}

html.dark .dishes-count-badge {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .dishes-count-badge {
  color: #6b7280;
  background: #f3f4f6;
}

.dishes-container {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dish-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

html.dark .dish-row {
  background: rgba(255, 255, 255, 0.05);
}

html:not(.dark) .dish-row {
  background: #fafafa;
}

html.dark .dish-row:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

html:not(.dark) .dish-row:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.dish-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dish-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

html.dark .dish-text {
  color: rgba(255, 255, 255, 0.85);
}

html:not(.dark) .dish-text {
  color: #374151;
}

.meal-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin: 0 16px 16px 16px;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

html.dark .meal-note {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(254, 243, 199, 0.05) 100%);
}

html:not(.dark) .meal-note {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.note-icon {
  margin-top: 2px;
}

.note-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.6;
}

html.dark .note-text {
  color: rgba(245, 158, 11, 0.9);
}

html:not(.dark) .note-text {
  color: #92400e;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  opacity: 0.7;
}

.empty-desc {
  font-size: 13px;
  margin: 0 0 24px 0;
  opacity: 0.5;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .meal-title-bar {
    padding: 10px 12px;
  }

  .meal-icon-wrapper {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }

  .meal-name {
    font-size: 14px;
  }

  .dishes-count-badge {
    font-size: 11px;
    padding: 3px 8px;
  }

  .dishes-container {
    padding: 12px 16px;
    gap: 8px;
  }

  .dish-row {
    padding: 6px 10px;
  }

  .dish-text {
    font-size: 13px;
  }

  .meal-note {
    padding: 10px 12px;
    margin: 0 12px 12px 12px;
  }

  .empty-container {
    padding: 36px 20px;
  }

  .empty-icon :deep(.n-icon) {
    font-size: 48px !important;
  }
}
</style>
