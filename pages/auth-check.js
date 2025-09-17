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
    
    // 首先檢查 localStorage 中的登入狀態（index.html 的登入系統）
    const savedEmployee = localStorage.getItem('currentEmployee');
    if (savedEmployee) {
        try {
            const currentEmployee = JSON.parse(savedEmployee);
            
            // 將員工資訊設定到全域變數，供其他函數使用
            window.currentEmployee = currentEmployee;
            
            return true;
        } catch (error) {
            console.error('解析員工資訊失敗:', error);
        }
    }
    
    // 如果 localStorage 中沒有，嘗試使用 EmployeeAuth 系統
    try {
        await waitForAuth();
        
        const isLoggedIn = EmployeeAuth.isLoggedIn();
        
        if (isLoggedIn) {
            const employee = EmployeeAuth.getCurrentEmployee();
            window.currentEmployee = employee;
            return true;
        }
    } catch (error) {
        console.error('EmployeeAuth 檢查失敗:', error);
    }
    
    // 未登入，重定向到主頁面
    alert('請先登入系統！');
    window.location.href = '../index.html';
    return false;
}

// 檢查用戶權限
async function checkPermission(requiredRoles) {
    
    // 首先檢查 localStorage 中的登入狀態
    const savedEmployee = localStorage.getItem('currentEmployee');
    if (savedEmployee) {
        try {
            const currentEmployee = JSON.parse(savedEmployee);
            
            // 使用 index.html 的權限檢查邏輯
            const hasAccess = hasPermission(currentEmployee, requiredRoles);
            
            if (hasAccess) {
                return true;
            } else {
                const employee = currentEmployee;
                alert(`權限不足！\n\n此功能需要以下權限：${requiredRoles.join(' 或 ')}\n\n您的權限：${employee.role}`);
                window.location.href = '../index.html';
                return false;
            }
        } catch (error) {
            console.error('解析員工資訊失敗:', error);
        }
    }
    
    // 如果 localStorage 中沒有，嘗試使用 EmployeeAuth 系統
    try {
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
            window.location.href = '../index.html';
            return false;
        }
    } catch (error) {
        console.error('EmployeeAuth 權限檢查失敗:', error);
        alert('請先登入系統！');
        window.location.href = '../index.html';
        return false;
    }
}

// 權限檢查函數（複製自 index.html）
function hasPermission(employee, requiredPermissions) {
    
    // 如果沒有權限要求（空陣列），表示所有人都可以訪問
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }
    
    if (!employee || !employee.permissions) {
        return false;
    }

    // 如果員工有 'all' 權限，直接返回 true
    if (employee.permissions.includes('all')) {
        return true;
    }

    // 檢查是否包含所需的任何一個權限
    const hasRequiredPermission = requiredPermissions.some(permission => 
        employee.permissions.includes(permission)
    );
    
    return hasRequiredPermission;
}

// 獲取當前登入員工資訊
async function getCurrentEmployee() {
    // 首先檢查 localStorage 中的登入狀態
    const savedEmployee = localStorage.getItem('currentEmployee');
    if (savedEmployee) {
        try {
            const currentEmployee = JSON.parse(savedEmployee);
            return currentEmployee;
        } catch (error) {
            console.error('解析員工資訊失敗:', error);
        }
    }
    
    // 如果 localStorage 中沒有，嘗試使用 EmployeeAuth 系統
    try {
        await waitForAuth();
        
        if (!EmployeeAuth.isLoggedIn()) {
            return null;
        }
        return EmployeeAuth.getCurrentEmployee();
    } catch (error) {
        console.error('EmployeeAuth 獲取員工資訊失敗:', error);
        return null;
    }
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

// 根據當前頁面檢查特定權限
async function checkPageSpecificPermissions() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // 定義各頁面需要的權限
    const pagePermissions = {
        'sales': ['sales'],
        'products': ['products', 'purchase'],
        'purchase': ['purchase'],
        'members': ['members'],
        'employees': ['employees'],
        'reports': ['reports'],
        'suppliers': ['suppliers'],
        'import-export': ['import-export'],
        'coupons': ['disabled'] // 永久禁用
    };
    
    const requiredPermissions = pagePermissions[currentPage];
    
    if (requiredPermissions) {
        if (requiredPermissions.includes('disabled')) {
            // 優惠券頁面永久禁用
            alert('此功能需要系統管理員開通！');
            window.location.href = '../index.html';
            return;
        }
        
        const hasPermission = await checkPermission(requiredPermissions);
        if (!hasPermission) {
            // checkPermission 會顯示錯誤訊息並處理重定向
            return;
        }
    }
}

// 頁面載入時自動檢查身份驗證
window.addEventListener('load', async function() {
    try {
        
        // 等待認證系統初始化
        await EmployeeAuth.initialize();
        
        // 檢查是否已登入
        const isLoggedIn = await checkAuthentication();
        
        if (!isLoggedIn) {
            return;
        }
        
        // 根據當前頁面檢查特定權限
        await checkPageSpecificPermissions();
        
        // 顯示員工資訊
        await displayEmployeeInfo();
        
    } catch (error) {
        console.error('身份驗證檢查失敗:', error);
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
                    return;
                }
            } catch (e) {
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