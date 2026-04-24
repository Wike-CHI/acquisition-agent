/**
 * 孚盟MX CRM 选择器配置
 * 基于 2026-04-24 实际 DOM 分析
 * UI 框架: Element Plus (el-*)
 * 路由: SPA hash routing (/#/...)
 */

// ─── URLs ────────────────────────────────────────────
export const URLS = {
  LOGIN: 'https://fumamx.com/#/login',
  CUSTOMER_LIST: 'https://fumamx.com/#/main/newClient/NewBF001/list',
  CUSTOMER_DETAIL: (id: string) =>
    `https://fumamx.com/#/main/bill/NewBF001/detail/${id}`,
} as const

// ─── 通用选择器链 (fallback 优先级从高到低) ──────────
type SelectorChain = readonly string[]

// ─── 登录页 ──────────────────────────────────────────
export const LOGIN = {
  username: ['input[placeholder*="用户名"]'] as SelectorChain,
  password: ['input[placeholder*="登录密码"]'] as SelectorChain,
  submit: ['button:has-text("登录")'] as SelectorChain,
} as const

// ─── 侧边栏导航 ─────────────────────────────────────
export const SIDEBAR = {
  customerManagement: [
    '.sub-menu__item:has(.sub-menu__title:text("客户管理"))',
    '[class*="menu"]:has-text("客户管理")',
  ] as SelectorChain,
  publicCustomers: [
    '.sub-menu__item:has(.sub-menu__title:text("公海客户"))',
  ] as SelectorChain,
  customerContacts: [
    '.sub-menu__item:has(.sub-menu__title:text("客户联系人"))',
  ] as SelectorChain,
  customerFollowUp: [
    '.sub-menu__item:has(.sub-menu__title:text("客户跟进"))',
  ] as SelectorChain,
  quotations: [
    '.sub-menu__item:has(.sub-menu__title:text("报价单"))',
  ] as SelectorChain,
  salesOrders: [
    '.sub-menu__item:has(.sub-menu__title:text("销售订单"))',
  ] as SelectorChain,
} as const

// ─── 客户列表页 ──────────────────────────────────────
export const CUSTOMER_LIST = {
  searchInput: [
    'input[placeholder*="搜索联系人姓名"]',
    'input[placeholder*="搜索"]',
    'input[type="search"]',
    '.el-input__inner',
  ] as SelectorChain,

  searchButton: [
    'button:has-text("搜索")',
  ] as SelectorChain,

  advancedFilter: [
    'button:has-text("高级筛选")',
  ] as SelectorChain,

  newCustomer: [
    'button:has-text("新建")',
  ] as SelectorChain,

  importButton: [
    'button:has-text("导入")',
  ] as SelectorChain,

  customerSourceFilter: [
    'input[placeholder*="请选择"]', // 客户来源下拉
  ] as SelectorChain,

  pageSize: [
    'input[placeholder*="请选择"]', // 50 条/页
  ] as SelectorChain,

  // 客户行 (卡片式布局，非传统 table)
  customerRow: [
    '.row--title__name.canJump',     // 客户名称链接
    '[class*="customer-name"]',
    '[class*="client-name"]',
  ] as SelectorChain,

  customerCheckbox: [
    '.el-checkbox__input',
    'input[type="checkbox"]',
  ] as SelectorChain,

  // 列表页客户行中可提取的数据字段
  columns: {
    customerCode: '客户代码',
    customerName: '客户名称',
    contactPerson: '联系人',
    region: '地区/洲',
    contactInfo: '联系方式',
    source: '来源',
    dealStatus: '成交状态',
    createTime: '创建时间',
  },
} as const

// ─── 客户详情页 ──────────────────────────────────────
export const CUSTOMER_DETAIL = {
  // 操作按钮
  addFollowUp: [
    '[class*="cursor:pointer"]:has-text("新增跟进")',
  ] as SelectorChain,
  edit: [
    '[class*="cursor:pointer"]:has-text("修改")',
  ] as SelectorChain,
  moveToGroup: [
    '[class*="cursor:pointer"]:has-text("移动分组")',
  ] as SelectorChain,
  moveToTrash: [
    '[class*="cursor:pointer"]:has-text("放入回收站")',
  ] as SelectorChain,

  // 标签页
  tabs: {
    profile: ['主档'] as SelectorChain,
    activity: ['动态'] as SelectorChain,
    aiAnalysis: ['AI分析'] as SelectorChain,
    contacts: ['联系人'] as SelectorChain,
    emails: ['邮件往来'] as SelectorChain,
    chatHistory: ['聊天记录'] as SelectorChain,
    attachments: ['附件'] as SelectorChain,
    leads: ['客户线索'] as SelectorChain,
    quotations: ['报价单'] as SelectorChain,
    salesOrders: ['销售订单'] as SelectorChain,
    sharedCollab: ['共享协作'] as SelectorChain,
    behaviorTracking: ['行为跟踪'] as SelectorChain,
    operationLog: ['操作记录'] as SelectorChain,
    downstreamCustomers: ['下游客户'] as SelectorChain,
    upstreamCustomers: ['上游客户'] as SelectorChain,
    invoiceInfo: ['开票信息'] as SelectorChain,
  },

  // 主档页字段
  profile: {
    customerCode: '客户代码',
    customerName: '客户名称',
    shortName: '客户简称',
    latestProgress: '最新进度描述',
    country: '国家/地区',
    dataCompleteness: '资料完整度',
    valueLevel: '价值等级（S/A/B/C）',
    dealStage: '成交阶段',
    backgroundCheck: '背调描述',
    customerScore: '客户评分',
    customerNumber: '客户编号',
    region: '区域',
    address: '地址',
    website: '网址',
    mainContact: '主联系人和主联系方式',
    paymentCredit: '付款与信用（防踩雷）',
    businessDescription: '业务描述与产品线',
    customerSource: '客户来源',
    industry: '行业/应用场景',
    creditCode: '统一社会信用代码',
    customerType: '客户类型',
    branchAgent: '分公司 代理商描述',
    customsData: '海关数据背调',
    equipmentDemand: '设备需求背调',
    owner: '所属人',
    department: '所属部门',
    nextFollowUp: '下次跟进时间',
    publicSeaDeadline: '即将掉入公海',
    totalDealAmountUSD: '成交金额（USD）',
    totalDealAmountCNY: '成交金额（CNY）',
    contactCount: '联系人数',
    dealOrderCount: '成交订单数',
    firstDealTime: '初次成交时间',
    lastFollowUp: '最后跟进时间',
    createTime: '创建时间',
    modifyTime: '修改时间',
    creator: '创建人',
  },

  // 联系人标签页
  contacts: {
    addContact: [
      'button:has-text("新增联系人")',
    ] as SelectorChain,
    columns: [
      '姓名', 'WeChat昵称', '决策角色', '工作状态', '部门',
      '职位', '邮箱账号', '营销反馈', 'whatsapp', '手机',
      '电话', '标签', '亲密度', '生日', '性别',
      '性格类型', '宗教', '所属人', '最后跟进时间',
    ],
  },

  // 报价单标签页
  quotations: {
    addQuotation: [
      'button:has-text("添加")',
    ] as SelectorChain,
    columns: [
      '单据状态', '报价单编号', '报价主题', '客户邮箱',
      '报价金额', '结算币种', '价格条款', '报价日期',
      '业务员', '标签', '批注', '国家', '所属人',
      '所属部门', '创建时间',
    ],
  },
} as const

// ─── 新建客户表单 ────────────────────────────────────
export const NEW_CUSTOMER = {
  // 客户类型选择
  customerType: [
    'input[placeholder*="请选择"]', // "海外企业"
  ] as SelectorChain,

  // 公司搜索
  companySearch: [
    'input[placeholder*="输入公司名称/网址/邮箱查询"]',
  ] as SelectorChain,
  companySearchButton: [
    'button:has-text("搜索")',
  ] as SelectorChain,

  // 基本信息
  companyName: [
    'input[placeholder="抬头名称"]',
  ] as SelectorChain,
  creditCode: [
    'input[placeholder="统一信用代码"]',
  ] as SelectorChain,
  shortName: [
    'input[placeholder*="客户简称"]',
  ] as SelectorChain,
  country: [
    'input[placeholder="国家/地区"]',
  ] as SelectorChain,
  province: [
    'input[placeholder="省"]',
  ] as SelectorChain,
  city: [
    'input[placeholder="市"]',
  ] as SelectorChain,
  district: [
    'input[placeholder="区"]',
  ] as SelectorChain,
  address: [
    'input[placeholder*="客户详细地址"]',
  ] as SelectorChain,
  website: [] as SelectorChain, // 普通输入框，无 placeholder
  remark: [
    'input[placeholder*="备注信息"]',
  ] as SelectorChain,

  // 联系人信息
  addContact: [
    'button:has-text("新增联系人")',
  ] as SelectorChain,
  contactName: [] as SelectorChain,
  contactNickname: [] as SelectorChain,
  contactEmail: [
    'input[placeholder*="邮箱账号"]',
  ] as SelectorChain,
  contactPhone: [
    'input[placeholder*="手机"]',
  ] as SelectorChain,
  contactWhatsApp: [] as SelectorChain,
  contactWeChat: [] as SelectorChain,
  contactPhoneLandline: [] as SelectorChain,

  // 背调信息
  customsData: [
    'input[placeholder*="海关数据背调"]',
  ] as SelectorChain,
  backgroundCheck: [] as SelectorChain,

  // 其他字段
  owner: [] as SelectorChain, // 默认填入当前用户
  department: [] as SelectorChain, // 默认填入当前部门
} as const

// ─── DOM 检测选择器 (判断当前页面状态) ────────────────
export const PAGE_DETECTORS = {
  isLoginPage: [
    'input[placeholder*="用户名"]',
    'input[placeholder*="登录密码"]',
  ] as SelectorChain,
  isCustomerList: [
    'input[placeholder*="搜索联系人姓名"]',
    'button:has-text("新建")',
  ] as SelectorChain,
  isCustomerDetail: [
    '.row--title__name.canJump',
    '[class*="cursor:pointer"]:has-text("主档")',
  ] as SelectorChain,
} as const

// ─── CSS 类名约定 ────────────────────────────────────
export const CSS_CLASSES = {
  fieldLabel: '.field-label',
  fieldContent: '.field-content, .field-content__text',
  customerRow: '.row--title__name',
  cursorInteractive: '[class*="cursor:pointer"]',
  checkbox: '.el-checkbox__input',
  inputInner: '.el-input__inner',
  popover: '.el-popover',
} as const

// ─── 客户更新（详情页编辑） ──────────────────────────
export const CUSTOMER_UPDATE = {
  editButton: [
    '[class*="cursor:pointer"]:has-text("修改")',
    'button:has-text("编辑")',
  ] as SelectorChain,

  saveButton: [
    '.el-dialog__wrapper button:has-text("确定")',
    'button:has-text("保存")',
  ] as SelectorChain,

  cancelButton: [
    '.el-dialog__wrapper button:has-text("取消")',
  ] as SelectorChain,

  // 编辑弹窗内字段（与 NEW_CUSTOMER 复用，但作用域在详情弹窗内）
  remark: [
    'input[placeholder*="备注信息"]',
  ] as SelectorChain,
  customsData: [
    'input[placeholder*="海关数据背调"]',
  ] as SelectorChain,
  creditCode: [
    'input[placeholder="统一信用代码"]',
  ] as SelectorChain,
  shortName: [
    'input[placeholder*="客户简称"]',
  ] as SelectorChain,
  address: [
    'input[placeholder*="客户详细地址"]',
  ] as SelectorChain,
} as const

// ─── 培育流程 ────────────────────────────────────────
export const NURTURE = {
  addToNurture: [
    '[class*="cursor:pointer"]:has-text("添加到培育")',
    'button:has-text("培育")',
  ] as SelectorChain,

  nurtureTemplate: [
    '.el-select .el-input__inner',
    'input[placeholder*="请选择"]',
  ] as SelectorChain,

  confirmButton: [
    '.el-dialog__wrapper button:has-text("确定")',
    'button:has-text("确认")',
  ] as SelectorChain,

  // 培育记录标签页
  tab: [
    '[class*="cursor:pointer"]:has-text("培育记录")',
  ] as SelectorChain,

  // 培育状态检测
  statusActive: [
    '[class*="tag"]:has-text("培育中")',
    '[class*="status"]:has-text("培育中")',
  ] as SelectorChain,
} as const

// ─── 批量操作 ────────────────────────────────────────
export const BATCH = {
  importButton: [
    'button:has-text("导入")',
  ] as SelectorChain,

  selectAll: [
    '.el-checkbox__input',
  ] as SelectorChain,

  batchTag: [
    'button:has-text("批量标签")',
  ] as SelectorChain,

  batchEmail: [
    'button:has-text("发邮件")',
  ] as SelectorChain,

  batchMarketing: [
    'button:has-text("一键营销")',
  ] as SelectorChain,

  // 导入弹窗
  uploadInput: [
    'input[type="file"]',
  ] as SelectorChain,

  confirmImport: [
    '.el-dialog__wrapper button:has-text("确定")',
    'button:has-text("确认导入")',
  ] as SelectorChain,

  importProgress: [
    '.el-progress',
    '[class*="progress"]',
  ] as SelectorChain,
} as const

// ─── 等待时间配置 ────────────────────────────────────
export const WAIT_CONFIG = {
  /** SPA 路由切换后等待 network idle */
  ROUTE_CHANGE: 3000,
  /** 点击标签页后等待内容加载 */
  TAB_SWITCH: 2000,
  /** 搜索操作后等待结果 */
  SEARCH_RESULT: 3000,
  /** 弹窗出现等待 */
  DIALOG_OPEN: 1500,
  /** 默认元素等待超时 */
  ELEMENT_TIMEOUT: 10000,
  /** 逐字符输入随机间隔范围 (ms) */
  TYPING_DELAY_MIN: 50,
  TYPING_DELAY_MAX: 150,
} as const
