/**
 * 客户管理表格生成器
 * 使用 xlsx 技能管理客户数据
 */

class CustomerManager {
  constructor() {
    this.headers = [
      '公司名',
      '国家',
      '联系人',
      '邮箱',
      '电话',
      '行业',
      'ICP评分',
      '客户等级',
      '状态',
      '产品兴趣',
      '预计采购额',
      '最后联系',
      '下次跟进',
      '备注'
    ];
  }

  /**
   * 生成客户列表
   */
  generateCustomerList(customers) {
    const workbook = {
      sheets: [
        {
          name: '客户列表',
          data: [
            this.headers,
            ...customers.map(c => this.customerToRow(c))
          ]
        }
      ]
    };

    return workbook;
  }

  /**
   * 客户数据转行
   */
  customerToRow(customer) {
    return [
      customer.companyName || '',
      customer.country || '',
      customer.contactName || '',
      customer.email || '',
      customer.phone || '',
      customer.industry || '',
      customer.icpScore || 0,
      this.getCustomerGrade(customer.icpScore),
      customer.status || 'new',
      customer.productInterest || '',
      customer.estimatedPurchase || '',
      customer.lastContact || '',
      customer.nextFollowUp || '',
      customer.notes || ''
    ];
  }

  /**
   * 获取客户等级
   */
  getCustomerGrade(icpScore) {
    if (icpScore >= 80) return 'A级';
    if (icpScore >= 60) return 'B级';
    if (icpScore >= 40) return 'C级';
    return 'D级';
  }

  /**
   * 生成 Pipeline 报表
   */
  generatePipelineReport(customers) {
    const statusGroups = this.groupByStatus(customers);
    const gradeGroups = this.groupByGrade(customers);

    const report = {
      sheets: [
        {
          name: 'Pipeline 概览',
          data: [
            ['状态', '客户数', '预计金额 (USD)'],
            ['新线索', statusGroups.new?.length || 0, this.sumEstimatedPurchase(statusGroups.new)],
            ['已联系', statusGroups.contacted?.length || 0, this.sumEstimatedPurchase(statusGroups.contacted)],
            ['有意向', statusGroups.interested?.length || 0, this.sumEstimatedPurchase(statusGroups.interested)],
            ['已报价', statusGroups.quoted?.length || 0, this.sumEstimatedPurchase(statusGroups.quoted)],
            ['谈判中', statusGroups.negotiating?.length || 0, this.sumEstimatedPurchase(statusGroups.negotiating)],
            ['已成交', statusGroups.closed_won?.length || 0, this.sumEstimatedPurchase(statusGroups.closed_won)],
            ['已流失', statusGroups.closed_lost?.length || 0, this.sumEstimatedPurchase(statusGroups.closed_lost)]
          ]
        },
        {
          name: '按等级分布',
          data: [
            ['等级', '客户数', '预计金额 (USD)', '占比'],
            ['A级 (≥80)', gradeGroups.A?.length || 0, this.sumEstimatedPurchase(gradeGroups.A), this.calculatePercentage(gradeGroups.A, customers)],
            ['B级 (60-79)', gradeGroups.B?.length || 0, this.sumEstimatedPurchase(gradeGroups.B), this.calculatePercentage(gradeGroups.B, customers)],
            ['C级 (40-59)', gradeGroups.C?.length || 0, this.sumEstimatedPurchase(gradeGroups.C), this.calculatePercentage(gradeGroups.C, customers)],
            ['D级 (<40)', gradeGroups.D?.length || 0, this.sumEstimatedPurchase(gradeGroups.D), this.calculatePercentage(gradeGroups.D, customers)]
          ]
        },
        {
          name: '待跟进客户',
          data: [
            ['公司名', '国家', 'ICP评分', '状态', '最后联系', '下次跟进'],
            ...customers
              .filter(c => c.nextFollowUp && new Date(c.nextFollowUp) <= new Date())
              .map(c => [
                c.companyName,
                c.country,
                c.icpScore,
                c.status,
                c.lastContact,
                c.nextFollowUp
              ])
          ]
        }
      ]
    };

    return report;
  }

  /**
   * 按状态分组
   */
  groupByStatus(customers) {
    return customers.reduce((groups, c) => {
      const status = c.status || 'new';
      if (!groups[status]) groups[status] = [];
      groups[status].push(c);
      return groups;
    }, {});
  }

  /**
   * 按等级分组
   */
  groupByGrade(customers) {
    return customers.reduce((groups, c) => {
      const grade = this.getCustomerGrade(c.icpScore).charAt(0);
      if (!groups[grade]) groups[grade] = [];
      groups[grade].push(c);
      return groups;
    }, {});
  }

  /**
   * 计算预计采购总额
   */
  sumEstimatedPurchase(customers) {
    if (!customers || customers.length === 0) return 0;
    return customers.reduce((sum, c) => {
      const amount = parseFloat(c.estimatedPurchase?.replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);
  }

  /**
   * 计算百分比
   */
  calculatePercentage(group, total) {
    if (!group || group.length === 0) return '0%';
    const percentage = (group.length / total.length * 100).toFixed(1);
    return `${percentage}%`;
  }

  /**
   * 生成 Python 代码（用于实际创建 .xlsx 文件）
   */
  generatePythonCode(customers) {
    return `
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter
import os

# 创建工作簿
wb = openpyxl.Workbook()

# ========== 客户列表 ==========
ws1 = wb.active
ws1.title = "客户列表"

# 表头样式
header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
header_font = Font(color="FFFFFF", bold=True)

# 添加表头
headers = ${JSON.stringify(this.headers)}
for col, header in enumerate(headers, 1):
    cell = ws1.cell(row=1, column=col, value=header)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center')

# 添加数据
${customers.map((c, idx) => `
ws1.append(${JSON.stringify(this.customerToRow(c))})`).join('')}

# 调整列宽
for col in range(1, len(headers) + 1):
    ws1.column_dimensions[get_column_letter(col)].width = 15

# ========== Pipeline 概览 ==========
ws2 = wb.create_sheet("Pipeline 概览")

pipeline_data = [
    ['状态', '客户数', '预计金额 (USD)'],
    ['新线索', ${this.groupByStatus(customers).new?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).new)}],
    ['已联系', ${this.groupByStatus(customers).contacted?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).contacted)}],
    ['有意向', ${this.groupByStatus(customers).interested?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).interested)}],
    ['已报价', ${this.groupByStatus(customers).quoted?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).quoted)}],
    ['谈判中', ${this.groupByStatus(customers).negotiating?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).negotiating)}],
    ['已成交', ${this.groupByStatus(customers).closed_won?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).closed_won)}],
    ['已流失', ${this.groupByStatus(customers).closed_lost?.length || 0}, ${this.sumEstimatedPurchase(this.groupByStatus(customers).closed_lost)}]
]

for row in pipeline_data:
    ws2.append(row)

# 格式化
for col in range(1, 4):
    ws2.cell(row=1, column=col).font = Font(bold=True)

# ========== 待跟进客户 ==========
ws3 = wb.create_sheet("待跟进")

follow_up_headers = ['公司名', '国家', 'ICP评分', '状态', '最后联系', '下次跟进']
for col, header in enumerate(follow_up_headers, 1):
    cell = ws3.cell(row=1, column=col, value=header)
    cell.font = Font(bold=True)

# 保存
output_path = 'customer-data/customer-list-${new Date().toISOString().split('T')[0]}.xlsx'
os.makedirs('customer-data', exist_ok=True)
wb.save(output_path)
print(f'✅ 客户列表已生成: {output_path}')
`;
  }
}

module.exports = CustomerManager;
