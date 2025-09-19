/**
 * 通用心跳機制
 * 用於所有頁面保持員工在線狀態
 */

let heartbeatInterval = null;

// 心跳機制：每10秒更新一次在線狀態
function startHeartbeat(employeeId) {
    // 清除舊的心跳
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    
    console.log('🔄 啟動心跳機制，每10秒更新一次在線狀態');
    heartbeatInterval = setInterval(async () => {
        await updateHeartbeat(employeeId);
    }, 10000); // 10秒
    
    // 立即執行一次
    updateHeartbeat(employeeId);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        console.log('⏹️ 停止心跳機制');
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// 更新心跳
async function updateHeartbeat(employeeId) {
    try {
        const currentSessionId = localStorage.getItem('currentSessionId');
        if (!currentSessionId) {
            console.log('❌ 沒有會話ID，停止心跳');
            stopHeartbeat();
            return;
        }
        
        const now = new Date().toLocaleString("sv-SE", {timeZone: "Asia/Taipei"}).replace(" ", "T") + "+08:00";
        
        console.log('🔍 準備更新心跳，會話ID:', currentSessionId);
        console.log('🔍 更新時間:', now);
        
        // 使用全域 supabase 客戶端
        const { data, error } = await window.supabase
            .from('employee_sessions')
            .update({ 
                last_activity: now
            })
            .eq('session_id', currentSessionId)
            .eq('is_active', true)
            .select();
        
        console.log('🔍 Supabase回應:', { data, error });
        
        if (error) {
            console.error('❌ 心跳更新失敗:', error);
            console.error('錯誤代碼:', error.code);
            console.error('錯誤詳情:', error.message);
            console.error('錯誤詳情:', error.details);
            console.error('錯誤提示:', error.hint);
            
            if (error.message && (error.message.includes('last_activity') || error.message.includes('column'))) {
                console.error('❌ last_activity 欄位不存在！請在Supabase執行SQL:');
                console.error('ALTER TABLE employee_sessions ADD COLUMN last_activity TIMESTAMPTZ;');
                console.error('然後執行:');
                console.error('UPDATE employee_sessions SET last_activity = login_time WHERE last_activity IS NULL;');
                stopHeartbeat();
            }
        } else {
            console.log('💓 心跳更新成功:', now);
            console.log('💓 更新的資料:', data);
        }
    } catch (error) {
        console.error('❌ 心跳更新錯誤:', error);
    }
}

// 檢查是否已登入並啟動心跳
function checkAndStartHeartbeat() {
    const savedEmployee = localStorage.getItem('currentEmployee');
    const currentSessionId = localStorage.getItem('currentSessionId');
    
    if (savedEmployee && currentSessionId) {
        try {
            const employee = JSON.parse(savedEmployee);
            console.log('🔍 檢測到已登入員工，啟動心跳:', employee.id);
            startHeartbeat(employee.id);
            return true;
        } catch (error) {
            console.error('解析員工資訊失敗:', error);
            localStorage.removeItem('currentEmployee');
            localStorage.removeItem('currentSessionId');
            return false;
        }
    }
    
    console.log('🔍 未檢測到登入狀態，不啟動心跳');
    return false;
}

// 頁面卸載時停止心跳
window.addEventListener('beforeunload', function() {
    stopHeartbeat();
});

// 頁面隱藏時停止心跳，顯示時重新啟動
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('🔍 頁面隱藏，停止心跳');
        stopHeartbeat();
    } else {
        console.log('🔍 頁面顯示，檢查並啟動心跳');
        checkAndStartHeartbeat();
    }
});

// 導出函數供其他腳本使用
window.HeartbeatManager = {
    start: startHeartbeat,
    stop: stopHeartbeat,
    checkAndStart: checkAndStartHeartbeat
};
