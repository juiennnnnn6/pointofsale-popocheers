// IP限制檢查腳本
// 支援IP白名單和地理位置限制

// 獲取允許的IP地址列表
function getAllowedIPs() {
    const savedIPs = localStorage.getItem('ipWhitelist');
    if (savedIPs) {
        const ipList = JSON.parse(savedIPs);
        return ipList.filter(ip => ip.enabled).map(ip => ip.address);
    }
    // 預設IP列表
    return [
        '127.0.0.1',           // 本地測試
        'localhost',            // 本地主機
        '::1',                  // IPv6本地地址
    ];
}

// 獲取允許的IP範圍
function getAllowedIPRanges() {
    const savedIPs = localStorage.getItem('ipWhitelist');
    if (savedIPs) {
        const ipList = JSON.parse(savedIPs);
        return ipList.filter(ip => ip.enabled && ip.type === 'range').map(ip => ip.address);
    }
    // 預設IP範圍
    return [
        '192.168.1.0/24',      // 辦公室內網範圍
        '10.0.0.0/8',          // 公司內網範圍
    ];
}

// 獲取允許的國家列表
function getAllowedCountries() {
    const savedCountries = localStorage.getItem('countryWhitelist');
    if (savedCountries) {
        const countryList = JSON.parse(savedCountries);
        return countryList.filter(country => country.enabled).map(country => country.code);
    }
    // 預設國家列表
    return [
        'TW',                   // 台灣
    ];
}

// 檢查IP是否在白名單中
function isIPAllowed(ip) {
    const allowedIPs = getAllowedIPs();
    const allowedRanges = getAllowedIPRanges();
    
    // 檢查精確IP匹配
    if (allowedIPs.includes(ip)) {
        return true;
    }
    
    // 檢查IP範圍
    for (const range of allowedRanges) {
        if (isIPInRange(ip, range)) {
            return true;
        }
    }
    
    return false;
}

// 檢查IP是否在指定範圍內
function isIPInRange(ip, cidr) {
    try {
        const [rangeIP, prefixLength] = cidr.split('/');
        const mask = ~((1 << (32 - parseInt(prefixLength))) - 1);
        
        const ipNum = ipToNumber(ip);
        const rangeNum = ipToNumber(rangeIP);
        
        return (ipNum & mask) === (rangeNum & mask);
    } catch (e) {
        console.warn('IP範圍檢查錯誤:', e);
        return false;
    }
}

// 將IP地址轉換為數字
function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

// 獲取用戶IP地址
async function getUserIP() {
    try {
        // 方法1：使用免費IP查詢服務
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn('無法獲取IP地址:', error);
        
        // 方法2：使用備用服務
        try {
            const response = await fetch('https://httpbin.org/ip');
            const data = await response.json();
            return data.origin;
        } catch (error2) {
            console.warn('備用IP服務也失敗:', error2);
            return null;
        }
    }
}

// 獲取地理位置信息
async function getLocationInfo(ip) {
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        return {
            country: data.country_code,
            region: data.region,
            city: data.city,
            isp: data.org
        };
    } catch (error) {
        console.warn('無法獲取地理位置信息:', error);
        return null;
    }
}

// 檢查地理位置限制
function isLocationAllowed(locationInfo) {
    if (!locationInfo || !locationInfo.country) {
        return true; // 如果無法獲取地理位置，允許訪問
    }
    
    const allowedCountries = getAllowedCountries();
    return allowedCountries.includes(locationInfo.country);
}

// 顯示IP限制錯誤頁面
function showIPRestrictionError(ip, locationInfo) {
    const errorHtml = `
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>訪問被拒絕 - IP限制</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body class="bg-gradient-to-br from-red-50 to-pink-100 min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-shield-alt text-red-600 text-2xl"></i>
                    </div>
                    
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">訪問被拒絕</h1>
                    <p class="text-gray-600 mb-6">基於安全考慮，此系統僅允許特定IP地址訪問</p>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 class="font-semibold text-gray-800 mb-2">您的訪問信息：</h3>
                        <div class="space-y-1 text-sm text-gray-600">
                            <div><strong>IP地址：</strong>${ip || '無法獲取'}</div>
                            ${locationInfo ? `
                                <div><strong>國家/地區：</strong>${locationInfo.country || '未知'}</div>
                                <div><strong>城市：</strong>${locationInfo.city || '未知'}</div>
                                <div><strong>ISP：</strong>${locationInfo.isp || '未知'}</div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <button onclick="window.history.back()" class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>返回上一頁
                        </button>
                        <button onclick="window.location.href='../index.html'" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <i class="fas fa-home mr-2"></i>回到首頁
                        </button>
                    </div>
                    
                    <div class="mt-6 text-xs text-gray-500">
                        <p>如需訪問權限，請聯繫系統管理員</p>
                        <p>波波 聚 歐洲家居/波蘭陶食器</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    document.documentElement.innerHTML = errorHtml;
}

// 主要IP檢查函數
async function checkIPRestriction() {
    try {
        // 獲取用戶IP
        const userIP = await getUserIP();
        console.log('用戶IP:', userIP);
        
        // 如果無法獲取IP，允許訪問（避免誤擋）
        if (!userIP) {
            console.warn('無法獲取IP地址，允許訪問');
            return true;
        }
        
        // 檢查IP是否在白名單中
        if (isIPAllowed(userIP)) {
            console.log('IP在白名單中，允許訪問');
            return true;
        }
        
        // 獲取地理位置信息
        const locationInfo = await getLocationInfo(userIP);
        console.log('地理位置信息:', locationInfo);
        
        // 檢查地理位置限制
        if (isLocationAllowed(locationInfo)) {
            console.log('地理位置符合要求，允許訪問');
            return true;
        }
        
        // IP和地理位置都不符合要求，拒絕訪問
        console.log('IP和地理位置都不符合要求，拒絕訪問');
        showIPRestrictionError(userIP, locationInfo);
        return false;
        
    } catch (error) {
        console.error('IP檢查過程中發生錯誤:', error);
        // 發生錯誤時允許訪問，避免誤擋
        return true;
    }
}

// 初始化IP限制檢查
async function initIPRestriction() {
    // 檢查是否已通過IP驗證
    const ipVerified = sessionStorage.getItem('ipVerified');
    
    if (ipVerified === 'true') {
        console.log('IP已驗證，跳過檢查');
        return true;
    }
    
    // 執行IP檢查
    const isAllowed = await checkIPRestriction();
    
    if (isAllowed) {
        // 標記為已驗證，避免重複檢查
        sessionStorage.setItem('ipVerified', 'true');
        console.log('IP驗證通過');
    }
    
    return isAllowed;
}

// 導出函數供其他腳本使用
window.IPRestriction = {
    checkIPRestriction,
    initIPRestriction,
    isIPAllowed,
    getUserIP,
    getLocationInfo
}; 