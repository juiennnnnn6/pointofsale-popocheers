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
    
    // 初始化商品資料 - 為每個分類增加3樣商品
    static async initializeProducts() {
        console.log('開始初始化商品資料...');
        
        // 商品資料欄位格式說明：
        // {
        //   name: '商品名稱',           // 必填，字串
        //   barcode: '條碼',           // 必填，字串，唯一
        //   category: '分類名稱',       // 必填，字串
        //   price: 價格,               // 必填，數字
        //   cost: 成本價,              // 選填，數字
        //   stock: 庫存數量,           // 必填，數字
        //   min_stock: 最低庫存,       // 選填，數字
        //   description: '商品描述',   // 選填，字串
        //   image_url: '圖片URL',      // 選填，字串
        //   is_active: true,          // 選填，布林值，預設true
        //   supplier_id: 供應商ID,     // 選填，數字
        //   created_at: 建立時間,      // 自動產生
        //   updated_at: 更新時間       // 自動產生
        // }
        
        const products = [
            // 餐具類 (3樣商品)
            {
                name: '波蘭手工陶瓷餐盤組',
                barcode: 'PLATE001',
                category: '餐具',
                price: 1200,
                cost: 800,
                stock: 50,
                min_stock: 10,
                description: '精緻手工陶瓷餐盤，適合日常用餐使用',
                image_url: 'https://example.com/plate1.jpg',
                is_active: true
            },
            {
                name: '歐洲風格咖啡杯組',
                barcode: 'CUP001',
                category: '餐具',
                price: 850,
                cost: 550,
                stock: 30,
                min_stock: 5,
                description: '優雅咖啡杯組，適合下午茶時光',
                image_url: 'https://example.com/cup1.jpg',
                is_active: true
            },
            {
                name: '手工陶瓷湯碗',
                barcode: 'BOWL001',
                category: '餐具',
                price: 680,
                cost: 420,
                stock: 40,
                min_stock: 8,
                description: '溫暖手感的陶瓷湯碗，保溫效果好',
                image_url: 'https://example.com/bowl1.jpg',
                is_active: true
            },
            
            // 花瓶類 (3樣商品)
            {
                name: '波蘭手工花瓶大號',
                barcode: 'VASE001',
                category: '花瓶',
                price: 1800,
                cost: 1200,
                stock: 20,
                min_stock: 3,
                description: '大型手工花瓶，適合客廳裝飾',
                image_url: 'https://example.com/vase1.jpg',
                is_active: true
            },
            {
                name: '歐式復古小花瓶',
                barcode: 'VASE002',
                category: '花瓶',
                price: 950,
                cost: 650,
                stock: 25,
                min_stock: 5,
                description: '復古風格小花瓶，適合書桌擺設',
                image_url: 'https://example.com/vase2.jpg',
                is_active: true
            },
            {
                name: '手工陶瓷花瓶套組',
                barcode: 'VASE003',
                category: '花瓶',
                price: 2200,
                cost: 1500,
                stock: 15,
                min_stock: 2,
                description: '三件式花瓶套組，不同尺寸搭配',
                image_url: 'https://example.com/vase3.jpg',
                is_active: true
            },
            
            // 裝飾品類 (3樣商品)
            {
                name: '波蘭手工陶瓷擺飾',
                barcode: 'DECOR001',
                category: '裝飾品',
                price: 750,
                cost: 480,
                stock: 35,
                min_stock: 7,
                description: '精緻手工擺飾，增添居家美感',
                image_url: 'https://example.com/decor1.jpg',
                is_active: true
            },
            {
                name: '歐式陶瓷燭台',
                barcode: 'DECOR002',
                category: '裝飾品',
                price: 1200,
                cost: 780,
                stock: 18,
                min_stock: 4,
                description: '優雅燭台設計，營造浪漫氛圍',
                image_url: 'https://example.com/decor2.jpg',
                is_active: true
            },
            {
                name: '手工陶瓷相框',
                barcode: 'DECOR003',
                category: '裝飾品',
                price: 650,
                cost: 420,
                stock: 28,
                min_stock: 6,
                description: '溫馨陶瓷相框，珍藏美好回憶',
                image_url: 'https://example.com/decor3.jpg',
                is_active: true
            },
            
            // 廚房用品類 (3樣商品)
            {
                name: '波蘭手工陶瓷鍋具',
                barcode: 'KITCHEN001',
                category: '廚房用品',
                price: 2800,
                cost: 1800,
                stock: 12,
                min_stock: 2,
                description: '高品質陶瓷鍋具，健康烹飪首選',
                image_url: 'https://example.com/kitchen1.jpg',
                is_active: true
            },
            {
                name: '歐式陶瓷調味罐組',
                barcode: 'KITCHEN002',
                category: '廚房用品',
                price: 980,
                cost: 620,
                stock: 22,
                min_stock: 5,
                description: '實用調味罐組，廚房收納好幫手',
                image_url: 'https://example.com/kitchen2.jpg',
                is_active: true
            },
            {
                name: '手工陶瓷茶具組',
                barcode: 'KITCHEN003',
                category: '廚房用品',
                price: 1600,
                cost: 1000,
                stock: 16,
                min_stock: 3,
                description: '精緻茶具組，享受品茶時光',
                image_url: 'https://example.com/kitchen3.jpg',
                is_active: true
            },
            
            // 浴室用品類 (3樣商品)
            {
                name: '波蘭手工陶瓷牙刷架',
                barcode: 'BATH001',
                category: '浴室用品',
                price: 450,
                cost: 280,
                stock: 45,
                min_stock: 10,
                description: '實用牙刷架，保持浴室整潔',
                image_url: 'https://example.com/bath1.jpg',
                is_active: true
            },
            {
                name: '歐式陶瓷肥皂盒',
                barcode: 'BATH002',
                category: '浴室用品',
                price: 380,
                cost: 240,
                stock: 38,
                min_stock: 8,
                description: '優雅肥皂盒，浴室裝飾好物',
                image_url: 'https://example.com/bath2.jpg',
                is_active: true
            },
            {
                name: '手工陶瓷毛巾架',
                barcode: 'BATH003',
                category: '浴室用品',
                price: 720,
                cost: 460,
                stock: 25,
                min_stock: 5,
                description: '實用毛巾架，浴室收納必備',
                image_url: 'https://example.com/bath3.jpg',
                is_active: true
            }
        ];
        
        try {
            // 檢查是否已有商品資料
            const existingProducts = await this.getProducts();
            if (existingProducts && existingProducts.length > 0) {
                console.log('商品資料已存在，跳過初始化');
                return existingProducts;
            }
            
            // 批量新增商品
            const result = await DatabaseAPI.batchInsert('products', products);
            
            if (result) {
                console.log(`成功新增 ${result.length} 樣商品`);
                return result;
            } else {
                console.error('新增商品失敗');
                return null;
            }
        } catch (error) {
            console.error('初始化商品資料時發生錯誤:', error);
            return null;
        }
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
    // 初始化商品資料
    await BusinessAPI.initializeProducts();
}); 