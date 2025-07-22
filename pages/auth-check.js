// 身份驗證檢查腳本
// 所有頁面都需要引入此腳本

// 等待認證系統載入
async function waitForAuth() {
    return new Promise((resolve) => {
        if (typeof EmployeeAuth !== 'undefined') {
            resolve();
        } else {
            const checkAuth = () => {
                if (typeof EmployeeAuth !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        }
    });
}

// 檢查用戶是否已登入
async function checkAuthentication() {
    console.log('=== checkAuthentication 開始 ===');
    
    await waitForAuth();
    console.log('waitForAuth 完成');
    
    const isLoggedIn = EmployeeAuth.isLoggedIn();
    console.log('EmployeeAuth.isLoggedIn() 結果:', isLoggedIn);
    
    if (!isLoggedIn) {
        console.log('未登入，準備重定向');
        // 未登入，重定向到主頁面
        alert('請先登入系統！');
        window.location.href = '../index.html';
        return false;
    }
    
    console.log('認證成功，當前員工:', EmployeeAuth.getCurrentEmployee());
    console.log('=== checkAuthentication 完成 ===');
    return true;
}

// 檢查用戶權限
async function checkPermission(requiredRoles) {
    await waitForAuth();
    
    if (!EmployeeAuth.isLoggedIn()) {
        alert('請先登入系統！');
        window.location.href = '../index.html';
        return false;
    }

    // 檢查權限
    if (EmployeeAuth.hasPermission(requiredRoles)) {
        return true;
    } else {
        const employee = EmployeeAuth.getCurrentEmployee();
        alert(`權限不足！\n\n此功能需要以下權限：${requiredRoles.join(' 或 ')}\n\n您的權限：${employee.position}`);
        return false;
    }
}

// 獲取當前登入員工資訊
async function getCurrentEmployee() {
    await waitForAuth();
    
    if (!EmployeeAuth.isLoggedIn()) {
        return null;
    }
    return EmployeeAuth.getCurrentEmployee();
}

// 顯示員工資訊
async function displayEmployeeInfo() {
    const employee = await getCurrentEmployee();
    if (employee) {
        // 更新頁面中的員工資訊顯示
        const employeeInfoElements = document.querySelectorAll('.employee-info');
        employeeInfoElements.forEach(element => {
            element.textContent = `${employee.name} (${employee.position})`;
        });
    }
}

// 登出功能
async function logout() {
    if (confirm('確定要登出嗎？\n\n這將在所有裝置上登出您的帳號。')) {
        try {
            await EmployeeAuth.logout();
            alert('已成功登出！\n\n您已在所有裝置上登出。');
            window.location.href = '../index.html';
        } catch (error) {
            alert(`登出失敗：${error.message}`);
        }
    }
}

// 頁面載入時自動檢查身份驗證
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('=== 頁面認證檢查開始 ===');
        console.log('EmployeeAuth 是否可用:', typeof EmployeeAuth !== 'undefined');
        
        // 等待認證系統初始化
        console.log('開始初始化 EmployeeAuth...');
        await EmployeeAuth.initialize();
        console.log('EmployeeAuth 初始化完成');
        
        // 檢查是否已登入
        console.log('檢查登入狀態...');
        const isLoggedIn = await checkAuthentication();
        console.log('登入狀態檢查結果:', isLoggedIn);
        
        if (!isLoggedIn) {
            console.log('認證失敗，重定向到主頁面');
            return;
        }
        
        // 顯示員工資訊
        console.log('顯示員工資訊...');
        await displayEmployeeInfo();
        console.log('=== 頁面認證檢查完成 ===');
        
    } catch (error) {
        console.error('身份驗證檢查失敗:', error);
        console.error('錯誤詳情:', {
            message: error.message,
            stack: error.stack,
            EmployeeAuth: typeof EmployeeAuth
        });
        alert('身份驗證檢查失敗，請重新登入！');
        window.location.href = '../index.html';
    }
});

// 防止用戶直接修改localStorage繞過驗證
function secureLocalStorage() {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key, value) {
        if (key === 'currentEmployee') {
            // 驗證員工資料格式
            try {
                const employee = JSON.parse(value);
                if (!employee.id || !employee.name || !employee.role) {
                    console.warn('無效的員工資料格式');
                    return;
                }
            } catch (e) {
                console.warn('員工資料格式錯誤');
                return;
            }
        }
        originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key) {
        if (key === 'currentEmployee') {
            // 允許清除登入狀態
            originalRemoveItem.call(this, key);
        } else {
            originalRemoveItem.call(this, key);
        }
    };
}

// 初始化安全設置
secureLocalStorage(); 