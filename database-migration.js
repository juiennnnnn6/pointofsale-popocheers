// 資料庫遷移工具
// 將 localStorage 資料遷移到 Supabase 資料庫

class DatabaseMigration {
    
    // 檢查是否有本地資料需要遷移
    static checkLocalData() {
        const localData = {
            products: localStorage.getItem('productData'),
            categories: localStorage.getItem('categories'),
            members: localStorage.getItem('membersData'),
            employees: localStorage.getItem('employees'),
            salesHistory: localStorage.getItem('salesHistory'),
            coupons: localStorage.getItem('couponsData'),
            suppliers: localStorage.getItem('suppliersData')
        };
        
        const hasData = Object.values(localData).some(data => data !== null);
        
        return {
            hasData,
            dataSummary: Object.keys(localData).filter(key => localData[key] !== null)
        };
    }
    
    // 遷移商品資料
    static async migrateProducts() {
        try {
            const localData = localStorage.getItem('productData');
            if (!localData) return { success: true, message: '沒有商品資料需要遷移' };
            
            const products = JSON.parse(localData);
            const productList = Object.values(products);
            
            if (productList.length === 0) {
                return { success: true, message: '商品列表為空' };
            }
            
            // 批量新增商品
            const result = await DatabaseAPI.batchInsert('products', productList);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 個商品`);
                return { success: true, message: `成功遷移 ${result.length} 個商品` };
            } else {
                return { success: false, message: '商品遷移失敗' };
            }
        } catch (error) {
            console.error('商品遷移錯誤:', error);
            return { success: false, message: `商品遷移錯誤: ${error.message}` };
        }
    }
    
    // 遷移分類資料
    static async migrateCategories() {
        try {
            const localData = localStorage.getItem('categories');
            if (!localData) return { success: true, message: '沒有分類資料需要遷移' };
            
            const categories = JSON.parse(localData);
            
            if (categories.length === 0) {
                return { success: true, message: '分類列表為空' };
            }
            
            // 批量新增分類
            const result = await DatabaseAPI.batchInsert('categories', categories);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 個分類`);
                return { success: true, message: `成功遷移 ${result.length} 個分類` };
            } else {
                return { success: false, message: '分類遷移失敗' };
            }
        } catch (error) {
            console.error('分類遷移錯誤:', error);
            return { success: false, message: `分類遷移錯誤: ${error.message}` };
        }
    }
    
    // 遷移會員資料
    static async migrateMembers() {
        try {
            const localData = localStorage.getItem('membersData');
            if (!localData) return { success: true, message: '沒有會員資料需要遷移' };
            
            const members = JSON.parse(localData);
            const memberList = Object.values(members);
            
            if (memberList.length === 0) {
                return { success: true, message: '會員列表為空' };
            }
            
            // 批量新增會員
            const result = await DatabaseAPI.batchInsert('members', memberList);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 個會員`);
                return { success: true, message: `成功遷移 ${result.length} 個會員` };
            } else {
                return { success: false, message: '會員遷移失敗' };
            }
        } catch (error) {
            console.error('會員遷移錯誤:', error);
            return { success: false, message: `會員遷移錯誤: ${error.message}` };
        }
    }
    
    // 遷移員工資料
    static async migrateEmployees() {
        try {
            const localData = localStorage.getItem('employees');
            if (!localData) return { success: true, message: '沒有員工資料需要遷移' };
            
            const employees = JSON.parse(localData);
            
            if (employees.length === 0) {
                return { success: true, message: '員工列表為空' };
            }
            
            // 批量新增員工
            const result = await DatabaseAPI.batchInsert('employees', employees);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 個員工`);
                return { success: true, message: `成功遷移 ${result.length} 個員工` };
            } else {
                return { success: false, message: '員工遷移失敗' };
            }
        } catch (error) {
            console.error('員工遷移錯誤:', error);
            return { success: false, message: `員工遷移錯誤: ${error.message}` };
        }
    }
    
    // 遷移銷售記錄
    static async migrateSalesHistory() {
        try {
            const localData = localStorage.getItem('salesHistory');
            if (!localData) return { success: true, message: '沒有銷售記錄需要遷移' };
            
            const salesHistory = JSON.parse(localData);
            
            if (salesHistory.length === 0) {
                return { success: true, message: '銷售記錄為空' };
            }
            
            // 批量新增銷售記錄
            const result = await DatabaseAPI.batchInsert('sales_history', salesHistory);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 筆銷售記錄`);
                return { success: true, message: `成功遷移 ${result.length} 筆銷售記錄` };
            } else {
                return { success: false, message: '銷售記錄遷移失敗' };
            }
        } catch (error) {
            console.error('銷售記錄遷移錯誤:', error);
            return { success: false, message: `銷售記錄遷移錯誤: ${error.message}` };
        }
    }
    
    // 遷移優惠券資料
    static async migrateCoupons() {
        try {
            const localData = localStorage.getItem('couponsData');
            if (!localData) return { success: true, message: '沒有優惠券資料需要遷移' };
            
            const coupons = JSON.parse(localData);
            const couponList = Object.values(coupons);
            
            if (couponList.length === 0) {
                return { success: true, message: '優惠券列表為空' };
            }
            
            // 批量新增優惠券
            const result = await DatabaseAPI.batchInsert('coupons', couponList);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 個優惠券`);
                return { success: true, message: `成功遷移 ${result.length} 個優惠券` };
            } else {
                return { success: false, message: '優惠券遷移失敗' };
            }
        } catch (error) {
            console.error('優惠券遷移錯誤:', error);
            return { success: false, message: `優惠券遷移錯誤: ${error.message}` };
        }
    }
    
    // 遷移供應商資料
    static async migrateSuppliers() {
        try {
            const localData = localStorage.getItem('suppliersData');
            if (!localData) return { success: true, message: '沒有供應商資料需要遷移' };
            
            const suppliers = JSON.parse(localData);
            const supplierList = Object.values(suppliers);
            
            if (supplierList.length === 0) {
                return { success: true, message: '供應商列表為空' };
            }
            
            // 批量新增供應商
            const result = await DatabaseAPI.batchInsert('suppliers', supplierList);
            
            if (result) {
                console.log(`成功遷移 ${result.length} 個供應商`);
                return { success: true, message: `成功遷移 ${result.length} 個供應商` };
            } else {
                return { success: false, message: '供應商遷移失敗' };
            }
        } catch (error) {
            console.error('供應商遷移錯誤:', error);
            return { success: false, message: `供應商遷移錯誤: ${error.message}` };
        }
    }
    
    // 執行完整遷移
    static async migrateAll() {
        console.log('開始資料遷移...');
        
        const results = {
            products: await this.migrateProducts(),
            categories: await this.migrateCategories(),
            members: await this.migrateMembers(),
            employees: await this.migrateEmployees(),
            salesHistory: await this.migrateSalesHistory(),
            coupons: await this.migrateCoupons(),
            suppliers: await this.migrateSuppliers()
        };
        
        const successCount = Object.values(results).filter(r => r.success).length;
        const totalCount = Object.keys(results).length;
        
        console.log(`遷移完成: ${successCount}/${totalCount} 成功`);
        
        return {
            success: successCount === totalCount,
            results,
            summary: `遷移完成: ${successCount}/${totalCount} 成功`
        };
    }
    
    // 清除本地資料（遷移完成後）
    static clearLocalData() {
        const keysToRemove = [
            'productData',
            'categories',
            'membersData',
            'employees',
            'salesHistory',
            'lastReceiptNumber',
            'couponsData',
            'suppliersData'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('本地資料已清除');
        return { success: true, message: '本地資料已清除' };
    }
    
    // 顯示遷移進度
    static showMigrationProgress(step, total, message) {
        const progress = Math.round((step / total) * 100);
        console.log(`遷移進度: ${progress}% - ${message}`);
        
        // 可以在UI上顯示進度
        if (typeof showMigrationStatus === 'function') {
            showMigrationStatus(progress, message);
        }
    }
}

// 向全域暴露遷移工具
window.DatabaseMigration = DatabaseMigration;

// 自動檢查是否需要遷移
document.addEventListener('DOMContentLoaded', async function() {
    // 等待資料庫初始化
    await DatabaseManager.initialize();
    
    // 檢查本地資料
    const localDataCheck = DatabaseMigration.checkLocalData();
    
    if (localDataCheck.hasData) {
        console.log('發現本地資料，建議進行遷移');
        console.log('本地資料類型:', localDataCheck.dataSummary);
        
        // 可以在這裡顯示遷移提示
        if (typeof showMigrationPrompt === 'function') {
            showMigrationPrompt(localDataCheck.dataSummary);
        }
    } else {
        console.log('沒有發現本地資料，無需遷移');
    }
}); 