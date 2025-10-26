<template>
  <div class="category-list">
    <div class="header">
      <n-button type="primary" @click="$emit('add')">
        <template #icon>
          <n-icon>
            <font-awesome-icon :icon="['fas', 'plus']" />
          </n-icon>
        </template>
        新增分类
      </n-button>
    </div>

    <n-space vertical :size="12" class="mt-4">
      <n-card
        v-for="category in categories"
        :key="category.id"
        size="small"
        :bordered="false"
        class="category-card"
      >
        <div class="category-item">
          <div class="category-info">
            <div
              class="category-icon-wrapper"
              :style="{ backgroundColor: category.color + '20', borderColor: category.color }"
            >
              <n-icon :color="category.color" size="20">
                <font-awesome-icon :icon="['fas', category.icon]" />
              </n-icon>
            </div>

            <div class="category-details">
              <div class="category-name">
                {{ category.name }}
                <n-tag v-if="category.isDefault" size="small" :bordered="false" type="info">
                  默认
                </n-tag>
              </div>
              <div class="category-meta">
                <span class="color-indicator" :style="{ backgroundColor: category.color }" />
                {{ category.color }}
              </div>
            </div>
          </div>

          <n-space :size="8">
            <n-button
              size="small"
              quaternary
              circle
              :disabled="category.isDefault"
              @click="$emit('edit', category)"
            >
              <template #icon>
                <n-icon size="16">
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </n-icon>
              </template>
            </n-button>

            <n-button
              size="small"
              quaternary
              circle
              type="error"
              :disabled="category.isDefault"
              @click="$emit('delete', category)"
            >
              <template #icon>
                <n-icon size="16">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </n-icon>
              </template>
            </n-button>
          </n-space>
        </div>
      </n-card>

      <n-empty
        v-if="categories.length === 0"
        description="暂无自定义分类"
        size="medium"
        style="padding: 40px 0"
      >
        <template #icon>
          <n-icon size="48" :depth="3">
            <font-awesome-icon :icon="['fas', 'folder-open']" />
          </n-icon>
        </template>
      </n-empty>
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import { NCard, NButton, NIcon, NSpace, NTag, NEmpty } from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { CustomCategory } from '../types/category'

defineProps<{
  categories: CustomCategory[]
  type: 'expense' | 'income'
}>()

defineEmits<{
  add: []
  edit: [category: CustomCategory]
  delete: [category: CustomCategory]
}>()
</script>

<style scoped>
.category-list {
  padding: 16px 0;
}

.header {
  display: flex;
  justify-content: flex-end;
}

.category-card {
  transition: all 0.2s;
}

.category-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.category-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-name {
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-meta {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-indicator {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
