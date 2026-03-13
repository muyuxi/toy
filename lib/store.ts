import fs from 'fs';
import path from 'path';

// 确保数据文件在项目根目录的 public 文件夹中，这样在 Hostinger 上也能访问
const DATA_FILE = path.join(process.cwd(), 'public', 'data.json');

interface ProductImage {
  image_path: string;
  is_main: number;
  sort_order: number;
}

interface Product {
  id: number;
  item_no: string;
  category: string;
  base_price: number;
  colors: string;
  options: string;
  features: string;
  gw: string;
  nw: string;
  dimensions: string;
  cbm: string;
  load_qty: string;
  images: ProductImage[];
  is_banner?: boolean;
}

interface Inquiry {
  id: number;
  code: string;
  data: string;
  created_at: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface DataStore {
  products: Product[];
  inquiries: Inquiry[];
  faqs: FAQ[];
  nextProductId: number;
  nextInquiryId: number;
  nextFaqId: number;
}

// 初始化数据文件
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData: DataStore = {
      products: [],
      inquiries: [],
      faqs: [],
      nextProductId: 1,
      nextInquiryId: 1,
      nextFaqId: 1
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 读取数据
function readData(): DataStore {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// 写入数据
function writeData(data: DataStore) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Products API
export const productsStore = {
  // 获取所有产品
  getAll(filters?: { search?: string; category?: string; color?: string }) {
    const data = readData();
    let products = data.products;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p =>
        p.item_no.toLowerCase().includes(search)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters?.color && filters.color !== 'all') {
      const color = filters.color;
      products = products.filter(p =>
        p.colors.toLowerCase().includes(color.toLowerCase())
      );
    }

    return products;
  },

  // 根据 item_no 获取产品
  getByItemNo(itemNo: string) {
    const data = readData();
    return data.products.find(p => p.item_no === itemNo);
  },

  // 创建产品
  create(product: Omit<Product, 'id' | 'images'>) {
    const data = readData();
    const newProduct: Product = {
      ...product,
      id: data.nextProductId++,
      images: []
    };
    data.products.push(newProduct);
    writeData(data);
    return newProduct;
  },

  // 删除产品
  delete(itemNo: string) {
    const data = readData();
    data.products = data.products.filter(p => p.item_no !== itemNo);
    writeData(data);
  },

  // 清空所有产品
  deleteAll() {
    const data = readData();
    data.products = [];
    data.nextProductId = 1;
    writeData(data);
  },

  // 添加产品图片
  addImage(itemNo: string, image: ProductImage) {
    const data = readData();
    const product = data.products.find(p => p.item_no === itemNo);
    if (product) {
      product.images.push(image);
      writeData(data);
    }
  },

  // 删除产品图片
  deleteImage(itemNo: string, imagePath: string) {
    const data = readData();
    const product = data.products.find(p => p.item_no === itemNo);
    if (product) {
      product.images = product.images.filter(img => img.image_path !== imagePath);
      writeData(data);
    }
  },

  // 设置轮播
  updateBanner(itemNo: string, isBanner: boolean) {
    const data = readData();
    const product = data.products.find(p => p.item_no === itemNo);
    if (product) {
      product.is_banner = isBanner;
      writeData(data);
    }
  },

  // 获取所有分类
  getCategories() {
    const data = readData();
    const categories = new Set(data.products.map(p => p.category).filter(Boolean));
    return Array.from(categories);
  },

  // 获取所有颜色
  getColors() {
    const data = readData();
    const colors = new Set<string>();
    data.products.forEach(p => {
      if (p.colors) {
        p.colors.split(',').forEach(color => {
          colors.add(color.trim());
        });
      }
    });
    return Array.from(colors);
  }
};

// Inquiries API
export const inquiriesStore = {
  // 创建询价
  create(code: string, inquiryData: string) {
    const data = readData();
    const newInquiry: Inquiry = {
      id: data.nextInquiryId++,
      code,
      data: inquiryData,
      created_at: new Date().toISOString()
    };
    data.inquiries.push(newInquiry);
    writeData(data);
    return newInquiry;
  },

  // 根据 code 获取询价
  getByCode(code: string) {
    const data = readData();
    return data.inquiries.find(i => i.code === code);
  },

  // 清空所有询价
  deleteAll() {
    const data = readData();
    data.inquiries = [];
    data.nextInquiryId = 1;
    writeData(data);
  }
};

// FAQs API
export const faqsStore = {
  getAll() {
    const data = readData();
    return data.faqs || [];
  },

  create(question: string, answer: string) {
    const data = readData();
    if (!data.faqs) data.faqs = [];
    if (!data.nextFaqId) data.nextFaqId = 1;
    const newFaq: FAQ = {
      id: data.nextFaqId++,
      question,
      answer
    };
    data.faqs.push(newFaq);
    writeData(data);
    return newFaq;
  },

  delete(id: number) {
    const data = readData();
    if (data.faqs) {
      data.faqs = data.faqs.filter(f => f.id !== id);
      writeData(data);
    }
  }
};
