# Supabase 資料庫設定指南

## 📋 概述

本系統已從 localStorage 改為使用 Supabase 雲端資料庫，提供：
- 多裝置即時同步
- 資料安全備份
- 雲端存取
- 即時資料更新

## 🚀 快速設定步驟

### 步驟1：註冊 Supabase 帳號

1. 前往 [Supabase官網](https://supabase.com)
2. 點擊「Start your project」
3. 使用 GitHub 或 Google 帳號註冊
4. 完成註冊後登入

### 步驟2：創建新專案

1. 在 Supabase 控制台點擊「New Project」
2. 填寫專案資訊：
   - **組織**: 選擇您的組織
   - **專案名稱**: `進銷存系統` 或 `pointofsale-popocheers`
   - **資料庫密碼**: 設定一個強密碼（請記住）
   - **地區**: 選擇離您最近的區域（建議選擇亞洲地區）
3. 點擊「Create new project」
4. 等待專案創建完成（約1-2分鐘）

### 步驟3：獲取連接資訊

1. 在專案控制台找到「Settings」→「API」
2. 複製以下資訊：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: `your-anon-key`

### 步驟4：更新程式碼

1. 打開 `database.js` 檔案
2. 將以下行：
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. 替換為您的實際資訊：
   ```javascript
   const SUPABASE_URL = 'https://your-actual-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-actual-anon-key';
   ```

### 步驟5：創建資料表

在 Supabase 控制台的「SQL Editor」中執行以下 SQL 語句：

#### 1. 商品表
```sql
CREATE TABLE products (
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
```

#### 2. 分類表
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. 會員表
```sql
CREATE TABLE members (
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
```

#### 4. 員工表
```sql
CREATE TABLE employees (
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
```

#### 5. 銷售記錄表
```sql
CREATE TABLE sales_history (
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
```

#### 6. 優惠券表
```sql
CREATE TABLE coupons (
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
```

#### 7. 供應商表
```sql
CREATE TABLE suppliers (
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
```

### 步驟6：設定權限

在 Supabase 控制台的「Authentication」→「Policies」中：

1. 為每個表啟用 RLS (Row Level Security)
2. 創建允許匿名讀寫的策略：

```sql
-- 允許匿名用戶讀取所有資料
CREATE POLICY "Allow anonymous read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON members FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON sales_history FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON suppliers FOR SELECT USING (true);

-- 允許匿名用戶插入資料
CREATE POLICY "Allow anonymous insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON sales_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON suppliers FOR INSERT WITH CHECK (true);

-- 允許匿名用戶更新資料
CREATE POLICY "Allow anonymous update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON sales_history FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON suppliers FOR UPDATE USING (true);

-- 允許匿名用戶刪除資料
CREATE POLICY "Allow anonymous delete" ON products FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON categories FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON members FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON employees FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON sales_history FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON coupons FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON suppliers FOR DELETE USING (true);
```

## 🔧 測試設定

### 1. 檢查連接狀態
打開瀏覽器開發者工具，查看 Console 是否有以下訊息：
```
資料庫連接成功
資料庫管理器初始化成功
```

### 2. 測試資料操作
在瀏覽器 Console 中執行：
```javascript
// 測試獲取商品
const products = await BusinessAPI.getProducts();
console.log('商品列表:', products);

// 測試新增商品
const newProduct = await BusinessAPI.addProduct({
    name: '測試商品',
    price: 100,
    stock: 10
});
console.log('新增商品:', newProduct);
```

## 📊 資料庫結構

### 主要資料表

| 表名 | 用途 | 主要欄位 |
|------|------|----------|
| `products` | 商品管理 | id, name, barcode, price, stock |
| `categories` | 分類管理 | id, name, description |
| `members` | 會員管理 | id, name, phone, points |
| `employees` | 員工管理 | id, name, username, role |
| `sales_history` | 銷售記錄 | id, receipt_number, items, total |
| `coupons` | 優惠券 | id, code, name, value |
| `suppliers` | 供應商 | id, name, contact_person, phone |

### 資料關係

- 商品 → 分類 (category_id)
- 銷售記錄 → 會員 (customer_id)
- 銷售記錄 → 員工 (employee_id)

## 🔒 安全性

### 資料保護
- 所有資料都儲存在 Supabase 雲端
- 自動備份和版本控制
- 支援資料加密

### 存取控制
- 使用 API 金鑰進行身份驗證
- 可設定細粒度權限控制
- 支援角色基礎存取控制

## 📱 多裝置同步

### 即時同步
- 使用 Supabase 即時功能
- 所有裝置自動同步資料
- 無需手動刷新

### 離線支援
- 支援離線操作
- 重新連線時自動同步
- 衝突解決機制

## 🛠️ 故障排除

### 常見問題

**Q: 無法連接到資料庫**
A: 檢查 Supabase URL 和 API 金鑰是否正確

**Q: 無法新增資料**
A: 檢查資料表權限設定是否正確

**Q: 資料不同步**
A: 檢查網路連接和 Supabase 服務狀態

### 聯絡支援
- Supabase 官方文件：https://supabase.com/docs
- 社群支援：https://github.com/supabase/supabase/discussions

## 📈 效能優化

### 查詢優化
- 使用適當的索引
- 限制查詢結果數量
- 使用分頁載入

### 快取策略
- 本地快取常用資料
- 定期更新快取
- 智能快取失效

---

**注意**: 請妥善保管您的 Supabase 連接資訊，不要分享給他人。 