// 銷售記錄遷移工具
// 將 localStorage 的銷售記錄遷移到 Supabase 資料庫

class SalesMigration {
    
    // 檢查是否有本地銷售記錄
    static checkLocalSalesData() {
        const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
        const lastReceiptNumber = localStorage.getItem('lastReceiptNumber');
        
        return {
            hasData: salesHistory.length > 0,
            count: salesHistory.length,
            lastReceiptNumber: lastReceiptNumber,
            data: salesHistory
        };
    }
    
    // 遷移單筆銷售記錄
    static async migrateSaleRecord(saleRecord) {
        try {
            // 轉換資料格式以符合 Supabase 結構
            const supabaseRecord = {
                receiptNumber: saleRecord.receiptNumber,
                date: saleRecord.date,
                items: saleRecord.items,
                subtotal: saleRecord.subtotal,
                memberDiscount: saleRecord.memberDiscount || 0,
                couponDiscount: saleRecord.couponDiscount || 0,
                tax: saleRecord.tax || 0,
                total: saleRecord.total,
                paymentMethod: saleRecord.paymentMethod,
                receivedAmount: saleRecord.receivedAmount || saleRecord.total,
                change: saleRecord.change || 0,
                cashier: saleRecord.cashier,
                member: saleRecord.member,
                coupon: saleRecord.coupon
            };
            
            // 儲存到 Supabase
            const result = await BusinessAPI.addSale(supabaseRecord);
            console.log(`銷售記錄 ${saleRecord.receiptNumber} 遷移成功:`, result);
            return result;
            
        } catch (error) {
            console.error(`銷售記錄 ${saleRecord.receiptNumber} 遷移失敗:`, error);
            throw error;
        }
    }
    
    // 遷移所有銷售記錄
    static async migrateAllSales() {
        const localData = this.checkLocalSalesData();
        
        if (!localData.hasData) {
            console.log('沒有發現本地銷售記錄，無需遷移');
            return { success: true, migrated: 0, errors: 0 };
        }
        
        console.log(`開始遷移 ${localData.count} 筆銷售記錄...`);
        
        let migrated = 0;
        let errors = 0;
        const errorsList = [];
        
        // 顯示進度
        this.showMigrationProgress(0, localData.count, '開始遷移銷售記錄...');
        
        for (let i = 0; i < localData.data.length; i++) {
            try {
                await this.migrateSaleRecord(localData.data[i]);
                migrated++;
                
                // 更新進度
                this.showMigrationProgress(i + 1, localData.count, 
                    `已遷移 ${migrated} 筆記錄...`);
                
                // 避免過於頻繁的 API 呼叫
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                errors++;
                errorsList.push({
                    receiptNumber: localData.data[i].receiptNumber,
                    error: error.message
                });
                
                console.error(`第 ${i + 1} 筆記錄遷移失敗:`, error);
            }
        }
        
        // 遷移完成後更新最後收據號碼
        if (migrated > 0 && localData.lastReceiptNumber) {
            try {
                // 將最後收據號碼儲存到 Supabase（可以創建一個設定表）
                localStorage.setItem('supabase_lastReceiptNumber', localData.lastReceiptNumber);
                console.log('最後收據號碼已更新');
            } catch (error) {
                console.warn('更新最後收據號碼失敗:', error);
            }
        }
        
        const result = {
            success: errors === 0,
            migrated: migrated,
            errors: errors,
            total: localData.count,
            errorsList: errorsList
        };
        
        console.log('銷售記錄遷移完成:', result);
        return result;
    }
    
    // 顯示遷移進度
    static showMigrationProgress(current, total, message) {
        const progress = Math.round((current / total) * 100);
        console.log(`[${progress}%] ${message} (${current}/${total})`);
        
        // 如果有 UI 元素，可以更新進度條
        const progressElement = document.getElementById('migrationProgress');
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
            progressElement.textContent = `${progress}%`;
        }
        
        const messageElement = document.getElementById('migrationMessage');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
    
    // 清除本地銷售記錄（遷移完成後）
    static clearLocalSalesData() {
        try {
            localStorage.removeItem('salesHistory');
            localStorage.removeItem('lastReceiptNumber');
            console.log('本地銷售記錄已清除');
            return true;
        } catch (error) {
            console.error('清除本地銷售記錄失敗:', error);
            return false;
        }
    }
    
    // 驗證遷移結果
    static async validateMigration() {
        try {
            const supabaseSales = await BusinessAPI.getSalesHistory();
            const localData = this.checkLocalSalesData();
            
            console.log('遷移驗證結果:');
            console.log('- Supabase 記錄數:', supabaseSales.length);
            console.log('- 本地記錄數:', localData.count);
            
            return {
                supabaseCount: supabaseSales.length,
                localCount: localData.count,
                isValid: supabaseSales.length >= localData.count
            };
            
        } catch (error) {
            console.error('驗證遷移結果失敗:', error);
            return { isValid: false, error: error.message };
        }
    }
    
    // 創建遷移 UI
    static createMigrationUI() {
        const container = document.createElement('div');
        container.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        container.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-database text-blue-500 mr-2"></i>
                    銷售記錄遷移
                </h3>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>遷移進度</span>
                        <span id="migrationProgress">0%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div id="migrationProgressBar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>
                
                <div id="migrationMessage" class="text-sm text-gray-600 mb-4">
                    準備開始遷移...
                </div>
                
                <div class="flex space-x-3">
                    <button id="startMigration" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        開始遷移
                    </button>
                    <button id="cancelMigration" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                        取消
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // 綁定事件
        document.getElementById('startMigration').onclick = async () => {
            const result = await this.migrateAllSales();
            this.showMigrationResult(result);
        };
        
        document.getElementById('cancelMigration').onclick = () => {
            document.body.removeChild(container);
        };
        
        return container;
    }
    
    // 顯示遷移結果
    static showMigrationResult(result) {
        const container = document.querySelector('.fixed.inset-0');
        if (!container) return;
        
        const content = container.querySelector('.bg-white');
        content.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                <i class="fas ${result.success ? 'fa-check-circle text-green-500' : 'fa-exclamation-triangle text-yellow-500'} mr-2"></i>
                遷移完成
            </h3>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>總記錄數:</span>
                    <span>${result.total}</span>
                </div>
                <div class="flex justify-between">
                    <span>成功遷移:</span>
                    <span class="text-green-600">${result.migrated}</span>
                </div>
                <div class="flex justify-between">
                    <span>失敗記錄:</span>
                    <span class="text-red-600">${result.errors}</span>
                </div>
            </div>
            
            ${result.errors > 0 ? `
            <div class="mt-4 p-3 bg-red-50 rounded-lg">
                <div class="text-sm text-red-700">
                    <strong>失敗記錄:</strong>
                    <ul class="mt-2 space-y-1">
                        ${result.errorsList.map(error => `
                            <li>收據號碼 ${error.receiptNumber}: ${error.error}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
            
            <div class="flex space-x-3 mt-4">
                <button onclick="document.body.removeChild(this.closest('.fixed'))" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    確定
                </button>
            </div>
        `;
    }
}

// 向全域暴露 API
window.SalesMigration = SalesMigration;

// 自動檢查是否需要遷移銷售記錄
document.addEventListener('DOMContentLoaded', async function() {
    await DatabaseManager.initialize();
    
    const localData = SalesMigration.checkLocalSalesData();
    if (localData.hasData) {
        console.log(`發現 ${localData.count} 筆本地銷售記錄，建議進行遷移`);
        
        // 可以選擇自動顯示遷移提示
        // SalesMigration.createMigrationUI();
    } else {
        console.log('沒有發現本地銷售記錄，無需遷移');
    }
}); 