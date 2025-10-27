// 账单类型 - 只保留支出
export enum BillType {
  EXPENSE = 'expense'  // 支出
}

// 账单分类 - 只保留支出分类
export enum BillCategory {
  FOOD = 'food',           // 餐饮
  TRANSPORT = 'transport', // 交通
  SHOPPING = 'shopping',   // 购物
  ENTERTAINMENT = 'entertainment', // 娱乐
  UTILITIES = 'utilities', // 水电费
  HEALTH = 'health',       // 医疗
  EDUCATION = 'education', // 教育
  OTHER = 'other'          // 其他
}

// 分类显示名称
export const CATEGORY_LABELS: Record<BillCategory, string> = {
  [BillCategory.FOOD]: '餐饮',
  [BillCategory.TRANSPORT]: '交通',
  [BillCategory.SHOPPING]: '购物',
  [BillCategory.ENTERTAINMENT]: '娱乐',
  [BillCategory.UTILITIES]: '水电费',
  [BillCategory.HEALTH]: '医疗',
  [BillCategory.EDUCATION]: '教育',
  [BillCategory.OTHER]: '其他'
}

// 分类颜色
export const CATEGORY_COLORS: Record<BillCategory, string> = {
  [BillCategory.FOOD]: 'bg-orange-500',
  [BillCategory.TRANSPORT]: 'bg-blue-500',
  [BillCategory.SHOPPING]: 'bg-pink-500',
  [BillCategory.ENTERTAINMENT]: 'bg-purple-500',
  [BillCategory.UTILITIES]: 'bg-green-500',
  [BillCategory.HEALTH]: 'bg-red-500',
  [BillCategory.EDUCATION]: 'bg-yellow-500',
  [BillCategory.OTHER]: 'bg-gray-500'
}

// 支出分类（所有分类）
export const EXPENSE_CATEGORIES = [
  BillCategory.FOOD,
  BillCategory.TRANSPORT,
  BillCategory.SHOPPING,
  BillCategory.ENTERTAINMENT,
  BillCategory.UTILITIES,
  BillCategory.HEALTH,
  BillCategory.EDUCATION,
  BillCategory.OTHER
]

// 支付方式
export enum PaymentMethod {
  CASH = 'cash',           // 现金
  WECHAT = 'wechat',       // 微信
  ALIPAY = 'alipay',       // 支付宝
  CARD = 'card',           // 银行卡
  OTHER = 'other'          // 其他
}

// 支付方式显示名称
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: '现金',
  [PaymentMethod.WECHAT]: '微信',
  [PaymentMethod.ALIPAY]: '支付宝',
  [PaymentMethod.CARD]: '银行卡',
  [PaymentMethod.OTHER]: '其他'
}

// 账单接口
export interface Bill {
  id: string
  type: BillType
  title: string
  amount: number
  category: BillCategory
  date: string
  paymentMethod?: PaymentMethod  // 支付方式（可选）
  description?: string
  tags?: string[]               // 标签（可选）
  createdAt: string
  updatedAt: string
}

// 统计数据接口
export interface BillStats {
  totalExpense: number      // 总支出
  todayExpense: number      // 今日支出
  yesterdayExpense: number  // 昨日支出
  monthExpense: number      // 本月支出
  yearExpense: number       // 本年支出
  categoryStats: {
    category: BillCategory
    total: number
    count: number
    percentage: number
  }[]
  recentBills: Bill[]       // 最近的账单
}

// 趋势数据接口
export interface TrendData {
  date: string
  expense: number
}

// 数据库账单接口（snake_case，匹配 Supabase 表结构）
export interface DatabaseBill {
  id: string
  type: BillType
  title: string
  amount: number
  category: BillCategory
  date: string
  payment_method?: PaymentMethod  // 注意：数据库使用 snake_case
  description?: string
  tags?: string[]
  created_at: string              // 注意：数据库使用 snake_case
  updated_at: string              // 注意：数据库使用 snake_case
}
