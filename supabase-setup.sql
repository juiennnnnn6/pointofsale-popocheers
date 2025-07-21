-- Supabase 進銷存系統資料庫設定腳本
-- 請在 Supabase 控制台的 SQL Editor 中執行此腳本

-- 1. 創建商品表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    category_id INTEGER,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    unit VARCHAR(50),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 創建分類表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 創建會員表
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    birthday DATE,
    points INTEGER DEFAULT 0,
    level VARCHAR(50) DEFAULT '一般會員',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 創建員工表
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 創建銷售記錄表
CREATE TABLE IF NOT EXISTS sales_history (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER,
    employee_id INTEGER,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. 創建優惠券表
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. 創建供應商表
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. 啟用 RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- 9. 創建允許匿名讀寫的策略
-- 商品表策略
CREATE POLICY "Allow anonymous read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON products FOR DELETE USING (true);

-- 分類表策略
CREATE POLICY "Allow anonymous read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON categories FOR DELETE USING (true);

-- 會員表策略
CREATE POLICY "Allow anonymous read" ON members FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON members FOR DELETE USING (true);

-- 員工表策略
CREATE POLICY "Allow anonymous read" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON employees FOR DELETE USING (true);

-- 銷售記錄表策略
CREATE POLICY "Allow anonymous read" ON sales_history FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON sales_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON sales_history FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON sales_history FOR DELETE USING (true);

-- 優惠券表策略
CREATE POLICY "Allow anonymous read" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON coupons FOR DELETE USING (true);

-- 供應商表策略
CREATE POLICY "Allow anonymous read" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON suppliers FOR DELETE USING (true);

-- 10. 插入預設資料（可選）
-- 插入預設分類
INSERT INTO categories (name, description) VALUES 
('餐具', '各種餐具用品'),
('裝飾品', '家居裝飾用品'),
('廚房用品', '廚房相關用品'),
('其他', '其他商品分類');

-- 插入預設員工（測試用）
INSERT INTO employees (name, username, password, role, phone, email) VALUES 
('陳管理員', 'E004', 'admin123', '管理員', '0912-345-678', 'admin@example.com'),
('李美華', 'E002', 'manager123', '店長', '0987-654-321', 'manager@example.com'),
('王小明', 'E001', 'cashier123', '收銀員', '0955-123-456', 'cashier@example.com'),
('張志偉', 'E003', 'warehouse123', '倉管', '0933-789-012', 'warehouse@example.com');

-- 插入預設會員（測試用）
INSERT INTO members (name, phone, email, points, level) VALUES 
('王小明', '0912-345-678', 'wang@example.com', 2850, '金卡'),
('李美華', '0987-654-321', 'li@example.com', 5420, '白金');

-- 插入預設商品（測試用）
INSERT INTO products (name, barcode, category_id, price, cost, stock, min_stock, description, image_url) VALUES 
('歐式骨瓷餐盤', '1234567890123', 1, 890, 600, 15, 5, '純白骨瓷，經典歐式設計', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center'),
('施華洛世奇水晶酒杯', '2345678901234', 1, 1280, 900, 8, 3, '高品質水晶酒杯', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2a1?w=200&h=200&fit=crop&crop=center'),
('歐式花瓶', '3456789012345', 2, 650, 450, 12, 4, '精緻歐式花瓶', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center');

-- 插入預設優惠券（測試用）
INSERT INTO coupons (code, name, type, value, min_amount, start_date, end_date, usage_limit) VALUES 
('WELCOME10', '新會員優惠券', 'percentage', 10, 1000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100),
('SAVE50', '滿額折價券', 'fixed', 50, 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 50);

-- 插入預設供應商（測試用）
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES 
('歐洲瓷器供應商', '張經理', '02-2345-6789', 'contact@european-porcelain.com', '台北市信義區信義路五段7號'),
('水晶製品公司', '李小姐', '02-3456-7890', 'info@crystal-company.com', '台北市大安區忠孝東路四段1號');

-- 完成訊息
SELECT 'Supabase 資料庫設定完成！' as status; 