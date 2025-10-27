<template>
  <n-card v-if="showCard" :bordered="false" class="shadow-sm">
    <template #header>
      <h2 class="text-2xl font-bold text-gray-800">
        {{ editingBill ? '编辑账单' : '添加账单' }}
      </h2>
    </template>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
      require-mark-placement="right-hanging"
      size="medium"
    >
      <!-- 类型选择 - 固定为支出 -->
      <n-form-item label="类型" path="type">
        <n-tag type="error" size="large" :bordered="false">
          <template #icon>
            <n-icon>
              <font-awesome-icon :icon="['fas', 'arrow-trend-down']" />
            </n-icon>
          </template>
          支出
        </n-tag>
      </n-form-item>

      <!-- 标题 -->
      <n-form-item label="标题" path="title">
        <n-input
          v-model:value="formData.title"
          placeholder="请输入账单标题"
          clearable
        />
      </n-form-item>

      <!-- 金额 -->
      <n-form-item label="金额" path="amount">
        <n-input-number
          v-model:value="formData.amount"
          :min="0"
          :precision="2"
          :show-button="false"
          placeholder="0.00"
          style="width: 100%"
        >
          <template #prefix>
            ¥
          </template>
        </n-input-number>
      </n-form-item>

      <!-- 分类 -->
      <n-form-item label="分类" path="category">
        <n-select
          v-model:value="formData.category"
          :options="categoryOptions"
          placeholder="请选择分类"
          clearable
        />
      </n-form-item>

      <!-- 日期 -->
      <n-form-item label="日期" path="date">
        <n-date-picker
          v-model:formatted-value="formData.date"
          type="date"
          value-format="yyyy-MM-dd"
          style="width: 100%"
          clearable
        />
      </n-form-item>

      <!-- 支付方式 -->
      <n-form-item label="支付方式">
        <n-select
          v-model:value="formData.paymentMethod"
          :options="paymentMethodOptions"
          placeholder="请选择支付方式（可选）"
          clearable
        />
      </n-form-item>

      <!-- 标签 -->
      <n-form-item label="标签">
        <n-dynamic-tags
          v-model:value="formData.tags"
          :max="5"
          placeholder="添加标签"
        />
      </n-form-item>

      <!-- 描述 -->
      <n-form-item label="描述">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="请输入账单描述（可选）"
          :rows="3"
          :autosize="{
            minRows: 3,
            maxRows: 5
          }"
        />
      </n-form-item>

      <!-- 按钮组 -->
      <n-form-item>
        <n-space style="width: 100%; margin-top: 8px">
          <n-button
            type="primary"
            attr-type="submit"
            @click="handleSubmit"
            :loading="loading"
            style="flex: 1"
          >
            <template #icon>
              <n-icon>
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </n-icon>
            </template>
            {{ editingBill ? '保存修改' : '添加账单' }}
          </n-button>
          <n-button
            @click="handleCancel"
            style="flex: 1"
          >
            <template #icon>
              <n-icon>
                <font-awesome-icon :icon="['fas', 'xmark']" />
              </n-icon>
            </template>
            {{ editingBill ? '取消编辑' : '取消' }}
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-card>

  <!-- 无卡片模式 -->
  <n-form
    v-else
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    require-mark-placement="right-hanging"
    size="large"
    class="bill-form"
  >
    <!-- 类型选择 - 固定为支出 -->
    <n-form-item label="类型" path="type">
      <n-tag type="error" size="large" :bordered="false" class="type-tag">
        <template #icon>
          <n-icon>
            <font-awesome-icon :icon="['fas', 'arrow-trend-down']" />
          </n-icon>
        </template>
        支出
      </n-tag>
    </n-form-item>

    <!-- 标题和金额 - 两列布局 -->
    <n-grid :cols="isMobile ? 1 : 2" :x-gap="16" responsive="screen">
      <n-grid-item>
        <!-- 标题 -->
        <n-form-item label="标题" path="title">
          <n-input
            v-model:value="formData.title"
            placeholder="例如：午餐、打车、购物等"
            clearable
            size="large"
          >
            <template #prefix>
              <n-icon>
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <!-- 金额 -->
        <n-form-item label="金额" path="amount">
          <n-input-number
            v-model:value="formData.amount"
            :min="0"
            :precision="2"
            :show-button="false"
            placeholder="0.00"
            style="width: 100%"
            size="large"
          >
            <template #prefix>
              <n-icon color="#f56c6c">
                <font-awesome-icon :icon="['fas', 'money-bill-wave']" />
              </n-icon>
            </template>
          </n-input-number>
        </n-form-item>
      </n-grid-item>
    </n-grid>

    <!-- 分类和支付方式 - 两列布局 -->
    <n-grid :cols="isMobile ? 1 : 2" :x-gap="16" responsive="screen">
      <n-grid-item>
        <!-- 分类 -->
        <n-form-item label="分类" path="category">
          <n-select
            v-model:value="formData.category"
            :options="categoryOptions"
            placeholder="选择账单分类"
            clearable
            size="large"
          >
            <template #prefix>
              <n-icon>
                <font-awesome-icon :icon="['fas', 'tags']" />
              </n-icon>
            </template>
          </n-select>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <!-- 支付方式 -->
        <n-form-item label="支付方式">
          <n-select
            v-model:value="formData.paymentMethod"
            :options="paymentMethodOptions"
            placeholder="选择支付方式（可选）"
            clearable
            size="large"
          >
            <template #prefix>
              <n-icon>
                <font-awesome-icon :icon="['fas', 'wallet']" />
              </n-icon>
            </template>
          </n-select>
        </n-form-item>
      </n-grid-item>
    </n-grid>

    <!-- 日期 -->
    <n-form-item label="日期" path="date">
      <n-date-picker
        v-model:formatted-value="formData.date"
        type="date"
        value-format="yyyy-MM-dd"
        style="width: 100%"
        clearable
        size="large"
      >
        <template #date-icon>
          <n-icon>
            <font-awesome-icon :icon="['fas', 'calendar-day']" />
          </n-icon>
        </template>
      </n-date-picker>
    </n-form-item>

    <!-- 标签 -->
    <n-form-item label="标签">
      <n-dynamic-tags
        v-model:value="formData.tags"
        :max="5"
        placeholder="添加标签（最多5个）"
        size="large"
      />
    </n-form-item>

    <!-- 描述 -->
    <n-form-item label="备注">
      <n-input
        v-model:value="formData.description"
        type="textarea"
        placeholder="添加备注说明（可选）"
        :rows="3"
        :autosize="{
          minRows: 3,
          maxRows: 5
        }"
        size="large"
      />
    </n-form-item>

    <!-- 按钮组 -->
    <n-form-item>
      <n-space style="width: 100%; margin-top: 1rem" :size="12">
        <n-button
          type="primary"
          attr-type="submit"
          @click="handleSubmit"
          :loading="loading"
          size="large"
          style="flex: 1"
          strong
        >
          <template #icon>
            <n-icon>
              <font-awesome-icon :icon="['fas', 'circle-check']" />
            </n-icon>
          </template>
          {{ editingBill ? '保存修改' : '添加账单' }}
        </n-button>
        <n-button
          @click="handleCancel"
          size="large"
          style="flex: 1"
        >
          <template #icon>
            <n-icon>
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </n-icon>
          </template>
          {{ editingBill ? '取消编辑' : '重置' }}
        </n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NButton,
  NButtonGroup,
  NSpace,
  NIcon,
  NDynamicTags,
  NGrid,
  NGridItem,
  NTag,
  useMessage,
  type FormInst,
  type FormRules,
  type FormItemRule
} from 'naive-ui'
import { useBillStore } from '../composables/useBillStore'
import { useResponsive } from '../composables/useResponsive'
import type { Bill } from '../types/bill'
import {
  BillCategory,
  BillType,
  PaymentMethod,
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  PAYMENT_METHOD_LABELS
} from '../types/bill'
import { getTodayDateString } from '../utils/date'

const props = withDefaults(defineProps<{
  editingBill?: Bill | null
  showCard?: boolean
}>(), {
  editingBill: null,
  showCard: true
})

const emit = defineEmits<{
  submitted: []
  cancel: []
}>()

const { addBill, updateBill } = useBillStore()
const { isMobile } = useResponsive()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

// 表单数据
const formData = ref({
  type: BillType.EXPENSE,
  title: '',
  amount: 0,
  category: '' as BillCategory | '',
  date: getTodayDateString(),
  paymentMethod: undefined as PaymentMethod | undefined,
  tags: [] as string[],
  description: ''
})

// 表单验证规则
const rules: FormRules = {
  title: [
    {
      required: true,
      message: '请输入账单标题',
      trigger: ['blur', 'input']
    }
  ],
  amount: [
    {
      required: true,
      type: 'number',
      message: '请输入金额',
      trigger: ['blur', 'change']
    },
    {
      type: 'number',
      validator: (_rule: FormItemRule, value: number) => {
        return value > 0
      },
      message: '金额必须大于0',
      trigger: ['blur', 'change']
    }
  ],
  category: [
    {
      required: true,
      message: '请选择分类',
      trigger: ['blur', 'change']
    }
  ],
  date: [
    {
      required: true,
      message: '请选择日期',
      trigger: ['blur', 'change']
    }
  ]
}

// 分类选项（只有支出分类）
const categoryOptions = computed(() => {
  return EXPENSE_CATEGORIES.map(cat => ({
    label: CATEGORY_LABELS[cat],
    value: cat
  }))
})

// 支付方式选项
const paymentMethodOptions = computed(() => {
  return Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    label,
    value: value as PaymentMethod
  }))
})

// 监听编辑的账单，填充表单
watch(
  () => props.editingBill,
  (bill) => {
    if (bill) {
      formData.value = {
        type: bill.type,
        title: bill.title,
        amount: bill.amount,
        category: bill.category,
        date: bill.date,
        paymentMethod: bill.paymentMethod,
        tags: bill.tags || [],
        description: bill.description || ''
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 提交表单
function handleSubmit(e: Event) {
  e.preventDefault()

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true

      try {
        const billData = {
          type: formData.value.type,
          title: formData.value.title,
          amount: formData.value.amount,
          category: formData.value.category,
          date: formData.value.date,
          paymentMethod: formData.value.paymentMethod,
          tags: formData.value.tags.length > 0 ? formData.value.tags : undefined,
          description: formData.value.description || undefined
        }

        if (props.editingBill) {
          // 更新账单
          await updateBill(props.editingBill.id, billData)
          message.success('账单更新成功')
        } else {
          // 添加账单
          await addBill(billData)
          message.success('账单添加成功')
        }

        resetForm()
        emit('submitted')
      } catch (error) {
        console.error('提交账单失败:', error)
        message.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
    } else {
      message.error('请检查表单填写')
    }
  })
}

// 取消编辑
function handleCancel() {
  resetForm()
  emit('cancel')
}

// 重置表单
function resetForm() {
  formData.value = {
    type: BillType.EXPENSE,
    title: '',
    amount: 0,
    category: '',
    date: getTodayDateString(),
    paymentMethod: undefined,
    tags: [],
    description: ''
  }
}
</script>

<style scoped>
.bill-form {
  padding: 0.5rem 0;
}

.type-tag {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
}

/* 表单项间距优化 */
.bill-form :deep(.n-form-item) {
  margin-bottom: 1.25rem;
}

.bill-form :deep(.n-form-item:last-child) {
  margin-bottom: 0;
}

/* 输入框样式优化 */
.bill-form :deep(.n-input),
.bill-form :deep(.n-input-number),
.bill-form :deep(.n-select),
.bill-form :deep(.n-date-picker) {
  transition: all 0.3s ease;
}

.bill-form :deep(.n-input:hover),
.bill-form :deep(.n-input-number:hover),
.bill-form :deep(.n-select:hover),
.bill-form :deep(.n-date-picker:hover) {
  transform: translateY(-1px);
}

.bill-form :deep(.n-input:focus-within),
.bill-form :deep(.n-input-number:focus-within),
.bill-form :deep(.n-select:focus-within),
.bill-form :deep(.n-date-picker:focus-within) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.15);
}

/* 按钮样式优化 */
.bill-form :deep(.n-button) {
  transition: all 0.3s ease;
  font-weight: 500;
}

.bill-form :deep(.n-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bill-form :deep(.n-button:active) {
  transform: translateY(0);
}

/* 标签输入框样式 */
.bill-form :deep(.n-dynamic-tags .n-tag) {
  transition: all 0.2s ease;
}

.bill-form :deep(.n-dynamic-tags .n-tag:hover) {
  transform: scale(1.05);
}

/* 文本域样式 */
.bill-form :deep(.n-input__textarea-el) {
  transition: all 0.3s ease;
}

.bill-form :deep(.n-input__textarea-el:hover) {
  transform: translateY(-1px);
}

/* 表单标签样式 */
.bill-form :deep(.n-form-item-label) {
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
}

:global(.dark) .bill-form :deep(.n-form-item-label) {
  color: #ddd;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .bill-form {
    padding: 0;
  }

  .bill-form :deep(.n-form-item) {
    margin-bottom: 1rem;
  }

  .type-tag {
    width: 100%;
    justify-content: center;
  }
}
</style>
