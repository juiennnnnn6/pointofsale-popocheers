-- 為 employee_sessions 表添加 last_activity 欄位
-- 此欄位用於追蹤用戶的最後活動時間，實現精確的在線狀態追蹤

ALTER TABLE employee_sessions 
ADD COLUMN last_activity TIMESTAMPTZ;

-- 為現有記錄設置 last_activity 為 login_time
UPDATE employee_sessions 
SET last_activity = login_time 
WHERE last_activity IS NULL;

-- 添加註釋
COMMENT ON COLUMN employee_sessions.last_activity IS '最後活動時間，用於心跳機制追蹤用戶在線狀態';
