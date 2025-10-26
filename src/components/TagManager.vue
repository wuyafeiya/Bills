<template>
  <div class="tag-manager">
    <div class="header">
      <n-button type="primary" @click="handleAdd">
        <template #icon>
          <n-icon>
            <font-awesome-icon :icon="['fas', 'plus']" />
          </n-icon>
        </template>
        新增标签
      </n-button>
    </div>

    <div v-if="sortedTags.length > 0" class="tag-list">
      <n-card
        v-for="tag in sortedTags"
        :key="tag.id"
        size="small"
        :bordered="false"
        class="tag-card"
      >
        <div class="tag-item">
          <div class="tag-info">
            <n-tag
              :color="{ color: tag.color + '20', borderColor: tag.color, textColor: tag.color }"
              :bordered="true"
              size="large"
            >
              <template #icon>
                <n-icon size="14">
                  <font-awesome-icon :icon="['fas', 'tag']" />
                </n-icon>
              </template>
              {{ tag.name }}
            </n-tag>

            <div class="tag-stats">
              <span class="usage-count">
                使用 {{ tag.usageCount }} 次
              </span>
              <span class="tag-color-text">
                <span class="color-dot" :style="{ backgroundColor: tag.color }" />
                {{ tag.color }}
              </span>
            </div>
          </div>

          <n-space :size="8">
            <n-button
              size="small"
              quaternary
              circle
              @click="handleEdit(tag)"
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
              @click="handleDelete(tag)"
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
    </div>

    <n-empty
      v-else
      description="暂无标签"
      size="medium"
      style="padding: 60px 0"
    >
      <template #icon>
        <n-icon size="48" :depth="3">
          <font-awesome-icon :icon="['fas', 'tags']" />
        </n-icon>
      </template>
      <template #extra>
        <n-button @click="handleAdd">创建第一个标签</n-button>
      </template>
    </n-empty>

    <!-- 编辑/新增标签对话框 -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      :title="editingTag ? '编辑标签' : '新增标签'"
      style="width: 450px"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="70"
      >
        <n-form-item label="标签名称" path="name">
          <n-input
            v-model:value="formData.name"
            placeholder="如：旅行、聚餐、节日等"
            maxlength="8"
            show-count
          />
        </n-form-item>

        <n-form-item label="标签颜色">
          <n-color-picker
            v-model:value="formData.color"
            :swatches="PRESET_COLORS"
            :modes="['hex']"
            show-preview
          />
        </n-form-item>

        <n-form-item label="预览">
          <n-tag
            :color="{ color: formData.color + '20', borderColor: formData.color, textColor: formData.color }"
            :bordered="true"
            size="large"
          >
            <template #icon>
              <n-icon size="14">
                <font-awesome-icon :icon="['fas', 'tag']" />
              </n-icon>
            </template>
            {{ formData.name || '标签名称' }}
          </n-tag>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  NCard,
  NButton,
  NIcon,
  NSpace,
  NTag,
  NEmpty,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NColorPicker,
  useMessage,
  useDialog,
  type FormInst,
  type FormRules
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useCategoryStore } from '../composables/useCategoryStore'
import { PRESET_COLORS } from '../types/category'
import type { Tag } from '../types/category'

const { tags, addTag, updateTag, deleteTag } = useCategoryStore()

const message = useMessage()
const dialog = useDialog()

const showEditModal = ref(false)
const editingTag = ref<Tag | null>(null)
const formRef = ref<FormInst | null>(null)

interface TagFormData {
  name: string
  color: string
}

const formData = ref<TagFormData>({
  name: '',
  color: '#18a058'
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 8, message: '标签名称长度为 1-8 个字符', trigger: 'blur' }
  ]
}

// 按使用次数排序
const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => b.usageCount - a.usageCount)
})

function handleAdd() {
  editingTag.value = null
  formData.value = {
    name: '',
    color: '#18a058'
  }
  showEditModal.value = true
}

function handleEdit(tag: Tag) {
  editingTag.value = tag
  formData.value = {
    name: tag.name,
    color: tag.color
  }
  showEditModal.value = true
}

function handleDelete(tag: Tag) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除标签「${tag.name}」吗？此操作不可恢复。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      deleteTag(tag.id)
      message.success('删除成功')
    }
  })
}

async function handleSave() {
  try {
    await formRef.value?.validate()

    if (editingTag.value) {
      // 更新标签
      updateTag(editingTag.value.id, {
        name: formData.value.name,
        color: formData.value.color
      })
      message.success('更新成功')
    } else {
      // 新增标签
      addTag({
        name: formData.value.name,
        color: formData.value.color
      })
      message.success('添加成功')
    }

    showEditModal.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}
</script>

<style scoped>
.tag-manager {
  padding: 16px 0;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.tag-list {
  display: grid;
  gap: 12px;
}

.tag-card {
  transition: all 0.2s;
}

.tag-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.tag-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.usage-count {
  font-weight: 500;
}

.tag-color-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
