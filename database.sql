-- 产品表
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_no VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100),
  base_price DECIMAL(10, 2) NOT NULL,
  colors TEXT,
  options TEXT,
  features TEXT,
  gw VARCHAR(50),
  nw VARCHAR(50),
  dimensions VARCHAR(100),
  cbm VARCHAR(50),
  load_qty VARCHAR(50),
  is_banner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 产品图片表
CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_no VARCHAR(100) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  is_main TINYINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_no) REFERENCES products(item_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 询价单表
CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 常见问题表
CREATE TABLE faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引
CREATE INDEX idx_item_no ON product_images(item_no);
CREATE INDEX idx_code ON inquiries(code);
