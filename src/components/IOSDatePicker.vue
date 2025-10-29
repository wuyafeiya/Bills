<template>
  <div class="ios-date-picker">
    <n-date-picker
      v-model:formatted-value="dateValue"
      type="date"
      value-format="yyyy-MM-dd"
      placeholder="请选择日期"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { NDatePicker, NIcon } from 'naive-ui'

const props = withDefaults(defineProps<{
  modelValue?: string
}>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const dateValue = ref(props.modelValue)

watch(() => props.modelValue, (value) => {
  dateValue.value = value
})

watch(dateValue, (value) => {
  emit('update:modelValue', value)
})
</script>

<style scoped>
.ios-date-picker {
  width: 100%;
}
</style>
