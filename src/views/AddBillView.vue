<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-8">
      <button
        @click="router.back()"
        class="text-gray-600 hover:text-gray-800 flex items-center space-x-2 mb-4"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        <span>返回</span>
      </button>
      <h1 class="text-3xl font-bold text-gray-800">
        {{ editingBill ? '编辑账单' : '添加账单' }}
      </h1>
      <p class="text-gray-500 mt-1">
        {{ editingBill ? '修改账单信息' : '记录一笔新的收支' }}
      </p>
    </div>

    <BillForm
      :editing-bill="editingBill"
      @submitted="handleSubmitted"
      @cancel="router.back()"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BillForm from '../components/BillForm.vue'
import type { Bill } from '../types/bill'

const router = useRouter()
const editingBill = ref<Bill | null>(null)

onMounted(() => {
  // 从路由 state 获取编辑的账单
  if (history.state && history.state.editingBill) {
    editingBill.value = history.state.editingBill
  }
})

function handleSubmitted() {
  router.push('/')
}
</script>
