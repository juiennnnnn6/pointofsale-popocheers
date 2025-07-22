-- 檢查員工資料
SELECT * FROM employees;

-- 檢查員工表結構
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position; 