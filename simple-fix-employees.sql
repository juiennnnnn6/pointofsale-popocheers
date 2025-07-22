-- 簡單員工資料修復腳本
-- 只處理必要的欄位，避免複雜檢查

-- 1. 檢查當前員工資料
SELECT '當前員工資料:' as info;
SELECT * FROM employees;

-- 2. 確保有必要的欄位
DO $$ 
BEGIN
    -- 添加 employee_id 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'employee_id') THEN
        ALTER TABLE employees ADD COLUMN employee_id VARCHAR(50);
    END IF;
    
    -- 添加 position 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'position') THEN
        ALTER TABLE employees ADD COLUMN position VARCHAR(50);
    END IF;
    
    -- 添加 permissions 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'permissions') THEN
        ALTER TABLE employees ADD COLUMN permissions TEXT DEFAULT '{}';
    END IF;
END $$;

-- 3. 清空現有員工資料並重新插入
DELETE FROM employees;

-- 4. 插入新的員工資料
INSERT INTO employees (employee_id, name, position, permissions) VALUES 
('EMP001', '管理員', '管理員', '{"all": true}'),
('EMP002', '店長', '店長', '{"sales": true, "inventory": true, "reports": true}'),
('EMP003', '收銀員', '收銀員', '{"sales": true}'),
('EMP004', '倉管', '倉管', '{"inventory": true, "reports": true}');

-- 5. 顯示修復後的員工資料
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