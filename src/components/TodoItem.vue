<template>
  <div :class="['todo-item', { 'completed': todo.completed }]">
    <div class="todo-left">
      <!-- 勾选框 -->
      <n-checkbox
        :checked="todo.completed"
        @update:checked="handleToggle"
        size="large"
        class="todo-checkbox"
      />

      <!-- 优先级标记 -->
      <div
        class="priority-badge"
        :style="{ background: getPriorityColor(todo.priority) }"
      >
        <n-icon size="12" color="white">
          <font-awesome-icon :icon="['fas', getPriorityIcon(todo.priority)]" />
        </n-icon>
      </div>

      <!-- 内容区 -->
      <div class="todo-content">
        <div class="todo-title">{{ todo.title }}</div>
        <div v-if="todo.description" class="todo-description">{{ todo.description }}</div>
        <div v-if="todo.dueTime" class="todo-time">
          <n-icon size="14" color="#9ca3af">
            <font-awesome-icon :icon="['fas', 'clock']" />
          </n-icon>
          <span>{{ formatTime(todo.dueTime) }}</span>
        </div>
      </div>
    </div>

    <div class="todo-actions">
      <n-button
        text
        size="small"
        @click="$emit('edit', todo)"
        class="action-btn"
      >
        <template #icon>
          <n-icon><font-awesome-icon :icon="['fas', 'pen']" /></n-icon>
        </template>
      </n-button>
      <n-button
        text
        type="error"
        size="small"
        @click="handleDelete"
        class="action-btn"
      >
        <template #icon>
          <n-icon><font-awesome-icon :icon="['fas', 'trash-alt']" /></n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NCheckbox, NButton, NIcon } from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { TODO_PRIORITY_COLORS, type Todo, type TodoPriority } from '../types/todo'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  toggle: [id: string]
  edit: [todo: Todo]
  delete: [id: string]
}>()

function handleToggle(checked: boolean) {
  emit('toggle', props.todo.id)
}

function handleDelete() {
  emit('delete', props.todo.id)
}

function getPriorityColor(priority: TodoPriority) {
  return TODO_PRIORITY_COLORS[priority]
}

function getPriorityIcon(priority: TodoPriority) {
  const icons = {
    high: 'flag',
    medium: 'star',
    low: 'circle'
  }
  return icons[priority]
}

function formatTime(time: string) {
  return time.substring(0, 5) // HH:mm
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s ease;
  gap: 12px;
}

html.dark .todo-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html:not(.dark) .todo-item {
  background: #ffffff;
  border-color: #e5e7eb;
}

.todo-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

html.dark .todo-item:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

html:not(.dark) .todo-item:hover {
  border-color: #d1d5db;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.todo-checkbox {
  margin-top: 2px;
  flex-shrink: 0;
}

.priority-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.todo-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.todo-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}

html.dark .todo-title {
  color: rgba(255, 255, 255, 0.9);
}

html:not(.dark) .todo-title {
  color: #1f2937;
}

.todo-description {
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

html.dark .todo-description {
  color: rgba(255, 255, 255, 0.6);
}

html:not(.dark) .todo-description {
  color: #6b7280;
}

.todo-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

html.dark .todo-time {
  color: rgba(255, 255, 255, 0.5);
}

html:not(.dark) .todo-time {
  color: #9ca3af;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item:hover .action-btn {
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1 !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .todo-item {
    padding: 14px;
  }

  .todo-left {
    gap: 10px;
  }

  .priority-badge {
    width: 22px;
    height: 22px;
  }

  .todo-title {
    font-size: 14px;
  }

  .todo-description {
    font-size: 12px;
  }

  .action-btn {
    opacity: 0.7;
  }
}
</style>
