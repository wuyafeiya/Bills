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
    path: '/bill-overview',
    name: 'BillOverview',
    component: () => import('../views/BillOverviewView.vue'),
    meta: {
      title: '账单总览'
    }
  },
  {
    path: '/bill-overview/month',
    name: 'MonthCategoryStats',
    component: () => import('../views/MonthCategoryStatsView.vue'),
    meta: {
      title: '月度分类统计'
    }
  },
  {
    path: '/bill-overview/category',
    name: 'CategoryBillList',
    component: () => import('../views/CategoryBillListView.vue'),
    meta: {
      title: '分类账单详情'
    }
  },
  {
    path: '/recipe-planner',
    name: 'RecipePlanner',
    component: () => import('../views/RecipePlannerView.vue'),
    meta: {
      title: '食谱计划'
    }
  },
  {
    path: '/todo-planner',
    name: 'TodoPlanner',
    component: () => import('../views/TodoPlannerView.vue'),
    meta: {
      title: '每日计划'
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
