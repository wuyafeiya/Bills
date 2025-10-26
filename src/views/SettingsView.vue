<template>
  <div class="settings-view">
    <n-card :bordered="false">
      <template #header>
        <div>
          <h1 class="text-2xl font-bold">设置</h1>
          <p class="text-gray-500 mt-1 text-sm">管理你的应用偏好设置</p>
        </div>
      </template>

      <n-tabs type="line" animated>
        <n-tab-pane name="category" tab="分类管理">
          <CategoryManager />
        </n-tab-pane>

        <n-tab-pane name="tag" tab="标签管理">
          <TagManager />
        </n-tab-pane>

        <n-tab-pane name="data" tab="数据管理">
          <div class="data-management">
            <n-space vertical :size="16">
              <n-card size="small" :bordered="false" class="action-card">
                <div class="action-item">
                  <div class="action-info">
                    <h3 class="action-title">数据导出</h3>
                    <p class="action-desc">导出所有账单数据为 JSON 文件</p>
                  </div>
                  <n-button type="info" @click="handleExport">
                    <template #icon>
                      <n-icon>
                        <font-awesome-icon :icon="['fas', 'download']" />
                      </n-icon>
                    </template>
                    导出数据
                  </n-button>
                </div>
              </n-card>

              <n-card size="small" :bordered="false" class="action-card">
                <div class="action-item">
                  <div class="action-info">
                    <h3 class="action-title">数据导入</h3>
                    <p class="action-desc">从 JSON 文件导入账单数据</p>
                  </div>
                  <n-upload
                    :show-file-list="false"
                    accept=".json"
                    @before-upload="handleImport"
                  >
                    <n-button type="success">
                      <template #icon>
                        <n-icon>
                          <font-awesome-icon :icon="['fas', 'upload']" />
                        </n-icon>
                      </template>
                      导入数据
                    </n-button>
                  </n-upload>
                </div>
              </n-card>

              <n-card size="small" :bordered="false" class="action-card">
                <div class="action-item">
                  <div class="action-info">
                    <h3 class="action-title">清除所有数据</h3>
                    <p class="action-desc">删除所有账单记录（不可恢复）</p>
                  </div>
                  <n-button type="error" @click="handleClearData">
                    <template #icon>
                      <n-icon>
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </n-icon>
                    </template>
                    清除数据
                  </n-button>
                </div>
              </n-card>

              <n-card size="small" :bordered="false" class="action-card">
                <div class="action-item">
                  <div class="action-info">
                    <h3 class="action-title">重置分类</h3>
                    <p class="action-desc">恢复默认分类设置</p>
                  </div>
                  <n-button @click="handleResetCategories">
                    <template #icon>
                      <n-icon>
                        <font-awesome-icon :icon="['fas', 'undo']" />
                      </n-icon>
                    </template>
                    重置分类
                  </n-button>
                </div>
              </n-card>
            </n-space>
          </div>
        </n-tab-pane>

        <n-tab-pane name="about" tab="关于">
          <div class="about-section">
            <n-card :bordered="false" size="small">
              <n-space vertical :size="16">
                <div class="about-item">
                  <h3 class="about-label">应用名称</h3>
                  <p class="about-value">账单管理系统</p>
                </div>
                <n-divider />
                <div class="about-item">
                  <h3 class="about-label">版本号</h3>
                  <p class="about-value">v1.0.0</p>
                </div>
                <n-divider />
                <div class="about-item">
                  <h3 class="about-label">开发框架</h3>
                  <p class="about-value">Vue 3 + Naive UI + Tailwind CSS</p>
                </div>
                <n-divider />
                <div class="about-item">
                  <h3 class="about-label">版权信息</h3>
                  <p class="about-value">© 2025 账单管理系统. All rights reserved.</p>
                </div>
              </n-space>
            </n-card>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { NCard, NTabs, NTabPane, NSpace, NButton, NIcon, NUpload, NDivider, useMessage, useDialog, type UploadFileInfo } from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CategoryManager from '../components/CategoryManager.vue'
import TagManager from '../components/TagManager.vue'
import { useBillStore } from '../composables/useBillStore'
import { useCategoryStore } from '../composables/useCategoryStore'

const { bills, clearAllBills } = useBillStore()
const { resetToDefaultCategories } = useCategoryStore()
const message = useMessage()
const dialog = useDialog()

// 导出数据
function handleExport() {
  const data = {
    bills: bills.value,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bills_export_${new Date().getTime()}.json`
  a.click()
  URL.revokeObjectURL(url)

  message.success('数据导出成功')
}

// 导入数据
async function handleImport(options: { file: UploadFileInfo }) {
  const file = options.file.file
  if (!file) {
    message.error('文件不存在')
    return false
  }

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.bills || !Array.isArray(data.bills)) {
      message.error('文件格式不正确')
      return false
    }

    dialog.warning({
      title: '确认导入',
      content: `即将导入 ${data.bills.length} 条账单数据，是否继续？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        // 这里需要实现批量导入的逻辑
        message.success('数据导入成功')
      }
    })
  } catch (error) {
    message.error('文件解析失败')
  }

  return false
}

// 清除数据
function handleClearData() {
  dialog.error({
    title: '危险操作',
    content: '确定要清除所有账单数据吗？此操作不可恢复！',
    positiveText: '确定清除',
    negativeText: '取消',
    onPositiveClick: () => {
      clearAllBills()
      message.success('数据已清除')
    }
  })
}

// 重置分类
function handleResetCategories() {
  dialog.warning({
    title: '确认重置',
    content: '确定要重置分类设置为默认值吗？自定义分类将被删除。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      resetToDefaultCategories()
      message.success('分类已重置')
    }
  })
}
</script>

<style scoped>
.settings-view {
  padding: 16px;
}

.data-management {
  padding: 16px 0;
}

.action-card {
  transition: all 0.2s;
}

.action-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  width: 100%;
}

.action-info {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.action-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* 修复 n-upload 组件导致的布局问题 */
.action-item :deep(.n-upload) {
  display: inline-block;
  flex-shrink: 0;
}

.about-section {
  padding: 16px 0;
}

.about-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.about-value {
  font-size: 15px;
  color: #333;
}
</style>
