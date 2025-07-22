-- 修復員工資料腳本
-- 確保所有員工都有正確的欄位

-- 1. 檢查現有員工資料
SELECT '現有員工資料:' as info;
SELECT * FROM employees;

-- 2. 更新員工資料結構
DO $$ 
BEGIN
    -- 確保有 employee_id 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'employee_id') THEN
        ALTER TABLE employees ADD COLUMN employee_id VARCHAR(50);
    END IF;
    
    -- 確保有 position 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'position') THEN
        ALTER TABLE employees ADD COLUMN position VARCHAR(50);
    END IF;
    
    -- 確保有 permissions 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'permissions') THEN
        ALTER TABLE employees ADD COLUMN permissions TEXT DEFAULT '{}';
    END IF;
END $$;

-- 3. 插入或更新預設員工資料
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

-- 4. 檢查並處理舊格式資料
DO $$ 
BEGIN
    -- 如果沒有 employee_id 但有 username，複製過去
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'employees' AND column_name = 'username') THEN
        UPDATE employees 
        SET employee_id = username 
        WHERE employee_id IS NULL AND username IS NOT NULL;
    END IF;
    
    -- 如果沒有 position 但有 role，複製過去
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'employees' AND column_name = 'role') THEN
        UPDATE employees 
        SET position = role 
        WHERE position IS NULL AND role IS NOT NULL;
    END IF;
END $$;

-- 6. 顯示修復後的員工資料
SELECT '修復後的員工資料:' as info;
SELECT 
    id,
    employee_id,
    name,
    position,
    permissions,
    created_at
FROM employees 
ORDER BY employee_id; 