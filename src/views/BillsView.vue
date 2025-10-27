<template>
  <div>
    <BillList @edit="handleEdit" />

    <!-- 编辑账单对话框 -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="编辑账单"
      :style="{ maxWidth: '600px', width: '90vw' }"
      :mask-closable="false"
      :segmented="{ content: 'soft' }"
    >
      <BillForm
        :editing-bill="editingBill"
        :show-card="false"
        @submitted="handleEditSubmitted"
        @cancel="handleEditCancel"
      />
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { NModal } from 'naive-ui'
import BillList from '../components/BillList.vue'
import BillForm from '../components/BillForm.vue'
import type { Bill } from '../types/bill'

const showEditModal = ref(false)
const editingBill = ref<Bill | null>(null)

function handleEdit(bill: Bill) {
  editingBill.value = bill
  showEditModal.value = true
}

function handleEditSubmitted() {
  showEditModal.value = false
  editingBill.value = null
}

function handleEditCancel() {
  showEditModal.value = false
  editingBill.value = null
}
</script>
