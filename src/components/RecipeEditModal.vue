<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :style="{ width: isMobile ? '95%' : '700px', maxHeight: '85vh' }"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <template #header>
      <div class="modal-header">
        <div class="header-icon">
          <n-icon size="24" color="white">
            <font-awesome-icon :icon="['fas', 'utensils']" />
          </n-icon>
        </div>
        <div class="header-text">
          <div class="header-title">编辑食谱</div>
          <div class="header-subtitle">{{ formatDate(date) }}</div>
        </div>
      </div>
    </template>

    <div class="editor-container">
      <!-- 餐次列表 -->
      <div v-for="(meal, mealIndex) in editingMeals" :key="meal.id" class="meal-section">
        <div class="section-header">
          <div class="section-title">
            <div class="meal-type-icon" :style="{ background: getMealColor(meal.type) }">
              <n-icon size="16" color="white">
                <font-awesome-icon :icon="['fas', getMealIcon(meal.type)]" />
              </n-icon>
            </div>
            <n-select
              v-model:value="meal.type"
              :options="mealTypeOptions"
              style="width: 140px"
              size="medium"
            >
              <template #prefix>
                <span class="select-label">餐次</span>
              </template>
            </n-select>
          </div>
          <n-button
            text
            type="error"
            size="small"
            @click="removeMeal(mealIndex)"
            class="delete-meal-btn"
          >
            <template #icon>
              <n-icon><font-awesome-icon :icon="['fas', 'trash-alt']" /></n-icon>
            </template>
          </n-button>
        </div>

        <!-- 菜品列表 -->
        <div class="dishes-list">
          <div
            v-for="(dish, dishIndex) in meal.dishes"
            :key="dish.id"
            class="dish-input-row"
          >
            <div class="dish-number">{{ dishIndex + 1 }}</div>
            <n-input
              v-model:value="dish.name"
              placeholder="输入菜品名称，如：西红柿炒鸡蛋"
              size="medium"
              class="dish-input"
            >
              <template #prefix>
                <n-icon size="16" color="#9ca3af">
                  <font-awesome-icon :icon="['fas', 'drumstick-bite']" />
                </n-icon>
              </template>
            </n-input>
            <n-button
              text
              type="error"
              size="small"
              @click="removeDish(mealIndex, dishIndex)"
              class="delete-dish-btn"
            >
              <n-icon size="18">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </n-icon>
            </n-button>
          </div>

          <!-- 添加菜品按钮 -->
          <n-button
            dashed
            block
            size="medium"
            @click="addDish(mealIndex)"
            class="add-dish-btn"
          >
            <template #icon>
              <n-icon><font-awesome-icon :icon="['fas', 'plus']" /></n-icon>
            </template>
            添加菜品
          </n-button>
        </div>

        <!-- 备注 -->
        <div class="notes-section">
          <div class="notes-label">
            <n-icon size="14" color="#9ca3af">
              <font-awesome-icon :icon="['fas', 'sticky-note']" />
            </n-icon>
            <span>备注（可选）</span>
          </div>
          <n-input
            v-model:value="meal.notes"
            type="textarea"
            placeholder="记录一些特别的做法或提醒..."
            size="medium"
            :autosize="{ minRows: 2, maxRows: 3 }"
            class="notes-input"
          />
        </div>
      </div>

      <!-- 添加餐次按钮 -->
      <n-button
        dashed
        block
        size="large"
        @click="addMeal"
        class="add-meal-btn"
        type="primary"
      >
        <template #icon>
          <n-icon size="20">
            <font-awesome-icon :icon="['fas', 'plus-circle']" />
          </n-icon>
        </template>
        添加餐次
      </n-button>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button size="large" @click="showModal = false" class="footer-btn">
          取消
        </n-button>
        <n-button type="primary" size="large" @click="handleSave" class="footer-btn save-btn">
          <template #icon>
            <n-icon><font-awesome-icon :icon="['fas', 'check']" /></n-icon>
          </template>
          保存食谱
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import {
  NModal,
  NButton,
  NInput,
  NSelect,
  NIcon,
  useMessage,
  type SelectOption
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useResponsive } from '../composables/useResponsive'
import {
  MealType,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  MEAL_TYPE_COLORS,
  type DailyRecipe,
  type Meal,
  type Dish
} from '../types/recipe'

const props = defineProps<{
  show: boolean
  date: string
  recipe?: DailyRecipe
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'save': [date: string, meals: Meal[]]
}>()

const message = useMessage()
const { isMobile } = useResponsive()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// 编辑中的餐次
const editingMeals = ref<Meal[]>([])

// 餐次类型选项
const mealTypeOptions: SelectOption[] = Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => ({
  label,
  value
}))

// 监听 recipe 变化，初始化编辑数据
watch(
  () => props.recipe,
  (recipe) => {
    if (recipe) {
      editingMeals.value = JSON.parse(JSON.stringify(recipe.meals))
    } else {
      editingMeals.value = []
    }
  },
  { immediate: true }
)

// 格式化日期
function formatDate(date: string) {
  const d = new Date(date)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
}

// 获取餐次图标
function getMealIcon(type: MealType) {
  return MEAL_TYPE_ICONS[type]
}

// 获取餐次颜色
function getMealColor(type: MealType) {
  return MEAL_TYPE_COLORS[type]
}

// 添加餐次
function addMeal() {
  const newMeal: Meal = {
    id: `meal_${Date.now()}`,
    type: MealType.LUNCH,
    dishes: [],
    notes: ''
  }
  editingMeals.value.push(newMeal)
}

// 删除餐次
function removeMeal(index: number) {
  editingMeals.value.splice(index, 1)
}

// 添加菜品
function addDish(mealIndex: number) {
  const newDish: Dish = {
    id: `dish_${Date.now()}`,
    name: '',
    ingredients: [],
    notes: ''
  }
  editingMeals.value[mealIndex].dishes.push(newDish)
}

// 删除菜品
function removeDish(mealIndex: number, dishIndex: number) {
  editingMeals.value[mealIndex].dishes.splice(dishIndex, 1)
}

// 保存
function handleSave() {
  // 验证
  if (editingMeals.value.length === 0) {
    message.warning('请至少添加一个餐次')
    return
  }

  for (const meal of editingMeals.value) {
    if (meal.dishes.length === 0) {
      message.warning(`${MEAL_TYPE_LABELS[meal.type]}至少需要一道菜`)
      return
    }

    for (const dish of meal.dishes) {
      if (!dish.name.trim()) {
        message.warning('请填写所有菜品名称')
        return
      }
    }
  }

  emit('save', props.date, editingMeals.value)
  message.success('保存成功')
}
</script>

<style scoped>
/* 模态框头部 */
.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
}

.header-subtitle {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
}

/* 编辑器容器 */
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: calc(85vh - 200px);
  overflow-y: auto;
  padding: 8px 4px;
}

/* 自定义滚动条 */
.editor-container::-webkit-scrollbar {
  width: 8px;
}

.editor-container::-webkit-scrollbar-track {
  border-radius: 4px;
}

html.dark .editor-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

html:not(.dark) .editor-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.editor-container::-webkit-scrollbar-thumb {
  border-radius: 4px;
}

html.dark .editor-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

html:not(.dark) .editor-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
}

html.dark .editor-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

html:not(.dark) .editor-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 餐次区块 */
.meal-section {
  border: 2px solid;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

html.dark .meal-section {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .meal-section {
  background: #ffffff;
  border-color: #e5e7eb;
}

html.dark .meal-section:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

html:not(.dark) .meal-section:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid;
}

html.dark .section-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .section-header {
  border-bottom-color: #f3f4f6;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meal-type-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.select-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.7;
}

.delete-meal-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-meal-btn:hover {
  opacity: 1;
}

/* 菜品列表 */
.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.dish-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dish-number {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

html.dark .dish-number {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: rgba(255, 255, 255, 0.7);
}

html:not(.dark) .dish-number {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #4b5563;
}

.dish-input {
  flex: 1;
}

.dish-input :deep(.n-input__border),
.dish-input :deep(.n-input__state-border) {
  border-width: 2px;
}

.dish-input:hover :deep(.n-input__state-border) {
  border-color: #9ca3af;
}

.delete-dish-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.dish-input-row:hover .delete-dish-btn {
  opacity: 0.7;
}

.delete-dish-btn:hover {
  opacity: 1 !important;
}

.add-dish-btn {
  margin-top: 4px;
  border-width: 2px;
  border-style: dashed;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-dish-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

/* 备注区域 */
.notes-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notes-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.7;
}

.notes-input :deep(.n-input__border),
.notes-input :deep(.n-input__state-border) {
  border-width: 2px;
}

/* 添加餐次按钮 */
.add-meal-btn {
  border-width: 2px;
  border-style: dashed;
  font-weight: 700;
  height: 48px;
  transition: all 0.3s ease;
}

.add-meal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 160, 240, 0.25);
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.footer-btn {
  min-width: 100px;
  height: 42px;
  font-weight: 600;
}

.save-btn {
  min-width: 120px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .modal-header {
    gap: 12px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .header-icon :deep(.n-icon) {
    font-size: 20px !important;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 13px;
  }

  .editor-container {
    gap: 20px;
  }

  .meal-section {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 12px;
  }

  .meal-type-icon {
    width: 28px;
    height: 28px;
  }

  .dish-number {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 13px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .footer-btn {
    width: 100%;
  }
}
</style>
