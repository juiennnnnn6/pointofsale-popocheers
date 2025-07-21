// 身份驗證檢查腳本
// 所有頁面都需要引入此腳本

// 檢查用戶是否已登入
function checkAuthentication() {
    const currentEmployee = localStorage.getItem('currentEmployee');
    if (!currentEmployee) {
        // 未登入，重定向到主頁面
        alert('請先登入系統！');
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// 檢查用戶權限
function checkPermission(requiredRoles) {
    const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee'));
    if (!currentEmployee) {
        alert('請先登入系統！');
        window.location.href = '../index.html';
        return false;
    }

    // 檢查權限
    if (requiredRoles.includes('all') || requiredRoles.includes(currentEmployee.role)) {
        return true;
    } else {
        alert(`權限不足！\n\n此功能需要以下權限：${requiredRoles.join(' 或 ')}\n\n您的權限：${currentEmployee.role}`);
        return false;
    }
}

// 獲取當前登入員工資訊
function getCurrentEmployee() {
    const currentEmployee = localStorage.getItem('currentEmployee');
    if (!currentEmployee) {
        return null;
    }
    return JSON.parse(currentEmployee);
}

// 顯示員工資訊
function displayEmployeeInfo() {
    const employee = getCurrentEmployee();
    if (employee) {
        // 更新頁面中的員工資訊顯示
        const employeeInfoElements = document.querySelectorAll('.employee-info');
        employeeInfoElements.forEach(element => {
            element.textContent = `${employee.name} (${employee.role})`;
        });
    }
}

// 登出功能
function logout() {
    if (confirm('確定要登出嗎？')) {
        localStorage.removeItem('currentEmployee');
        alert('已成功登出！');
        window.location.href = '../index.html';
    }
}

// 頁面載入時自動檢查身份驗證
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否已登入
    if (!checkAuthentication()) {
        return;
    }
    
    // 顯示員工資訊
    displayEmployeeInfo();
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