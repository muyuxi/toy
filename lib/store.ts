import pool from './db';

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

// Products API
export const productsStore = {
  async getAll(filters?: { search?: string; category?: string; color?: string }) {
    const conn = await pool.getConnection();
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (filters?.search) {
        query += ' AND item_no LIKE ?';
        params.push(`%${filters.search}%`);
      }
      if (filters?.category && filters.category !== 'all') {
        query += ' AND category = ?';
        params.push(filters.category);
      }
      if (filters?.color && filters.color !== 'all') {
        query += ' AND colors LIKE ?';
        params.push(`%${filters.color}%`);
      }

      const [rows] = await conn.query(query, params);
      const products = rows as any[];

      for (const product of products) {
        const [images] = await conn.query('SELECT image_path, is_main, sort_order FROM product_images WHERE item_no = ? ORDER BY sort_order', [product.item_no]);
        product.images = images;
      }

      return products;
    } finally {
      conn.release();
    }
  },

  async getByItemNo(itemNo: string) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM products WHERE item_no = ?', [itemNo]);
      const products = rows as any[];
      if (products.length === 0) return null;

      const product = products[0];
      const [images] = await conn.query('SELECT image_path, is_main, sort_order FROM product_images WHERE item_no = ? ORDER BY sort_order', [itemNo]);
      product.images = images;

      return product;
    } finally {
      conn.release();
    }
  },

  async create(product: Omit<Product, 'id' | 'images'>) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        'INSERT INTO products (item_no, category, base_price, colors, options, features, gw, nw, dimensions, cbm, load_qty, is_banner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [product.item_no, product.category, product.base_price, product.colors, product.options, product.features, product.gw, product.nw, product.dimensions, product.cbm, product.load_qty, product.is_banner || false]
      );
      return { ...product, id: (result as any).insertId, images: [] };
    } finally {
      conn.release();
    }
  },

  async delete(itemNo: string) {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM product_images WHERE item_no = ?', [itemNo]);
      await conn.query('DELETE FROM products WHERE item_no = ?', [itemNo]);
    } finally {
      conn.release();
    }
  },

  async deleteAll() {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM product_images');
      await conn.query('DELETE FROM products');
    } finally {
      conn.release();
    }
  },

  async addImage(itemNo: string, image: ProductImage) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        'INSERT INTO product_images (item_no, image_path, is_main, sort_order) VALUES (?, ?, ?, ?)',
        [itemNo, image.image_path, image.is_main, image.sort_order]
      );
    } finally {
      conn.release();
    }
  },

  async deleteImage(itemNo: string, imagePath: string) {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM product_images WHERE item_no = ? AND image_path = ?', [itemNo, imagePath]);
    } finally {
      conn.release();
    }
  },

  async updateBanner(itemNo: string, isBanner: boolean) {
    const conn = await pool.getConnection();
    try {
      await conn.query('UPDATE products SET is_banner = ? WHERE item_no = ?', [isBanner, itemNo]);
    } finally {
      conn.release();
    }
  },

  async getCategories() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""');
      return (rows as any[]).map(r => r.category);
    } finally {
      conn.release();
    }
  },

  async getColors() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT DISTINCT colors FROM products WHERE colors IS NOT NULL AND colors != ""');
      const colors = new Set<string>();
      (rows as any[]).forEach(r => {
        r.colors.split(',').forEach((c: string) => colors.add(c.trim()));
      });
      return Array.from(colors);
    } finally {
      conn.release();
    }
  }
};

// Inquiries API
export const inquiriesStore = {
  async create(code: string, inquiryData: string) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        'INSERT INTO inquiries (code, data, created_at) VALUES (?, ?, NOW())',
        [code, inquiryData]
      );
      return { id: (result as any).insertId, code, data: inquiryData, created_at: new Date().toISOString() };
    } finally {
      conn.release();
    }
  },

  async getByCode(code: string) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM inquiries WHERE code = ?', [code]);
      const inquiries = rows as any[];
      return inquiries.length > 0 ? inquiries[0] : null;
    } finally {
      conn.release();
    }
  },

  async deleteAll() {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM inquiries');
    } finally {
      conn.release();
    }
  }
};

// FAQs API
export const faqsStore = {
  async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM faqs ORDER BY id');
      return rows as FAQ[];
    } finally {
      conn.release();
    }
  },

  async create(question: string, answer: string) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        'INSERT INTO faqs (question, answer) VALUES (?, ?)',
        [question, answer]
      );
      return { id: (result as any).insertId, question, answer };
    } finally {
      conn.release();
    }
  },

  async delete(id: number) {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM faqs WHERE id = ?', [id]);
    } finally {
      conn.release();
    }
  }
};
