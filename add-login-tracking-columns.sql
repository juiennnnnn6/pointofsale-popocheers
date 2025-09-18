-- 為employees表添加登入狀態追蹤欄位
-- 如果欄位已存在，這些語句會被忽略

-- 添加最後登入時間欄位
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 添加線上狀態欄位
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- 為查詢效能添加索引
CREATE INDEX IF NOT EXISTS idx_employees_is_online ON employees(is_online);
CREATE INDEX IF NOT EXISTS idx_employees_last_login ON employees(last_login);

-- 設定所有現有員工為離線狀態
UPDATE employees 
SET is_online = FALSE 
WHERE is_online IS NULL;

-- 顯示更新結果
SELECT 
    employee_id, 
    name, 
    position, 
    last_login,
    is_online
FROM employees
ORDER BY employee_id;
