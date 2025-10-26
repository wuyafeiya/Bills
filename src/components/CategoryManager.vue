<template>
  <div class="category-manager">
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="expense" tab="支出分类">
        <CategoryList
          :categories="expenseCategories"
          type="expense"
          @edit="handleEdit"
          @delete="handleDelete"
          @add="handleAdd('expense')"
        />
      </n-tab-pane>

      <n-tab-pane name="income" tab="收入分类">
        <CategoryList
          :categories="incomeCategories"
          type="income"
          @edit="handleEdit"
          @delete="handleDelete"
          @add="handleAdd('income')"
        />
      </n-tab-pane>
    </n-tabs>

    <!-- 编辑/新增分类对话框 -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      :title="editingCategory ? '编辑分类' : '新增分类'"
      style="width: 500px"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="分类名称" path="name">
          <n-input
            v-model:value="formData.name"
            placeholder="请输入分类名称"
            maxlength="10"
            show-count
          />
        </n-form-item>

        <n-form-item label="图标">
          <div class="w-full">
            <n-button
              @click="showIconPicker = true"
              block
              style="justify-content: flex-start"
            >
              <template #icon>
                <n-icon :color="formData.color" size="18">
                  <font-awesome-icon :icon="['fas', formData.icon]" />
                </n-icon>
              </template>
              {{ getIconLabel(formData.icon) }}
            </n-button>
          </div>
        </n-form-item>

        <n-form-item label="颜色">
          <n-color-picker
            v-model:value="formData.color"
            :swatches="PRESET_COLORS"
            :modes="['hex']"
            show-preview
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 图标选择器对话框 -->
    <n-modal
      v-model:show="showIconPicker"
      preset="card"
      title="选择图标"
      style="width: 600px"
      :bordered="false"
    >
      <div class="icon-grid">
        <div
          v-for="item in PRESET_ICONS"
          :key="item.icon"
          class="icon-item"
          :class="{ active: formData.icon === item.icon }"
          @click="selectIcon(item.icon)"
        >
          <n-icon size="24" :color="formData.icon === item.icon ? formData.color : '#666'">
            <font-awesome-icon :icon="['fas', item.icon]" />
          </n-icon>
          <span class="icon-label">{{ item.label }}</span>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showIconPicker = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  NTabs,
  NTabPane,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  NIcon,
  NColorPicker,
  useMessage,
  useDialog,
  type FormInst,
  type FormRules
} from 'naive-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useCategoryStore } from '../composables/useCategoryStore'
import { PRESET_COLORS, PRESET_ICONS } from '../types/category'
import type { CustomCategory } from '../types/category'
import CategoryList from './CategoryList.vue'

const {
  expenseCategories,
  incomeCategories,
  addCategory,
  updateCategory,
  deleteCategory
} = useCategoryStore()

const message = useMessage()
const dialog = useDialog()

const activeTab = ref('expense')
const showEditModal = ref(false)
const showIconPicker = ref(false)
const editingCategory = ref<CustomCategory | null>(null)
const formRef = ref<FormInst | null>(null)

interface CategoryFormData {
  name: string
  icon: string
  color: string
  type: 'expense' | 'income'
}

const formData = ref<CategoryFormData>({
  name: '',
  icon: 'ellipsis-h',
  color: '#868e96',
  type: 'expense'
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 10, message: '分类名称长度为 1-10 个字符', trigger: 'blur' }
  ]
}

function getIconLabel(iconName: string): string {
  const item = PRESET_ICONS.find(i => i.icon === iconName)
  return item?.label || '选择图标'
}

function handleAdd(type: 'expense' | 'income') {
  editingCategory.value = null
  formData.value = {
    name: '',
    icon: 'ellipsis-h',
    color: '#868e96',
    type
  }
  showEditModal.value = true
}

function handleEdit(category: CustomCategory) {
  if (category.isDefault) {
    message.warning('默认分类不可编辑')
    return
  }
  editingCategory.value = category
  formData.value = {
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type
  }
  showEditModal.value = true
}

function handleDelete(category: CustomCategory) {
  if (category.isDefault) {
    message.warning('默认分类不可删除')
    return
  }

  dialog.warning({
    title: '确认删除',
    content: `确定要删除分类「${category.name}」吗？此操作不可恢复。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      const success = deleteCategory(category.id)
      if (success) {
        message.success('删除成功')
      } else {
        message.error('删除失败')
      }
    }
  })
}

function selectIcon(icon: string) {
  formData.value.icon = icon
  showIconPicker.value = false
}

async function handleSave() {
  try {
    await formRef.value?.validate()

    if (editingCategory.value) {
      // 更新分类
      updateCategory(editingCategory.value.id, {
        name: formData.value.name,
        icon: formData.value.icon,
        color: formData.value.color
      })
      message.success('更新成功')
    } else {
      // 新增分类
      addCategory({
        name: formData.value.name,
        icon: formData.value.icon,
        color: formData.value.color,
        type: formData.value.type,
        isDefault: false
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
.category-manager {
  padding: 16px 0;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.icon-item:hover {
  background-color: #f5f5f5;
}

.icon-item.active {
  border-color: #18a058;
  background-color: #f0fdf4;
}

.icon-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.2;
}

.icon-item.active .icon-label {
  color: #18a058;
  font-weight: 500;
}
</style>
