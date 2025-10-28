// 自定义分类接口（应用格式，使用 camelCase）
export interface CustomCategory {
  id: string
  name: string
  type: 'expense'            // 只支持支出
  color: string              // 颜色（十六进制）
  icon: string               // Font Awesome 图标名称
  isDefault: boolean         // 是否为默认分类
  createdAt: string
  updatedAt: string
}

// 数据库分类接口（数据库格式，使用 snake_case）
export interface DatabaseCategory {
  id: string
  name: string
  type: 'expense'
  color: string
  icon: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// 标签接口
export interface Tag {
  id: string
  name: string
  color: string              // 颜色（十六进制）
  usageCount: number         // 使用次数
  createdAt: string
  updatedAt: string
}

// 预设颜色
export const PRESET_COLORS = [
  '#ff6b6b', // 红色
  '#ee5a6f', // 玫红
  '#f06595', // 粉色
  '#cc5de8', // 紫色
  '#845ef7', // 深紫
  '#5c7cfa', // 蓝色
  '#339af0', // 天蓝
  '#22b8cf', // 青色
  '#20c997', // 绿松石
  '#51cf66', // 绿色
  '#94d82d', // 黄绿
  '#fcc419', // 黄色
  '#ff922b', // 橙色
  '#fd7e14', // 深橙
  '#f59f00', // 金色
  '#868e96'  // 灰色
]

// 预设图标（常用分类图标）
export const PRESET_ICONS = [
  // 餐饮相关
  { icon: 'utensils', label: '餐饮' },
  { icon: 'coffee', label: '咖啡' },
  { icon: 'pizza-slice', label: '快餐' },
  { icon: 'wine-glass', label: '酒水' },

  // 交通相关
  { icon: 'bus', label: '公交' },
  { icon: 'taxi', label: '出租车' },
  { icon: 'train', label: '火车' },
  { icon: 'plane', label: '飞机' },
  { icon: 'car', label: '汽车' },
  { icon: 'bicycle', label: '自行车' },

  // 购物相关
  { icon: 'shopping-cart', label: '购物' },
  { icon: 'shopping-bag', label: '购物袋' },
  { icon: 'gift', label: '礼物' },
  { icon: 'shirt', label: '服装' },

  // 娱乐相关
  { icon: 'film', label: '电影' },
  { icon: 'gamepad', label: '游戏' },
  { icon: 'music', label: '音乐' },
  { icon: 'book', label: '图书' },

  // 生活相关
  { icon: 'home', label: '家居' },
  { icon: 'bolt', label: '水电' },
  { icon: 'wifi', label: '网络' },
  { icon: 'mobile', label: '手机' },

  // 健康相关
  { icon: 'heartbeat', label: '医疗' },
  { icon: 'dumbbell', label: '健身' },
  { icon: 'prescription-bottle', label: '药品' },

  // 教育相关
  { icon: 'graduation-cap', label: '教育' },
  { icon: 'book-open', label: '学习' },

  // 工作相关
  { icon: 'briefcase', label: '工作' },
  { icon: 'laptop', label: '办公' },

  // 其他
  { icon: 'ellipsis-h', label: '其他' },
  { icon: 'heart', label: '爱心' },
  { icon: 'star', label: '星星' },
  { icon: 'flag', label: '标记' }
]
