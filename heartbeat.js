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
        
        // 檢查 supabase 是否可用
        if (!window.supabase) {
            console.log('⏳ Supabase 尚未初始化，等待初始化...');
            return;
        }
        
        // 檢查 supabase 是否為有效的客戶端對象
        if (typeof window.supabase.from !== 'function') {
            console.log('❌ window.supabase 不是有效的 Supabase 客戶端對象:');
            console.log('  - 類型:', typeof window.supabase);
            console.log('  - 值:', window.supabase);
            console.log('  - from 方法:', typeof window.supabase?.from);
            console.log('  - 可用方法:', window.supabase ? Object.keys(window.supabase) : 'N/A');
            return;
        }
        
        const now = new Date().toISOString(); // 統一使用UTC時間
        
        console.log('🔍 準備更新心跳，會話ID:', currentSessionId);
        console.log('🔍 更新時間:', now);
        
        // 使用全域 supabase 客戶端，重新激活會話
        const { data, error } = await window.supabase
            .from('employee_sessions')
            .update({ 
                last_activity: now,
                is_active: true,  // 重新激活會話
                logout_time: null  // 清除登出時間
            })
            .eq('session_id', currentSessionId)
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
            console.log('🔍 檢測到已登入員工，準備啟動心跳:', employee.id);
            
            // 如果 supabase 尚未初始化，等待初始化
            if (!window.supabase || typeof window.supabase.from !== 'function') {
                console.log('⏳ 等待 Supabase 初始化...');
                // 使用輪詢方式等待 Supabase 初始化
                let attempts = 0;
                const maxAttempts = 10;
                const checkInterval = setInterval(() => {
                    attempts++;
                    console.log(`⏳ 檢查 Supabase 初始化狀態 (${attempts}/${maxAttempts}):`, typeof window.supabase, !!window.supabase);
                    
                    if (window.supabase && typeof window.supabase.from === 'function') {
                        console.log('✅ Supabase 已初始化，啟動心跳');
                        clearInterval(checkInterval);
                        startHeartbeat(employee.id);
                    } else if (attempts >= maxAttempts) {
                        console.log('❌ Supabase 初始化超時，無法啟動心跳');
                        clearInterval(checkInterval);
                    }
                }, 500);
                return true;
            } else {
                console.log('✅ Supabase 已就緒，立即啟動心跳');
                startHeartbeat(employee.id);
                return true;
            }
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
