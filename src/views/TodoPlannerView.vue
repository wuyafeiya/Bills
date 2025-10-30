<template>
  <div class="todo-planner">
    <!-- 页面标题 -->
    <div class="page-title-section">
      <div class="title-wrapper">
        <div class="title-icon">
          <n-icon size="32" color="white">
            <font-awesome-icon :icon="['fas', 'list-check']" />
          </n-icon>
        </div>
        <div>
          <h1 class="page-title">每日计划</h1>
          <p class="page-subtitle">{{ formatDate(selectedDate) }}</p>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 日期选择卡片 -->
        <n-card :bordered="false" class="date-card">
          <div class="date-selector">
            <n-button @click="goToPreviousDay" size="large" circle>
              <template #icon>
                <n-icon><font-awesome-icon :icon="['fas', 'chevron-left']" /></n-icon>
              </template>
            </n-button>
            <n-date-picker
              v-model:value="dateTimestamp"
              type="date"
              size="large"
              class="date-picker"
            />
            <n-button @click="goToNextDay" size="large" circle>
              <template #icon>
                <n-icon><font-awesome-icon :icon="['fas', 'chevron-right']" /></n-icon>
              </template>
            </n-button>
          </div>
          <n-button @click="goToToday" size="large" strong type="primary" block class="today-btn">
            <template #icon>
              <n-icon><font-awesome-icon :icon="['fas', 'calendar-day']" /></n-icon>
            </template>
            回到今天
          </n-button>
        </n-card>

        <!-- 统计卡片 -->
        <n-card :bordered="false" class="stats-card">
          <div class="stats-header">
            <n-icon size="20" color="#3b82f6">
              <font-awesome-icon :icon="['fas', 'chart-bar']" />
            </n-icon>
            <span class="stats-title">今日统计</span>
          </div>
          <div class="stats-content">
            <div class="progress-wrapper">
              <n-progress
                type="circle"
                :percentage="completionRate"
                :stroke-width="10"
                :width="120"
              >
                <template #default>
                  <div class="progress-inner">
                    <div class="progress-number">{{ completionRate }}%</div>
                    <div class="progress-label">完成率</div>
                  </div>
                </template>
              </n-progress>
            </div>
            <div class="stats-details">
              <div class="stat-item">
                <div class="stat-icon completed-icon">
                  <n-icon size="18" color="white">
                    <font-awesome-icon :icon="['fas', 'check-circle']" />
                  </n-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-label">已完成</div>
                  <div class="stat-value completed">{{ completedCount }}</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon pending-icon">
                  <n-icon size="18" color="white">
                    <font-awesome-icon :icon="['fas', 'hourglass-half']" />
                  </n-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-label">待完成</div>
                  <div class="stat-value pending">{{ pendingTodos.length }}</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon total-icon">
                  <n-icon size="18" color="white">
                    <font-awesome-icon :icon="['fas', 'list']" />
                  </n-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-label">总计</div>
                  <div class="stat-value">{{ totalCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <!-- 快速添加卡片 -->
        <n-card :bordered="false" class="add-card">
          <div class="add-header">
            <n-icon size="20" color="#10b981">
              <font-awesome-icon :icon="['fas', 'plus-circle']" />
            </n-icon>
            <span class="add-title">快速添加</span>
          </div>
          <n-input
            v-model:value="newTodoTitle"
            placeholder="输入待办事项，按回车添加..."
            size="large"
            @keyup.enter="handleQuickAdd"
            class="quick-input"
          >
            <template #prefix>
              <n-icon size="18" color="#9ca3af">
                <font-awesome-icon :icon="['fas', 'edit']" />
              </n-icon>
            </template>
          </n-input>
          <n-button
            type="primary"
            size="large"
            @click="showAddModal = true"
            block
            class="detail-add-btn"
          >
            <template #icon>
              <n-icon><font-awesome-icon :icon="['fas', 'plus']" /></n-icon>
            </template>
            详细添加
          </n-button>
        </n-card>
      </div>

      <!-- 右侧面板 - 待办列表 -->
      <div class="right-panel">
        <n-card :bordered="false" class="todos-card">
          <!-- 未完成的任务 -->
          <div v-if="pendingTodos.length > 0" class="todos-group">
            <div class="group-header">
              <n-icon size="18" color="#3b82f6">
                <font-awesome-icon :icon="['fas', 'hourglass-half']" />
              </n-icon>
              <span class="group-title">待完成</span>
              <span class="group-count">{{ pendingTodos.length }}</span>
            </div>
            <div class="todos-list">
              <TodoItem
                v-for="todo in pendingTodos"
                :key="todo.id"
                :todo="todo"
                @toggle="handleToggle"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>
          </div>

          <!-- 已完成的任务 -->
          <div v-if="completedTodos.length > 0" class="todos-group">
            <div class="group-header">
              <n-icon size="18" color="#10b981">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </n-icon>
              <span class="group-title">已完成</span>
              <span class="group-count">{{ completedTodos.length }}</span>
            </div>
            <div class="todos-list">
              <TodoItem
                v-for="todo in completedTodos"
                :key="todo.id"
                :todo="todo"
                @toggle="handleToggle"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="currentTodos.length === 0" class="empty-state">
            <div class="empty-icon">
              <n-icon size="64" color="#d1d5db">
                <font-awesome-icon :icon="['fas', 'clipboard-list']" />
              </n-icon>
            </div>
            <p class="empty-title">还没有待办事项</p>
            <p class="empty-desc">添加今日计划，让每一天都充实起来</p>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 添加/编辑待办模态框 -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      :style="{ width: isMobile ? '95%' : '600px' }"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <template #header>
        <div class="modal-header">
          <div class="modal-header-icon">
            <n-icon size="24" color="white">
              <font-awesome-icon :icon="['fas', editingTodo ? 'pen' : 'plus']" />
            </n-icon>
          </div>
          <span>{{ editingTodo ? '编辑待办' : '添加待办' }}</span>
        </div>
      </template>

      <n-form ref="formRef" :model="formData" label-placement="top">
        <n-form-item label="标题" required>
          <n-input
            v-model:value="formData.title"
            placeholder="输入待办事项标题"
            size="large"
          />
        </n-form-item>

        <n-form-item label="描述">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            placeholder="添加详细描述（可选）"
            :autosize="{ minRows: 3, maxRows: 5 }"
            size="large"
          />
        </n-form-item>

        <n-grid :x-gap="12" :cols="2">
          <n-grid-item>
            <n-form-item label="优先级">
              <n-select
                v-model:value="formData.priority"
                :options="priorityOptions"
                size="large"
              />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="截止时间">
              <n-time-picker
                v-model:value="formData.dueTime"
                format="HH:mm"
                size="large"
                clearable
              />
            </n-form-item>
          </n-grid-item>
        </n-grid>
      </n-form>

      <template #footer>
        <div class="modal-footer">
          <n-button size="large" @click="showAddModal = false">
            取消
          </n-button>
          <n-button type="primary" size="large" @click="handleSave">
            <template #icon>
              <n-icon><font-awesome-icon :icon="['fas', 'check']" /></n-icon>
            </template>
            保存
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  NCard,
  NButton,
  NIcon,
  NInput,
  NDatePicker,
  NProgress,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NTimePicker,
  NGrid,
  NGridItem,
  useMessage,
  useDialog,
  type SelectOption
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createTodoStore } from '../composables/useTodoStore'
import { useResponsive } from '../composables/useResponsive'
import {
  TodoPriority,
  TODO_PRIORITY_LABELS,
  type Todo
} from '../types/todo'
import TodoItem from '../components/TodoItem.vue'

const { isMobile } = useResponsive()
const message = useMessage()
const dialog = useDialog()

// 创建 Todo 存储
const todoStore = createTodoStore()
const { fetchTodos, getTodosByDate, addTodo, updateTodo, toggleTodo, deleteTodo } = todoStore

// 选中的日期
const selectedDate = ref(new Date().toISOString().split('T')[0])
const dateTimestamp = ref(Date.now())

// 监听日期时间戳变化
watch(dateTimestamp, (newTimestamp) => {
  const date = new Date(newTimestamp)
  selectedDate.value = date.toISOString().split('T')[0]
})

// 当前日期的待办事项
const currentTodos = computed(() => getTodosByDate(selectedDate.value))

// 未完成的待办
const pendingTodos = computed(() => {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return currentTodos.value
    .filter(t => !t.completed)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
})

// 已完成的待办
const completedTodos = computed(() => {
  return currentTodos.value.filter(t => t.completed)
})

// 统计
const completedCount = computed(() => completedTodos.value.length)
const totalCount = computed(() => currentTodos.value.length)
const completionRate = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 快速添加
const newTodoTitle = ref('')

async function handleQuickAdd() {
  if (!newTodoTitle.value.trim()) return

  try {
    await addTodo({
      title: newTodoTitle.value.trim(),
      completed: false,
      priority: TodoPriority.MEDIUM,
      date: selectedDate.value
    })
    newTodoTitle.value = ''
    message.success('添加成功')
  } catch (error) {
    message.error('添加失败')
  }
}

// 详细添加/编辑
const showAddModal = ref(false)
const editingTodo = ref<Todo | null>(null)
const formData = ref({
  title: '',
  description: '',
  priority: TodoPriority.MEDIUM,
  dueTime: null as number | null
})

const priorityOptions: SelectOption[] = Object.entries(TODO_PRIORITY_LABELS).map(([value, label]) => ({
  label,
  value
}))

function handleEdit(todo: Todo) {
  editingTodo.value = todo
  formData.value = {
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
    dueTime: todo.dueTime ? parseTime(todo.dueTime) : null
  }
  showAddModal.value = true
}

async function handleSave() {
  if (!formData.value.title.trim()) {
    message.warning('请输入标题')
    return
  }

  try {
    const todoData = {
      title: formData.value.title.trim(),
      description: formData.value.description?.trim() || undefined,
      priority: formData.value.priority,
      dueTime: formData.value.dueTime ? formatDueTime(formData.value.dueTime) : undefined,
      date: selectedDate.value,
      completed: editingTodo.value?.completed || false
    }

    if (editingTodo.value) {
      await updateTodo(editingTodo.value.id, todoData)
      message.success('更新成功')
    } else {
      await addTodo(todoData)
      message.success('添加成功')
    }

    showAddModal.value = false
    resetForm()
  } catch (error) {
    message.error(editingTodo.value ? '更新失败' : '添加失败')
  }
}

function resetForm() {
  editingTodo.value = null
  formData.value = {
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    dueTime: null
  }
}

// 关闭模态框时重置
watch(showAddModal, (show) => {
  if (!show) {
    resetForm()
  }
})

// 切换完成状态
async function handleToggle(id: string) {
  try {
    await toggleTodo(id)
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
function handleDelete(id: string) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条待办事项吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteTodo(id)
        message.success('删除成功')
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 日期导航
function goToPreviousDay() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
  dateTimestamp.value = date.getTime()
}

function goToNextDay() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
  dateTimestamp.value = date.getTime()
}

function goToToday() {
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]
  dateTimestamp.value = today.getTime()
}

// 格式化日期
function formatDate(date: string) {
  const d = new Date(date)
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (date === today) {
    return '今天'
  } else if (date === tomorrowStr) {
    return '明天'
  } else {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
  }
}

// 时间格式转换
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}

function formatDueTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 初始化
onMounted(async () => {
  await fetchTodos()
})
</script>

<style scoped>
.todo-planner {
  padding: 0;
}

/* 页面标题区域 */
.page-title-section {
  margin-bottom: 24px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 14px;
  margin: 4px 0 0 0;
  font-weight: 500;
  opacity: 0.7;
}

/* 主内容区 - 左右布局 */
.content-wrapper {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: start;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
}

/* 日期选择卡片 */
.date-card {
  border-radius: 16px;
  overflow: hidden;
}

html.dark .date-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

html:not(.dark) .date-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.date-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.date-picker {
  flex: 1;
}

.today-btn {
  margin-top: 8px;
}

/* 统计卡片 */
.stats-card {
  border-radius: 16px;
  overflow: hidden;
}

html.dark .stats-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

html:not(.dark) .stats-card {
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 1px solid #dbeafe;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.stats-title {
  font-size: 16px;
  font-weight: 700;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-wrapper {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.progress-inner {
  text-align: center;
}

.progress-number {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
  margin-top: 4px;
}

.stats-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s;
}

html.dark .stat-item {
  background: rgba(255, 255, 255, 0.05);
}

html:not(.dark) .stat-item {
  background: rgba(255, 255, 255, 0.6);
}

.stat-item:hover {
  transform: translateX(4px);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.completed-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.total-icon {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
  display: block;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  display: block;
  margin-top: 2px;
}

.stat-value.completed {
  color: #10b981;
}

.stat-value.pending {
  color: #f59e0b;
}

/* 快速添加卡片 */
.add-card {
  border-radius: 16px;
  overflow: hidden;
}

html.dark .add-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

html:not(.dark) .add-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border: 1px solid #d1fae5;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.1);
}

.add-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.add-title {
  font-size: 16px;
  font-weight: 700;
}

.quick-input {
  margin-bottom: 12px;
}

.detail-add-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* 右侧面板 - 待办列表 */
.right-panel {
  min-height: 400px;
}

.todos-card {
  border-radius: 16px;
  overflow: hidden;
  min-height: 600px;
}

html.dark .todos-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

html:not(.dark) .todos-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.todos-group {
  margin-bottom: 28px;
}

.todos-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

html.dark .group-header {
  background: rgba(255, 255, 255, 0.05);
}

html:not(.dark) .group-header {
  background: #f9fafb;
}

.group-title {
  font-size: 16px;
  font-weight: 700;
  flex: 1;
}

.group-count {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
}

html.dark .group-count {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

html:not(.dark) .group-count {
  background: #e5e7eb;
  color: #6b7280;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  opacity: 0.7;
}

.empty-desc {
  font-size: 14px;
  margin: 0;
  opacity: 0.5;
}

/* 模态框 */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端适配 */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 320px 1fr;
    gap: 20px;
  }

  .left-panel {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .page-title-section {
    margin-bottom: 20px;
  }

  .title-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .left-panel {
    position: relative;
    top: 0;
  }

  .date-selector {
    flex-wrap: wrap;
  }

  .date-picker {
    width: 100%;
    order: -1;
  }

  .stats-details {
    gap: 10px;
  }

  .stat-item {
    padding: 10px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
  }

  .stat-value {
    font-size: 20px;
  }

  .todos-card {
    min-height: 400px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .n-button {
    width: 100%;
  }
}
</style>
