-- 登入問題診斷腳本

-- 1. 檢查員工資料
SELECT '=== 員工資料檢查 ===' as info;
SELECT 
    id,
    employee_id,
    name,
    position,
    permissions,
    created_at
FROM employees 
ORDER BY employee_id;

-- 2. 檢查員工會話資料
SELECT '=== 員工會話檢查 ===' as info;
SELECT 
    id,
    session_id,
    employee_id,
    login_time,
    logout_time,
    device_info,
    is_active,
    created_at
FROM employee_sessions 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. 檢查 RLS 政策
SELECT '=== RLS 政策檢查 ===' as info;
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity = true THEN 'RLS 已啟用' ELSE 'RLS 未啟用' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('employees', 'employee_sessions')
ORDER BY tablename;

-- 4. 檢查員工表結構
SELECT '=== 員工表結構 ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- 5. 測試查詢員工資料
SELECT '=== 測試查詢 EMP001 ===' as info;
SELECT * FROM employees WHERE employee_id = 'EMP001';

-- 6. 檢查是否有重複的員工編號
SELECT '=== 檢查重複員工編號 ===' as info;
SELECT employee_id, COUNT(*) as count
FROM employees 
GROUP BY employee_id 
HAVING COUNT(*) > 1; 