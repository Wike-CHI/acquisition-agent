/**
 * 报价单生成器
 * 使用 docx 技能自动生成专业报价单
 */

class QuotationGenerator {
  constructor() {
    // 公司固定信息（对外统一）
    // 业务员联系方式（手机/邮箱）由调用方传入，不在此硬编码
    this.companyInfo = {
      name: '温州红龙工业设备制造有限公司',
      brand: 'HOLO',
      address: '浙江省瑞安市东山街道望新路188号3幢101室',
      phone: '+86 577-66856856',   // 公司座机（用于正式报价单/合同）
      website: 'www.holobelt.com'
      // mobile / email: 由业务员在调用时传入，请勿在此硬编码
    };
  }

  /**
   * 生成报价单
   * @param {Object} quotationData - 报价数据
   * @returns {string} - 生成的报价单文件路径
   */
  generate(quotationData) {
    const {
      customerName,
      customerCompany,
      customerCountry,
      customerEmail,
      products,
      validityDays = 30,
      paymentTerms = '30% T/T 定金，70% T/T 发货前付清',
      deliveryTime = '15-20 个工作日',
      warranty = '1 年质保'
    } = quotationData;

    // 计算总价
    const totalAmount = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    // 生成报价单文档
    const document = this.createDocument({
      customerName,
      customerCompany,
      customerCountry,
      customerEmail,
      products,
      totalAmount,
      validityDays,
      paymentTerms,
      deliveryTime,
      warranty
    });

    return document;
  }

  /**
   * 创建报价单文档结构
   */
  createDocument(data) {
    const doc = {
      sections: [
        {
          type: 'header',
          content: `报价单 | ${this.companyInfo.brand}`
        },
        {
          type: 'title',
          content: `Quotation - ${data.products[0]?.category || 'Industrial Equipment'}`
        },
        {
          type: 'metadata',
          content: {
            '报价单号': `QT-${Date.now()}`,
            '日期': new Date().toISOString().split('T')[0],
            '有效期': `${data.validityDays} 天`
          }
        },
        {
          type: 'customer-info',
          content: {
            '客户名称': data.customerName,
            '公司': data.customerCompany,
            '国家': data.customerCountry,
            '邮箱': data.customerEmail
          }
        },
        {
          type: 'products-table',
          headers: ['序号', '产品名称', '规格型号', '数量', '单价 (USD)', '总价 (USD)'],
          rows: data.products.map((p, idx) => [
            idx + 1,
            p.name,
            p.spec,
            p.quantity,
            `$${p.price.toLocaleString()}`,
            `$${(p.price * p.quantity).toLocaleString()}`
          ])
        },
        {
          type: 'total',
          content: `总计 (Total): $${data.totalAmount.toLocaleString()}`
        },
        {
          type: 'terms',
          title: '付款条款 (Payment Terms)',
          items: [
            `付款方式: ${data.paymentTerms}`,
            `交货期: ${data.deliveryTime}`,
            `质保期: ${data.warranty}`,
            `贸易术语: FOB Shanghai / CIF Destination Port`
          ]
        },
        {
          type: 'company-info',
          content: this.companyInfo
        },
        {
          type: 'footer',
          content: '此报价仅供参考，最终价格以合同为准。'
        }
      ]
    };

    return doc;
  }

  /**
   * 从产品库获取产品信息
   */
  getProductInfo(productCode) {
    const products = {
      'A2FRJ-1200': {
        name: '风冷皮带接头机',
        nameEn: 'Air Cooled Press',
        spec: 'A2FRJ-1200',
        category: 'Air Cooled Press',
        price: 8500,
        description: '温度范围 0-200°C，适用皮带宽度 300-1200mm'
      },
      'A2FRJ-1600': {
        name: '风冷皮带接头机',
        nameEn: 'Air Cooled Press',
        spec: 'A2FRJ-1600',
        category: 'Air Cooled Press',
        price: 12000,
        description: '温度范围 0-200°C，适用皮带宽度 300-1600mm'
      },
      'W2FRJ-1200': {
        name: '水冷皮带接头机',
        nameEn: 'Water Cooled Press',
        spec: 'W2FRJ-1200',
        category: 'Water Cooled Press',
        price: 9500,
        description: '水冷系统，温度更稳定'
      },
      'A1-800': {
        name: '分层机',
        nameEn: 'Ply Separator',
        spec: 'A1-800',
        category: 'Ply Separator',
        price: 3200,
        description: '适用皮带宽度 800mm'
      },
      'C2-H1': {
        name: '打齿机',
        nameEn: 'Finger Puncher',
        spec: 'C2-H1',
        category: 'Finger Puncher',
        price: 2800,
        description: '气动打齿，高效精准'
      }
    };

    return products[productCode];
  }

  /**
   * 生成 Python 代码（用于实际创建 .docx 文件）
   */
  generatePythonCode(quotationData) {
    const { customerName, customerCompany, customerCountry, products, totalAmount, validityDays, paymentTerms, deliveryTime, warranty } = quotationData;

    return `
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

# 创建文档
doc = Document()

# 标题
title = doc.add_heading('报价单 | Quotation', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# 报价单信息
doc.add_paragraph(f'报价单号: QT-{int(time.time())}')
doc.add_paragraph(f'日期: {new Date().toISOString().split('T')[0]}')
doc.add_paragraph(f'有效期: {validityDays} 天')

# 客户信息
doc.add_heading('客户信息', level=1)
doc.add_paragraph(f'客户名称: ${customerName}')
doc.add_paragraph(f'公司: ${customerCompany}')
doc.add_paragraph(f'国家: ${customerCountry}')

# 产品表格
doc.add_heading('产品清单', level=1)
table = doc.add_table(rows=${products.length + 1}, cols=6)
table.style = 'Table Grid'

# 表头
headers = ['序号', '产品名称', '规格型号', '数量', '单价 (USD)', '总价 (USD)']
for i, header in enumerate(headers):
    cell = table.cell(0, i)
    cell.text = header
    cell.paragraphs[0].runs[0].font.bold = True

# 产品数据
${products.map((p, idx) => `
table.cell(${idx + 1}, 0).text = '${idx + 1}'
table.cell(${idx + 1}, 1).text = '${p.name}'
table.cell(${idx + 1}, 2).text = '${p.spec}'
table.cell(${idx + 1}, 3).text = '${p.quantity}'
table.cell(${idx + 1}, 4).text = '$${p.price.toLocaleString()}'
table.cell(${idx + 1}, 5).text = '$${(p.price * p.quantity).toLocaleString()}'
`).join('')}

# 总价
doc.add_paragraph('')
total_para = doc.add_paragraph()
total_para.add_run('总计 (Total): $$${totalAmount.toLocaleString()}').bold = True

# 付款条款
doc.add_heading('付款条款', level=1)
doc.add_paragraph('• 付款方式: ${paymentTerms}')
doc.add_paragraph('• 交货期: ${deliveryTime}')
doc.add_paragraph('• 质保期: ${warranty}')
doc.add_paragraph('• 贸易术语: FOB Shanghai / CIF Destination Port')

# 公司信息
doc.add_heading('供应商信息', level=1)
doc.add_paragraph('温州红龙工业设备制造有限公司 (HOLO)')
doc.add_paragraph('地址: 浙江省瑞安市东山街道望新路188号3幢101室')
doc.add_paragraph('电话: +86 577-66856856')
doc.add_paragraph(f'业务员: {salesperson_name}')
doc.add_paragraph(f'手机/WhatsApp: {salesperson_mobile}')
doc.add_paragraph(f'邮箱: {salesperson_email}')

# 保存
output_path = 'quotations/quotation-${customerCompany.replace(/[^a-zA-Z0-9]/g, '_')}.docx'
os.makedirs('quotations', exist_ok=True)
doc.save(output_path)
print(f'✅ 报价单已生成: {output_path}')
`;
  }
}

module.exports = QuotationGenerator;
