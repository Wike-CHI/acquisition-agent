/**
 * 测试数据fixtures
 * 用于单元测试和集成测试
 */

export const sampleCustomers = [
  {
    id: 'CUST001',
    companyName: 'ABC Industrial Belts Ltd',
    contactPerson: 'John Smith',
    email: 'john.smith@abcindustrial.com',
    phone: '+1-555-0101',
    country: 'US',
    industry: 'Conveyor Belt Distribution',
    source: 'LinkedIn',
    stage: 'discovery',
    icpScore: 75,
    interests: ['Air Cooled Press', 'Ply Separator'],
    lastContact: '2026-04-01',
    nextAction: 'Send quotation'
  },
  {
    id: 'CUST002',
    companyName: 'European Belt Solutions',
    contactPerson: 'Hans Mueller',
    email: 'h.mueller@europebelt.de',
    phone: '+49-30-1234567',
    country: 'DE',
    industry: 'Belt Fabrication',
    source: 'Exa Search',
    stage: 'qualifying',
    icpScore: 82,
    interests: ['Finger Puncher', 'Belt Cutting Machine'],
    lastContact: '2026-03-28',
    nextAction: 'Follow up call'
  }
];

export const sampleProducts = [
  {
    code: 'PA-III-1200',
    name: '三代风冷1200',
    category: '风冷皮带接头机',
    effectiveLength: '1200mm',
    effectiveWidth: '150mm',
    maxTemperature: '200°C',
    power: '1.2KW'
  },
  {
    code: 'A1FCJ130',
    name: '欧式分层机',
    category: '输送带分层机',
    maxBeltWidth: '1300mm',
    precision: '≤0.05mm',
    power: '2.2KW'
  }
];

export const sampleEmails = {
  good: {
    subject: 'Conveyor Belt Splicing Solution for ABC Industrial',
    content: `Hi John,

I noticed ABC Industrial has been sourcing PU timing belts for your manufacturing clients.

With over 20 years in conveyor belt fabrication equipment, HOLO's air-cooled presses might be exactly what your clients need - 200°C in 3.5 minutes, suitable for both PU and PVC belts.

Would you be open to a 15-minute call this Thursday to discuss how we can support your equipment lineup?

Best regards,
{{SALESPERSON_NAME}}
AI Sales | HOLO Industrial
{{SALESPERSON_PHONE}} | {{SALESPERSON_EMAIL}}`,
    score: 9.2
  },
  bad: {
    subject: 'Partnership Opportunity',
    content: `Dear Sir/Madam,

In today's rapidly evolving landscape, our cutting-edge solutions represent a game-changer for industrial applications.

We offer state-of-the-art technology that leverages innovative approaches to deliver best-in-class results.

Please feel free to contact us if you need anything.

Best regards,
Sales Team`,
    score: 4.5
  }
};

export const sampleQuotation = {
  quotationNumber: 'QT-2026-0401',
  customerName: 'ABC Industrial Belts Ltd',
  contactPerson: 'John Smith',
  date: '2026-04-01',
  validUntil: '2026-12-31',
  products: [
    {
      code: 'PA-III-1200',
      name: '三代风冷1200',
      quantity: 2,
      unitPrice: 5000,
      totalPrice: 10000
    }
  ],
  subtotal: 10000,
  discountRate: 0,
  discountAmount: 0,
  total: 10000,
  paymentTerms: '30% deposit, 70% before shipment',
  deliveryTime: '30-45 days',
  companyInfo: {
    name: '温州红龙工业设备制造有限公司',
    address: '浙江省瑞安市东山街道望新路188号3幢101室',
    phone: '+86 577-66856856',
    email: 'info@holobelt.com'
  }
};
