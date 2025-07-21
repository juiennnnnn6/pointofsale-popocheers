// 資料庫連接和API管理
// 使用 Supabase 作為雲端資料庫

// Supabase 配置
const SUPABASE_URL = 'https://cgwhckykrlphnibmuvhz.supabase.co'; // 需要替換為您的Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODgzLCJleHAiOjIwNjg2NzY1ODN9.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'; // 需要替換為您的Supabase Anon Key

// 初始化 Supabase 客戶端
let supabase;

// 初始化資料庫連接
async function initDatabase() {
    try {
        // 動態載入 Supabase 客戶端
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('資料庫連接成功');
        return true;
    } catch (error) {
        console.error('資料庫連接失敗:', error);
        return false;
    }
}

// 通用資料庫操作函數
class DatabaseAPI {
    
    // 獲取資料
    static async getData(tableName, filters = {}) {
        try {
            let query = supabase.from(tableName).select('*');
            
            // 應用過濾器
            Object.keys(filters).forEach(key => {
                query = query.eq(key, filters[key]);
            });
            
            const { data, error } = await query;
            
            if (error) {
                console.error(`獲取${tableName}資料失敗:`, error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error(`獲取${tableName}資料時發生錯誤:`, error);
            return null;
        }
    }
    
    // 新增資料
    static async insertData(tableName, data) {
        try {
            const { data: result, error } = await supabase
                .from(tableName)
                .insert([data])
                .select();
            
            if (error) {
                console.error(`新增${tableName}資料失敗:`, error);
                return null;
            }
            
            return result[0];
        } catch (error) {
            console.error(`新增${tableName}資料時發生錯誤:`, error);
            return null;
        }
    }
    
    // 更新資料
    static async updateData(tableName, id, data) {
        try {
            const { data: result, error } = await supabase
                .from(tableName)
                .update(data)
                .eq('id', id)
                .select();
            
            if (error) {
                console.error(`更新${tableName}資料失敗:`, error);
                return null;
            }
            
            return result[0];
        } catch (error) {
            console.error(`更新${tableName}資料時發生錯誤:`, error);
            return null;
        }
    }
    
    // 刪除資料
    static async deleteData(tableName, id) {
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error(`刪除${tableName}資料失敗:`, error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error(`刪除${tableName}資料時發生錯誤:`, error);
            return false;
        }
    }
    
    // 批量操作
    static async batchInsert(tableName, dataArray) {
        try {
            const { data: result, error } = await supabase
                .from(tableName)
                .insert(dataArray)
                .select();
            
            if (error) {
                console.error(`批量新增${tableName}資料失敗:`, error);
                return null;
            }
            
            return result;
        } catch (error) {
            console.error(`批量新增${tableName}資料時發生錯誤:`, error);
            return null;
        }
    }
}

// 特定業務邏輯API
class BusinessAPI {
    
    // 商品管理
    static async getProducts() {
        return await DatabaseAPI.getData('products');
    }
    
    static async addProduct(productData) {
        return await DatabaseAPI.insertData('products', {
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    static async updateProduct(id, productData) {
        return await DatabaseAPI.updateData('products', id, {
            ...productData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteProduct(id) {
        return await DatabaseAPI.deleteData('products', id);
    }
    
    // 分類管理
    static async getCategories() {
        return await DatabaseAPI.getData('categories');
    }
    
    static async addCategory(categoryData) {
        return await DatabaseAPI.insertData('categories', {
            ...categoryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    static async updateCategory(id, categoryData) {
        return await DatabaseAPI.updateData('categories', id, {
            ...categoryData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteCategory(id) {
        return await DatabaseAPI.deleteData('categories', id);
    }
    
    // 會員管理
    static async getMembers() {
        return await DatabaseAPI.getData('members');
    }
    
    static async addMember(memberData) {
        return await DatabaseAPI.insertData('members', {
            ...memberData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    static async updateMember(id, memberData) {
        return await DatabaseAPI.updateData('members', id, {
            ...memberData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteMember(id) {
        return await DatabaseAPI.deleteData('members', id);
    }
    
    // 員工管理
    static async getEmployees() {
        return await DatabaseAPI.getData('employees');
    }
    
    static async addEmployee(employeeData) {
        return await DatabaseAPI.insertData('employees', {
            ...employeeData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    static async updateEmployee(id, employeeData) {
        return await DatabaseAPI.updateData('employees', id, {
            ...employeeData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteEmployee(id) {
        return await DatabaseAPI.deleteData('employees', id);
    }
    
    // 銷售記錄
    static async getSalesHistory() {
        return await DatabaseAPI.getData('sales_history');
    }
    
    static async addSale(saleData) {
        // 確保銷售記錄包含所有必要的明細資訊
        const saleRecord = {
            receipt_number: saleData.receiptNumber,
            customer_id: saleData.member?.id || null,
            employee_id: saleData.employeeId || null,
            items: saleData.items,
            subtotal: saleData.subtotal,
            member_discount: saleData.memberDiscount || 0,
            coupon_discount: saleData.couponDiscount || 0,
            tax: saleData.tax || 0,
            total: saleData.total,
            payment_method: saleData.paymentMethod,
            received_amount: saleData.receivedAmount || saleData.total,
            change_amount: saleData.change || 0,
            cashier_name: saleData.cashier,
            member_info: saleData.member,
            coupon_info: saleData.coupon,
            notes: saleData.notes || '',
            created_at: new Date().toISOString()
        };
        
        return await DatabaseAPI.insertData('sales_history', saleRecord);
    }
    
    static async updateSale(id, saleData) {
        return await DatabaseAPI.updateData('sales_history', id, {
            ...saleData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteSale(id) {
        return await DatabaseAPI.deleteData('sales_history', id);
    }
    
    // 優惠券管理
    static async getCoupons() {
        return await DatabaseAPI.getData('coupons');
    }
    
    static async addCoupon(couponData) {
        return await DatabaseAPI.insertData('coupons', {
            ...couponData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    static async updateCoupon(id, couponData) {
        return await DatabaseAPI.updateData('coupons', id, {
            ...couponData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteCoupon(id) {
        return await DatabaseAPI.deleteData('coupons', id);
    }
    
    // 供應商管理
    static async getSuppliers() {
        return await DatabaseAPI.getData('suppliers');
    }
    
    static async addSupplier(supplierData) {
        return await DatabaseAPI.insertData('suppliers', {
            ...supplierData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    static async updateSupplier(id, supplierData) {
        return await DatabaseAPI.updateData('suppliers', id, {
            ...supplierData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteSupplier(id) {
        return await DatabaseAPI.deleteData('suppliers', id);
    }
}

// 資料庫狀態管理
class DatabaseManager {
    static isInitialized = false;
    static connectionStatus = 'disconnected';
    
    // 初始化資料庫
    static async initialize() {
        if (this.isInitialized) {
            return true;
        }
        
        this.connectionStatus = 'connecting';
        const success = await initDatabase();
        
        if (success) {
            this.isInitialized = true;
            this.connectionStatus = 'connected';
            console.log('資料庫管理器初始化成功');
        } else {
            this.connectionStatus = 'failed';
            console.error('資料庫管理器初始化失敗');
        }
        
        return success;
    }
    
    // 獲取連接狀態
    static getStatus() {
        return this.connectionStatus;
    }
    
    // 檢查是否已連接
    static isConnected() {
        return this.connectionStatus === 'connected';
    }
}

// 向全域暴露API
window.DatabaseAPI = DatabaseAPI;
window.BusinessAPI = BusinessAPI;
window.DatabaseManager = DatabaseManager;

// 自動初始化
document.addEventListener('DOMContentLoaded', async function() {
    await DatabaseManager.initialize();
}); 