// 資料庫連接和API管理
// 使用 Supabase 作為雲端資料庫

// Supabase 配置
const SUPABASE_URL = 'https://cgwhckykrlphnibmuvhz.supabase.co'; // 需要替換為您的Supabase URL
const SUPABASE_ANON_KEY = 'sb_publishable_ThaibxLrJdwUixK594BZYw_ad8axjFN'; // 需要替換為您的Supabase Anon Key

// 初始化 Supabase 客戶端
let supabase = null;
const PRODUCT_IMAGE_BUCKET = 'product-images';

// 初始化資料庫連接
async function initDatabase() {
    try {
        // 如果已經初始化過，直接返回
        if (supabase) {
            console.log('資料庫已經初始化');
            return true;
        }
        
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
            console.log(`準備插入資料到 ${tableName}:`, data);
            
            // 如果資料包含ID，使用指定的ID；否則讓Supabase自動生成
            const { data: result, error } = await supabase
                .from(tableName)
                .insert([data])
                .select();
            
            if (error) {
                console.error(`新增${tableName}資料失敗:`, error);
                console.error('錯誤詳情:', error.message, error.details, error.hint);
                return null;
            }
            
            console.log(`成功插入資料到 ${tableName}:`, result);
            return result[0];
        } catch (error) {
            console.error(`新增${tableName}資料時發生錯誤:`, error);
            return null;
        }
    }
    
    // 獲取表的主鍵欄位名稱
    static getTablePrimaryKey(tableName) {
        const primaryKeys = {
            'suppliers': 'number',  // 確認：Supabase中suppliers表的主鍵是number
            'employees': 'employee_id',
            'products': 'id',
            'categories': 'id',
            'sales_history': 'id',
            'purchase_history': 'id',
            'refunds': 'id',
            'members': 'id',
            'coupons': 'id',
            'employee_sessions': 'id'
        };
        return primaryKeys[tableName] || 'id';
    }

    // 更新資料
    static async updateData(tableName, id, data) {
        try {
            const primaryKey = this.getTablePrimaryKey(tableName);
            console.log(`更新${tableName}資料，使用主鍵: ${primaryKey}, 值: ${id}`);
            
            const { data: result, error } = await supabase
                .from(tableName)
                .update(data)
                .eq(primaryKey, id)
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
            // 檢查 Supabase 是否已初始化
            if (!supabase) {
                console.warn('Supabase 未初始化，無法刪除資料');
                return false;
            }
            
            const primaryKey = this.getTablePrimaryKey(tableName);
            console.log(`嘗試刪除 ${tableName} 中的記錄，使用主鍵: ${primaryKey}, 值: ${id}`);
            
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq(primaryKey, id);
            
            if (error) {
                console.error(`刪除${tableName}資料失敗:`, error);
                return false;
            }
            
            console.log(`成功刪除 ${tableName} 中的記錄，主鍵: ${primaryKey}, 值: ${id}`);
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
        console.log('BusinessAPI.addProduct 被調用，資料:', productData);
        try {
            // 嘗試帶 image_url 新增；若後端無該欄位，移除後重試
            let result = await DatabaseAPI.insertData('products', productData);
            if (!result && Object.prototype.hasOwnProperty.call(productData, 'image_url')) {
                try {
                    const fallbackData = { ...productData };
                    delete fallbackData.image_url;
                    console.warn('products 表可能沒有 image_url 欄位，嘗試不帶 image_url 重新新增');
                    result = await DatabaseAPI.insertData('products', fallbackData);
                } catch (e) {
                    console.error('fallback 新增商品失敗:', e);
                }
            }
            
            console.log('BusinessAPI.addProduct 結果:', result);
            
            // 如果成功，返回新商品的ID；如果失敗，返回false
            if (result && Array.isArray(result) && result.length > 0) {
                return result[0].id; // 返回新商品的ID
            } else if (result && result.id) {
                return result.id; // 如果返回的是單個物件
            } else {
                console.error('新增商品失敗，未返回有效的ID');
                return false;
            }
        } catch (error) {
            console.error('BusinessAPI.addProduct 發生錯誤:', error);
            return false;
        }
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

    // 圖片上傳到 Supabase Storage，回傳公開 URL
    static async uploadProductImage(file) {
        try {
            if (!supabase) {
                const ok = await initDatabase();
                if (!ok) throw new Error('資料庫未初始化');
            }
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            
            // 直接嘗試上傳，如果 bucket 不存在會自動報錯
            console.log('嘗試上傳圖片到 bucket:', PRODUCT_IMAGE_BUCKET);
            
            const { data, error } = await supabase
                .storage
                .from(PRODUCT_IMAGE_BUCKET)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type || 'image/jpeg'
                });
            if (error) {
                console.error('上傳圖片失敗:', error);
                return null;
            }
            const { data: pub } = supabase
                .storage
                .from(PRODUCT_IMAGE_BUCKET)
                .getPublicUrl(data.path);
            return pub?.publicUrl || null;
        } catch (error) {
            console.error('uploadProductImage 發生錯誤:', error);
            return null;
        }
    }
    
    // 分類管理
    static async getCategories() {
        return await DatabaseAPI.getData('categories');
    }
    
    static async addCategory(categoryData) {
        try {
            // 先檢查 categories 表的實際欄位結構
            const { data: tableCheck, error: tableError } = await supabase
                .from('categories')
                .select('*')
                .limit(1);
            
            if (tableError) {
                console.error('檢查 categories 表結構失敗:', tableError);
                return false;
            }
            
            // 根據實際表結構構建 payload
            const payload = {
                name: categoryData.name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 檢查並添加可選欄位
            if (tableCheck && tableCheck.length > 0) {
                const actualFields = Object.keys(tableCheck[0]);
                console.log('categories 表實際欄位:', actualFields);
                
                // 只添加存在的欄位
                if (actualFields.includes('description') && categoryData.description) {
                    payload.description = categoryData.description;
                }
                if (actualFields.includes('color') && categoryData.color) {
                    payload.color = categoryData.color;
                }
                if (actualFields.includes('order') && categoryData.order !== undefined) {
                    payload.order = categoryData.order;
                }
            }
            
            console.log('準備插入 categories 資料:', payload);
            return await DatabaseAPI.insertData('categories', payload);
        } catch (error) {
            console.error('新增分類時發生錯誤:', error);
            return false;
        }
    }
    
    static async updateCategory(id, categoryData) {
        try {
            // 先檢查 categories 表的實際欄位結構
            const { data: tableCheck, error: tableError } = await supabase
                .from('categories')
                .select('*')
                .limit(1);
            
            if (tableError) {
                console.error('檢查 categories 表結構失敗:', tableError);
                return false;
            }
            
            // 根據實際表結構構建 payload
            const payload = {
                name: categoryData.name,
                updated_at: new Date().toISOString()
            };
            
            // 檢查並添加可選欄位
            if (tableCheck && tableCheck.length > 0) {
                const actualFields = Object.keys(tableCheck[0]);
                console.log('categories 表實際欄位:', actualFields);
                
                // 只添加存在的欄位
                if (actualFields.includes('description')) {
                    payload.description = categoryData.description || '';
                }
                if (actualFields.includes('color')) {
                    payload.color = categoryData.color || '';
                }
                if (actualFields.includes('order')) {
                    payload.order = categoryData.order !== undefined ? categoryData.order : 0;
                }
            }
            
            console.log('準備更新 categories 資料:', payload);
            return await DatabaseAPI.updateData('categories', id, payload);
        } catch (error) {
            console.error('更新分類時發生錯誤:', error);
            return false;
        }
    }
    
    static async deleteCategory(id) {
        return await DatabaseAPI.deleteData('categories', id);
    }

    // 進貨管理
    static async getPurchaseHistory() {
        try {
            return await DatabaseAPI.getData('purchase_history');
        } catch (error) {
            console.warn('purchase_history 表不存在，返回空數組:', error.message);
            return [];
        }
    }
    
    static async getPurchaseHistoryByProduct(productId) {
        try {
            const { data, error } = await supabase
                .from('purchase_history')
                .select('*')
                .eq('product_id', productId);
            
            if (error) {
                console.error('獲取商品進貨記錄失敗:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('獲取商品進貨記錄時發生錯誤:', error);
            return [];
        }
    }
    
    static async getPurchaseHistoryByDateRange(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('purchase_history')
                .select('*')
                .gte('purchase_date', startDate)
                .lte('purchase_date', endDate);
            
            if (error) {
                console.error('獲取日期範圍進貨記錄失敗:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('獲取日期範圍進貨記錄時發生錯誤:', error);
            return [];
        }
    }
    
    static async addPurchaseRecord(purchaseData) {
        return await DatabaseAPI.insertData('purchase_history', {
            ...purchaseData,
            purchase_date: purchaseData.purchase_date || new Date().toISOString(),
            created_at: new Date().toISOString()
        });
    }
    
    static async updatePurchaseRecord(id, purchaseData) {
        return await DatabaseAPI.updateData('purchase_history', id, {
            ...purchaseData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deletePurchaseRecord(id) {
        return await DatabaseAPI.deleteData('purchase_history', id);
    }
    
    // 退貨管理
    static async getRefunds() {
        return await DatabaseAPI.getData('refunds');
    }
    
    static async getRefundsByDateRange(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('refunds')
                .select('*')
                .gte('refund_date', startDate)
                .lte('refund_date', endDate);
            
            if (error) {
                console.error('獲取日期範圍退貨記錄失敗:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('獲取日期範圍退貨記錄時發生錯誤:', error);
            return [];
        }
    }
    
    static async addRefund(refundData) {
        return await DatabaseAPI.insertData('refunds', {
            ...refundData,
            refund_date: refundData.refund_date || new Date().toISOString(),
            created_at: new Date().toISOString()
        });
    }
    
    static async updateRefund(id, refundData) {
        return await DatabaseAPI.updateData('refunds', id, {
            ...refundData,
            updated_at: new Date().toISOString()
        });
    }
    
    static async deleteRefund(id) {
        return await DatabaseAPI.deleteData('refunds', id);
    }
    
    // 會員管理
    static async getMembers() {
        return await DatabaseAPI.getData('members');
    }
    
    static async addMember(memberData) {
        console.log('BusinessAPI.addMember 被調用，資料:', memberData);
        try {
            // 動態檢查 members 表的實際欄位
            const sampleData = await DatabaseAPI.getData('members', { limit: 1 });
            console.log('members 表範例資料:', sampleData);
            
            // 根據實際欄位構建 payload
            const payload = {
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 只包含實際存在的欄位
            const allowedFields = ['id', 'name', 'phone', 'email', 'birth_date', 'level', 'points', 'status', 'address', 'notes'];
            allowedFields.forEach(field => {
                if (memberData.hasOwnProperty(field)) {
                    payload[field] = memberData[field];
                }
            });
            
            console.log('準備插入的 members 資料:', payload);
            const result = await DatabaseAPI.insertData('members', payload);
            console.log('BusinessAPI.addMember 結果:', result);
            return result;
        } catch (error) {
            console.error('BusinessAPI.addMember 發生錯誤:', error);
            return false;
        }
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
        try {
            console.log(`🗑️ deleteSupplier 被調用，ID: ${id}, 類型: ${typeof id}`);
            
            // 獲取供應商信息（用於更新商品記錄）
            const { data: supplierData, error: supplierError } = await supabase
                .from('suppliers')
                .select('name, number')
                .eq('number', id)
                .single();
            
            if (supplierError || !supplierData) {
                console.error('獲取供應商信息失敗:', supplierError);
                return false;
            }
            
            const supplierName = supplierData.name;
            const originalSupplierId = supplierData.number;
            console.log(`🗑️ 要刪除的供應商: ${supplierName} (ID: ${originalSupplierId})`);
            
            // 檢查 products 表中是否有引用此供應商的商品
            const { data: productRecords, error: productCheckError } = await supabase
                .from('products')
                .select('id')
                .eq('supplier', supplierName)
                .limit(1);
            
            if (productCheckError) {
                console.error('檢查商品相關記錄失敗:', productCheckError);
                return false;
            }
            
            // 如果有商品引用此供應商，需要先創建一個特殊的"已刪除供應商"記錄
            if (productRecords && productRecords.length > 0) {
                console.log(`發現 ${productRecords.length} 個商品引用此供應商`);
                
                // 檢查是否已經存在"已刪除供應商"記錄
                const { data: deletedSupplier, error: deletedCheckError } = await supabase
                    .from('suppliers')
                    .select('number')
                    .eq('name', '已刪除供應商')
                    .single();
                
                if (deletedCheckError || !deletedSupplier) {
                    // 創建"已刪除供應商"記錄
                    console.log('創建"已刪除供應商"記錄...');
                    const { data: newSupplier, error: createError } = await supabase
                        .from('suppliers')
                        .insert([{
                            number: 999999, // 使用一個特殊編號
                            name: '已刪除供應商',
                            contact_person: '',
                            phone: '',
                            email: '',
                            address: '',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('創建"已刪除供應商"記錄失敗:', createError);
                        return false;
                    }
                    
                    console.log('✅ "已刪除供應商"記錄創建成功');
                } else {
                    console.log('✅ "已刪除供應商"記錄已存在');
                }
                
                // 更新商品記錄中的供應商名稱
                console.log('更新商品記錄中的供應商...');
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ 
                        supplier: '已刪除供應商'
                    })
                    .eq('supplier', supplierName);
                
                if (updateError) {
                    console.error('更新商品記錄失敗:', updateError);
                    return false;
                }
                
                console.log('商品記錄更新成功');
            }
            
            // 檢查 purchase_history 表是否存在
            const { data: testData, error: testError } = await supabase
                .from('purchase_history')
                .select('*')
                .limit(1);
            
            if (!testError) {
                // 表存在，檢查是否有相關進貨記錄
                const { data: purchaseRecords, error: checkError } = await supabase
                    .from('purchase_history')
                    .select('id')
                    .eq('supplier_id', originalSupplierId)
                    .limit(1);
                
                if (!checkError && purchaseRecords && purchaseRecords.length > 0) {
                    console.log(`發現相關進貨記錄，更新為"已刪除供應商"`);
                    
                    const { error: updateError } = await supabase
                        .from('purchase_history')
                        .update({ 
                            supplier_id: 'deleted_supplier',
                            supplier_name: '已刪除供應商'
                        })
                        .eq('supplier_id', originalSupplierId);
                    
                    if (updateError) {
                        console.error('更新進貨記錄失敗:', updateError);
                        // 即使更新失敗，也嘗試直接刪除
                    }
                }
            }
            
            // 最後刪除原始供應商（不是999999）
            console.log(`🗑️ 準備刪除原始供應商，ID: ${originalSupplierId}`);
            return await DatabaseAPI.deleteData('suppliers', originalSupplierId);
        } catch (error) {
            console.error('刪除供應商時發生錯誤:', error);
            return false;
        }
    }
}

// 資料庫狀態管理
class DatabaseManager {
    static isInitialized = false;
    static connectionStatus = 'disconnected';
    
    // 初始化資料庫
    static async initialize() {
        if (this.isInitialized && supabase) {
            console.log('資料庫管理器已經初始化');
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
    // 初始化完成後再暴露 supabase 客戶端到全域
    window.supabase = supabase;
    console.log('✅ window.supabase 已設置:', !!window.supabase);
}); 