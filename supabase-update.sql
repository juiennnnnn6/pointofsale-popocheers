-- 進銷存系統資料庫更新腳本
-- 處理已存在的表和政策

-- 1. 創建員工會話表（如果不存在）
CREATE TABLE IF NOT EXISTS employee_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    login_time TIMESTAMP DEFAULT NOW(),
    logout_time TIMESTAMP,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 更新員工表結構（如果需要）
-- 檢查並添加缺少的欄位
DO $$ 
BEGIN
    -- 檢查 employee_id 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'employee_id') THEN
        ALTER TABLE employees ADD COLUMN employee_id VARCHAR(50) UNIQUE;
    END IF;
    
    -- 檢查 position 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'position') THEN
        ALTER TABLE employees ADD COLUMN position VARCHAR(50);
    END IF;
    
    -- 檢查 permissions 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'permissions') THEN
        ALTER TABLE employees ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. 更新銷售記錄表結構（如果需要）
DO $$ 
BEGIN
    -- 檢查 member_discount 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'member_discount') THEN
        ALTER TABLE sales_history ADD COLUMN member_discount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- 檢查 coupon_discount 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'coupon_discount') THEN
        ALTER TABLE sales_history ADD COLUMN coupon_discount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- 檢查 received_amount 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'received_amount') THEN
        ALTER TABLE sales_history ADD COLUMN received_amount DECIMAL(10,2);
    END IF;
    
    -- 檢查 change_amount 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'change_amount') THEN
        ALTER TABLE sales_history ADD COLUMN change_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- 檢查 cashier_name 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'cashier_name') THEN
        ALTER TABLE sales_history ADD COLUMN cashier_name VARCHAR(100);
    END IF;
    
    -- 檢查 member_info 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'member_info') THEN
        ALTER TABLE sales_history ADD COLUMN member_info JSONB;
    END IF;
    
    -- 檢查 coupon_info 欄位是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales_history' AND column_name = 'coupon_info') THEN
        ALTER TABLE sales_history ADD COLUMN coupon_info JSONB;
    END IF;
END $$;

-- 4. 安全地創建 RLS 政策（如果不存在）
-- 員工會話表政策
DO $$ 
BEGIN
    -- 啟用 RLS
    ALTER TABLE employee_sessions ENABLE ROW LEVEL SECURITY;
    
    -- 創建政策（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_sessions' AND policyname = 'Allow anonymous read') THEN
        CREATE POLICY "Allow anonymous read" ON employee_sessions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_sessions' AND policyname = 'Allow anonymous insert') THEN
        CREATE POLICY "Allow anonymous insert" ON employee_sessions FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_sessions' AND policyname = 'Allow anonymous update') THEN
        CREATE POLICY "Allow anonymous update" ON employee_sessions FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_sessions' AND policyname = 'Allow anonymous delete') THEN
        CREATE POLICY "Allow anonymous delete" ON employee_sessions FOR DELETE USING (true);
    END IF;
END $$;

-- 5. 插入或更新預設員工資料
INSERT INTO employees (employee_id, name, position, permissions) VALUES 
('EMP001', '管理員', '管理員', '{"all": true}'),
('EMP002', '店長', '店長', '{"sales": true, "inventory": true, "reports": true}'),
('EMP003', '收銀員', '收銀員', '{"sales": true}'),
('EMP004', '倉管', '倉管', '{"inventory": true, "reports": true}')
ON CONFLICT (employee_id) DO UPDATE SET
    name = EXCLUDED.name,
    position = EXCLUDED.position,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

-- 6. 插入預設分類（如果不存在）
INSERT INTO categories (name, description) VALUES 
('瓷器', '精緻瓷器用品'),
('家居', '實用家居用品'),
('裝飾', '美觀裝飾品')
ON CONFLICT (name) DO NOTHING;

-- 7. 顯示更新結果
SELECT '資料庫更新完成' as status;

-- 8. 顯示當前資料表狀態
SELECT 
    table_name,
    CASE WHEN row_level_security = 'YES' THEN 'RLS 已啟用' ELSE 'RLS 未啟用' END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'categories', 'members', 'employees', 'sales_history', 'coupons', 'suppliers', 'employee_sessions')
ORDER BY table_name; 