#!/usr/bin/env node
/**
 * generate-pi.js — Proforma Invoice Generator (红龙工业设备专用)
 *
 * 从产品目录和订单详情生成结构化形式发票 (PI)。
 * 用法: node generate-pi.js --buyer "Company" --products "a2flj600:2,c2dcj1000:1" --terms "FOB Shanghai"
 *
 * 基于 b2b-sdr-agent-template/product-kb/scripts/generate-pi.js 改造，
 * 适配红龙工业设备的产品编码体系和外贸报价流程。
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, '..', 'catalog.json');

// 红龙公司信息
const SELLER = {
  company: 'Wenzhou Honglong Industrial Equipment Manufacturing Co., Ltd.',
  company_zh: '温州红龙工业设备制造有限公司',
  address: 'Wenzhou, Zhejiang, China',
  contact: 'sales@honglongbelting.com',
  bank_info: '(Provided upon order confirmation)',
};

function loadCatalog() {
  const raw = readFileSync(CATALOG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function findProduct(catalog, productId) {
  for (const category of catalog.categories) {
    const product = category.products.find(p => p.id === productId);
    if (product) {
      return {
        ...product,
        category_name: category.name,
        category_name_en: category.name_en,
      };
    }
  }
  return null;
}

function generatePIOptions({ buyer, items, terms, currency = 'USD', validDays = 15, notes = [] }) {
  const catalog = loadCatalog();
  const today = new Date().toISOString().split('T')[0];
  const piNumber = `HL-PI-${Date.now().toString(36).toUpperCase()}`;

  const lineItems = items.map(({ productId, quantity }, index) => {
    const product = findProduct(catalog, productId);
    if (!product) {
      return { error: `Product not found: ${productId}`, no: index + 1 };
    }

    return {
      no: index + 1,
      product_code: product.code,
      product: product.name,
      model: product.model,
      category: product.category_name_en,
      description: product.description,
      quantity,
      unit: 'SET',
      unit_price: '(To be quoted)',
      total: '(To be quoted)',
      lead_time: `${product.lead_time_days} days`,
      certifications: product.certifications,
    };
  });

  // 查找是否有错误项
  const errors = lineItems.filter(i => i.error);
  if (errors.length > 0) {
    console.error('❌ 以下产品未找到:');
    errors.forEach(e => console.error(`   #${e.no}: ${e.error}`));
    console.error('\n可用的产品 ID:');
    catalog.categories.forEach(cat => {
      console.error(`  [${cat.name}]`);
      cat.products.forEach(p => {
        console.error(`    ${p.id} — ${p.name} (${p.model})`);
      });
    });
    process.exit(1);
  }

  const maxLeadTime = Math.max(...items.map(i => {
    const p = findProduct(catalog, i.productId);
    return p ? p.lead_time_days : 30;
  }));

  const pi = {
    document: 'PROFORMA INVOICE',
    pi_number: piNumber,
    date: today,
    valid_until: new Date(Date.now() + validDays * 86400000).toISOString().split('T')[0],
    seller: {
      ...SELLER,
    },
    buyer: {
      company: buyer,
      address: '(To be filled)',
      contact: '(To be filled)',
      country: '(To be filled)',
    },
    currency,
    items: lineItems,
    terms: {
      trade: terms,
      payment: catalog.payment_terms?.[0] || 'T/T 30% deposit + 70% before shipment',
      shipping: `${maxLeadTime} days after deposit confirmation`,
      port_of_loading: terms.includes('FOB') ? terms.replace('FOB ', '') : 'Ningbo/Shanghai',
    },
    notes: [
      'All prices are subject to confirmation at time of order.',
      'Custom voltage/frequency/color requirements may affect lead time and pricing.',
      'Bank details will be provided upon order confirmation.',
      `This PI is valid for ${validDays} days from the date of issue.`,
      ...notes,
    ],
    metadata: {
      catalog_version: catalog.version,
      catalog_updated: catalog.last_updated,
    },
  };

  return pi;
}

// CLI
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : null;
}

function showHelp() {
  console.log(`
红龙 PI 生成器 — Proforma Invoice Generator

用法: node generate-pi.js [options]

选项:
  --buyer <公司名>        买方公司名称（必填）
  --products <产品列表>   产品ID和数量，格式: id:数量,id:数量（必填）
  --terms <贸易条款>      贸易条款，默认 FOB Shanghai（可选）
  --currency <币种>       币种，默认 USD（可选）
  --valid-days <天数>     PI 有效期天数，默认 15（可选）
  --output <文件路径>     输出 JSON 文件路径（可选，默认输出到 stdout）
  --list-products         列出所有可用产品
  --help                  显示此帮助信息

示例:
  node generate-pi.js --buyer "ABC Industries" --products "a2flj600:2,c2dcj1000:1" --terms "FOB Ningbo"
  node generate-pi.js --buyer "XYZ Corp" --products "a1dcj1000:1,a1gkj600:3" --output "./pi-xyz.json"
  `);
}

if (args.includes('--help')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--list-products')) {
  const catalog = loadCatalog();
  console.log('红龙工业设备 — 产品目录\n');
  catalog.categories.forEach(cat => {
    console.log(`## ${cat.name} (${cat.name_en})`);
    cat.products.forEach(p => {
      console.log(`  ${p.id} — ${p.name} [${p.model}] — 交期: ${p.lead_time_days}天`);
    });
    console.log('');
  });
  process.exit(0);
}

const buyer = getArg('buyer');
const productsStr = getArg('products');
const terms = getArg('terms') || 'FOB Shanghai';
const currency = getArg('currency') || 'USD';
const validDays = parseInt(getArg('valid-days') || '15');

if (!buyer || !productsStr) {
  console.error('❌ --buyer 和 --products 为必填参数。使用 --help 查看完整用法。');
  process.exit(1);
}

const items = productsStr.split(',').map(p => {
  const parts = p.split(':');
  return { productId: parts[0].trim(), quantity: parseInt(parts[1]) || 1 };
});

const pi = generatePIOptions({ buyer, items, terms, currency, validDays });
const output = JSON.stringify(pi, null, 2);
console.log(output);

const outFile = getArg('output');
if (outFile) {
  writeFileSync(outFile, output, 'utf-8');
  console.error(`\n✅ PI 已保存到: ${outFile}`);
}
