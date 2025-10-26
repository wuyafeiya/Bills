import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/bills',
    name: 'Bills',
    component: () => import('../views/BillsView.vue'),
    meta: {
      title: '账单列表'
    }
  },
  {
    path: '/add',
    name: 'AddBill',
    component: () => import('../views/AddBillView.vue'),
    meta: {
      title: '添加账单'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      title: '设置'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
