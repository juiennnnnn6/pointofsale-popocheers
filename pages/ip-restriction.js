// IP限制功能已完全移除
// 此腳本現在只提供基本的IP獲取功能，不進行任何限制檢查

// 獲取用戶IP地址（僅用於顯示，不進行限制）
async function getUserIP() {
    try {
        const services = [
            'https://api.ipify.org?format=json',
            'https://httpbin.org/ip',
            'https://ipapi.co/json/'
        ];
        
        for (const service of services) {
            try {
                const response = await fetch(service, { timeout: 5000 });
                if (response.ok) {
                    const data = await response.json();
                    return data.ip || data.origin;
                }
            } catch (error) {
                console.warn(`IP獲取服務失敗: ${service}`, error);
                continue;
            }
        }
        
        throw new Error('所有IP獲取服務都失敗');
    } catch (error) {
        console.error('無法獲取用戶IP:', error);
        return null;
    }
}

// 獲取地理位置信息（僅用於顯示，不進行限制）
async function getLocationInfo(ip) {
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('無法獲取地理位置信息:', error);
    }
    return null;
}

// 初始化函數（現在總是返回true，不進行任何限制）
async function initIPRestriction() {
    console.log('IP限制功能已移除，允許所有訪問');
    return true;
}

// 檢查IP限制（現在總是返回true）
async function checkIPRestriction() {
    console.log('IP限制功能已移除，允許所有訪問');
    return true;
}

// 導出函數供其他腳本使用
window.IPRestriction = {
    initIPRestriction,
    checkIPRestriction,
    getUserIP,
    getLocationInfo
}; 