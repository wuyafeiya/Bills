import { ref, computed, provide, inject, type InjectionKey, onMounted } from 'vue';
import type { Bill, BillStats, TrendData, DatabaseBill } from '../types/bill';
import { BillCategory, BillType, EXPENSE_CATEGORIES } from '../types/bill';
import { supabase } from '../lib/supabase';

// 定义注入键
export const BillStoreKey: InjectionKey<ReturnType<typeof createBillStore>> = Symbol('BillStore');

// 转换函数：数据库格式 -> 应用格式
function dbBillToBill(dbBill: DatabaseBill): Bill {
  return {
    id: dbBill.id,
    type: dbBill.type,
    title: dbBill.title,
    amount: dbBill.amount,
    category: dbBill.category,
    date: dbBill.date,
    paymentMethod: dbBill.payment_method,
    description: dbBill.description,
    tags: dbBill.tags,
    createdAt: dbBill.created_at,
    updatedAt: dbBill.updated_at,
  };
}

// 转换函数：应用格式 -> 数据库格式
function billToDbBill(bill: Partial<Bill>): Partial<DatabaseBill> {
  const dbBill: Partial<DatabaseBill> = {
    type: bill.type,
    title: bill.title,
    amount: bill.amount,
    category: bill.category,
    date: bill.date,
    description: bill.description,
    tags: bill.tags,
  };

  if (bill.paymentMethod !== undefined) {
    dbBill.payment_method = bill.paymentMethod;
  }
  if (bill.createdAt !== undefined) {
    dbBill.created_at = bill.createdAt;
  }
  if (bill.updatedAt !== undefined) {
    dbBill.updated_at = bill.updatedAt;
  }

  return dbBill;
}

// 创建账单存储
export function createBillStore() {
  // 状态
  const bills = ref<Bill[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 从 Supabase 获取所有账单
  async function fetchBills() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // 转换数据库格式到应用格式
      bills.value = (data as DatabaseBill[])?.map(dbBillToBill) || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取账单失败';
      console.error('Error fetching bills:', err);
    } finally {
      loading.value = false;
    }
  }

  // 辅助函数：判断日期是否为今天
  function isToday(dateString: string) {
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  // 辅助函数：判断日期是否为本月
  function isThisMonth(dateString: string) {
    const today = new Date();
    const date = new Date(dateString);
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  // 辅助函数：判断日期是否为本年
  function isThisYear(dateString: string) {
    const today = new Date();
    const date = new Date(dateString);
    return date.getFullYear() === today.getFullYear();
  }

  // 计算属性：统计数据
  const stats = computed<BillStats>(() => {
    const expenseBills = bills.value.filter((b) => b.type === BillType.EXPENSE);

    // 总支出
    const totalExpense = expenseBills.reduce((sum, bill) => sum + bill.amount, 0);

    // 今日支出
    const todayExpense = expenseBills.filter((bill) => isToday(bill.date)).reduce((sum, bill) => sum + bill.amount, 0);

    // 本月支出
    const monthExpense = expenseBills.filter((bill) => isThisMonth(bill.date)).reduce((sum, bill) => sum + bill.amount, 0);

    // 本年支出
    const yearExpense = expenseBills.filter((bill) => isThisYear(bill.date)).reduce((sum, bill) => sum + bill.amount, 0);

    // 按分类统计（仅支出）
    const categoryMap = new Map<BillCategory, { total: number; count: number }>();

    expenseBills.forEach((bill) => {
      const current = categoryMap.get(bill.category) || { total: 0, count: 0 };
      categoryMap.set(bill.category, {
        total: current.total + bill.amount,
        count: current.count + 1,
      });
    });

    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // 最近的账单（前5条）
    const recentBills = [...bills.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return {
      totalExpense,
      todayExpense,
      monthExpense,
      yearExpense,
      categoryStats,
      recentBills,
    };
  });

  // 计算属性：趋势数据（最近30天）
  const trendData = computed<TrendData[]>(() => {
    const data: TrendData[] = [];
    const today = new Date();

    // 生成最近30天的数据
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayBills = bills.value.filter((b) => b.date === dateString);
      const expense = dayBills.filter((b) => b.type === BillType.EXPENSE).reduce((sum, b) => sum + b.amount, 0);

      data.push({
        date: dateString,
        expense,
      });
    }

    return data;
  });

  // 计算属性：按日期排序的账单列表
  const sortedBills = computed(() => {
    return [...bills.value].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  // 添加账单
  async function addBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;

    try {
      // 转换为数据库格式
      const dbBill = billToDbBill({
        ...bill,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const { data, error: insertError } = await supabase
        .from('bills')
        .insert([dbBill])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        // 转换回应用格式并添加到列表
        bills.value.unshift(dbBillToBill(data as DatabaseBill));
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加账单失败';
      console.error('Error adding bill:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 更新账单
  async function updateBill(id: string, updates: Partial<Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>>) {
    loading.value = true;
    error.value = null;

    try {
      // 转换为数据库格式
      const dbUpdates = billToDbBill({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const { data, error: updateError } = await supabase
        .from('bills')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        const index = bills.value.findIndex((b) => b.id === id);
        if (index !== -1) {
          // 转换回应用格式
          bills.value[index] = dbBillToBill(data as DatabaseBill);
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新账单失败';
      console.error('Error updating bill:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 删除账单
  async function deleteBill(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const index = bills.value.findIndex((b) => b.id === id);
      if (index !== -1) {
        bills.value.splice(index, 1);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除账单失败';
      console.error('Error deleting bill:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 根据分类筛选账单
  function getBillsByCategory(category: BillCategory) {
    return bills.value.filter((bill) => bill.category === category);
  }

  // 根据类型筛选账单
  function getBillsByType(type: BillType) {
    return bills.value.filter((bill) => bill.type === type);
  }

  return {
    // 状态
    bills: sortedBills,
    stats,
    trendData,
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 方法
    fetchBills,
    addBill,
    updateBill,
    deleteBill,
    getBillsByCategory,
    getBillsByType,
  };
}

// 提供账单存储
export function provideBillStore() {
  const store = createBillStore();
  provide(BillStoreKey, store);

  // 在组件挂载时获取账单数据
  onMounted(() => {
    store.fetchBills();
  });

  return store;
}

// 使用账单存储
export function useBillStore() {
  const store = inject(BillStoreKey);
  if (!store) {
    throw new Error('BillStore not provided! Make sure to call provideBillStore() in a parent component.');
  }
  return store;
}
