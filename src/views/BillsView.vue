<template>
  <div>
    <BillList @edit="handleEdit" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import BillList from '../components/BillList.vue'
import type { Bill } from '../types/bill'

const router = useRouter()

function handleEdit(bill: Bill) {
  router.push({
    name: 'AddBill',
    state: { editingBill: bill }
  })
}
</script>
