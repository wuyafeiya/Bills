<template>
  <div class="add-bill-view">
    <!-- 顶部装饰区域 -->
    <div class="header-section">
      <div class="max-w-4xl mx-auto">
        <!-- 返回按钮 -->
        <n-button
          text
          @click="router.back()"
          class="back-button"
          size="large"
        >
          <template #icon>
            <n-icon size="20">
              <font-awesome-icon :icon="['fas', 'arrow-left']" />
            </n-icon>
          </template>
          返回
        </n-button>

        <!-- 标题区域 -->
        <div class="header-content">
          <div class="icon-wrapper">
            <n-icon size="36" :color="editingBill ? '#18a058' : '#2080f0'">
              <font-awesome-icon :icon="['fas', editingBill ? 'edit' : 'plus']" />
            </n-icon>
          </div>
          <h1 class="page-title">
            {{ editingBill ? '编辑账单' : '添加账单' }}
          </h1>
          <p class="page-description">
            {{ editingBill ? '修改您的账单信息' : '记录您的每一笔支出，让理财更轻松' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-section">
      <div class="max-w-4xl mx-auto">
        <n-card
          :bordered="false"
          class="form-card"
          :segmented="{
            content: 'soft',
            footer: 'soft'
          }"
        >
          <BillForm
            :editing-bill="editingBill"
            :show-card="false"
            @submitted="handleSubmitted"
            @cancel="router.back()"
          />
        </n-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NButton, NIcon, NAlert } from 'naive-ui'
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

<style scoped>
.add-bill-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

/* 深色主题下的背景 */
:global(.dark) .add-bill-view {
  background: linear-gradient(to bottom, #1a1a1a 0%, #0f0f0f 100%);
}

.header-section {
  padding: 1.5rem 1.5rem 2rem;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  position: relative;
  overflow: hidden;
}

/* 深色主题下的头部 */
:global(.dark) .header-section {
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
}

/* 装饰性背景元素 */
.header-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 40%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(15deg);
  border-radius: 50%;
}

.header-section::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 30%;
  height: 150%;
  background: rgba(255, 255, 255, 0.05);
  transform: rotate(-15deg);
  border-radius: 50%;
}

.back-button {
  color: white !important;
  margin-bottom: 1rem;
  opacity: 0.9;
  transition: opacity 0.2s;
  position: relative;
  z-index: 1;
}

.back-button:hover {
  opacity: 1;
}

.header-content {
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-description {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 300;
}

.form-section {
  padding: 0 1.5rem 2rem;
  margin-top: -1.5rem;
  position: relative;
  z-index: 2;
}

.form-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  border-radius: 16px !important;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.form-card :deep(.n-card__content) {
  padding: 1.5rem !important;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12) !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-section {
    padding: 1.5rem 1rem 2rem;
  }

  .icon-wrapper {
    width: 72px;
    height: 72px;
    margin-bottom: 1rem;
  }

  .icon-wrapper :deep(.n-icon) {
    font-size: 36px !important;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-description {
    font-size: 0.95rem;
  }

  .form-section {
    padding: 0 1rem 2rem;
    margin-top: -1.5rem;
  }
}

/* 平板适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  animation: fadeInUp 0.4s ease-out;
}
</style>
