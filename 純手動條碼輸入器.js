/**
 * 純手動條碼輸入器
 * 移除所有攝像頭功能，專注於可靠的手動輸入
 */

class PureBarcodeInput {
    constructor() {
        this.onScanSuccess = null;
    }

    /**
     * 創建純手動輸入模態框
     */
    createInputModal() {
        // 如果模態框已存在，直接顯示
        const existingModal = document.getElementById('pureInputModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            document.getElementById('pureManualInput').focus();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'pureInputModal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75';
        modal.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-md mx-4 p-6">
                <!-- 標題 -->
                <div class="text-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-barcode mr-2 text-blue-500"></i>
                        條碼輸入
                    </h3>
                    <p class="text-sm text-green-600 font-medium">
                        <i class="fas fa-check-circle mr-1"></i>
                        100% 可靠，快速穩定
                    </p>
                </div>

                <!-- 手動輸入區 -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                        <i class="fas fa-keyboard mr-2"></i>輸入條碼號碼
                    </label>
                    <div class="flex space-x-3">
                        <input type="text" 
                               id="pureManualInput" 
                               placeholder="請輸入條碼號碼" 
                               class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                               autocomplete="off"
                               maxlength="20">
                        <button id="pureSubmitBtn" 
                                class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium">
                            <i class="fas fa-check mr-2"></i>確認
                        </button>
                    </div>
                    <div class="text-xs text-gray-500 mt-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        支援各種條碼格式，建議8-20位數字
                    </div>
                </div>

                <!-- 快捷測試按鈕 -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                        <i class="fas fa-lightning-bolt mr-2"></i>快速測試
                    </label>
                    <div class="grid grid-cols-1 gap-2">
                        <button onclick="usePureBarcode('1234567890123')" 
                                class="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors border">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-mono text-sm text-blue-600">1234567890123</div>
                                    <div class="text-xs text-gray-600">Nike Air Max 270</div>
                                </div>
                                <i class="fas fa-arrow-right text-gray-400"></i>
                            </div>
                        </button>
                        <button onclick="usePureBarcode('2345678901234')" 
                                class="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors border">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-mono text-sm text-blue-600">2345678901234</div>
                                    <div class="text-xs text-gray-600">Apple Watch Series 9</div>
                                </div>
                                <i class="fas fa-arrow-right text-gray-400"></i>
                            </div>
                        </button>
                        <button onclick="usePureBarcode('3456789012345')" 
                                class="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors border">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-mono text-sm text-blue-600">3456789012345</div>
                                    <div class="text-xs text-gray-600">Samsung Galaxy S24</div>
                                </div>
                                <i class="fas fa-arrow-right text-gray-400"></i>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- 清空按鈕 -->
                <div class="mb-6">
                    <button id="pureClearBtn" 
                            class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        <i class="fas fa-eraser mr-2"></i>清空輸入
                    </button>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex justify-between items-center">
                    <button id="pureCloseBtn" 
                            class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                        <i class="fas fa-times mr-2"></i>關閉
                    </button>
                    <div class="text-xs text-green-600 flex items-center">
                        <i class="fas fa-shield-alt mr-1"></i>
                        無需攝像頭權限
                    </div>
                </div>

                <!-- 優勢提示 -->
                <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div class="text-xs text-green-700 space-y-1">
                        <div class="flex items-center">
                            <i class="fas fa-rocket mr-2 text-green-500"></i>
                            <span class="font-medium">速度快：</span>熟練後比掃描更快
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check-circle mr-2 text-green-500"></i>
                            <span class="font-medium">100% 成功：</span>不受任何環境影響
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-universal-access mr-2 text-green-500"></i>
                            <span class="font-medium">通用性：</span>適用所有設備和瀏覽器
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindPureEvents();
        
        // 自動聚焦到輸入框
        setTimeout(() => {
            document.getElementById('pureManualInput').focus();
        }, 100);
    }

    /**
     * 綁定事件
     */
    bindPureEvents() {
        // 手動輸入確認
        document.getElementById('pureSubmitBtn').addEventListener('click', () => {
            this.handleManualInput();
        });

        // Enter 鍵確認
        document.getElementById('pureManualInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleManualInput();
            }
        });

        // 清空輸入
        document.getElementById('pureClearBtn').addEventListener('click', () => {
            document.getElementById('pureManualInput').value = '';
            document.getElementById('pureManualInput').focus();
            this.showMessage('輸入已清空', 'info');
        });

        // 關閉模態框
        document.getElementById('pureCloseBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // 點擊背景關閉
        document.getElementById('pureInputModal').addEventListener('click', (e) => {
            if (e.target.id === 'pureInputModal') {
                this.closeModal();
            }
        });

        // 實時驗證輸入
        document.getElementById('pureManualInput').addEventListener('input', (e) => {
            this.validateInput(e.target);
        });
    }

    /**
     * 實時驗證輸入
     */
    validateInput(input) {
        const value = input.value.trim();
        const submitBtn = document.getElementById('pureSubmitBtn');
        
        // 移除非數字字符（可選，根據需求調整）
        const cleanValue = value.replace(/[^0-9]/g, '');
        if (cleanValue !== value) {
            input.value = cleanValue;
        }
        
        // 按鈕狀態
        if (cleanValue.length >= 8) {
            submitBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            submitBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            submitBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            submitBtn.disabled = true;
        }
    }

    /**
     * 處理手動輸入
     */
    handleManualInput() {
        const input = document.getElementById('pureManualInput');
        const barcode = input.value.trim();
        
        if (!barcode) {
            this.showMessage('請輸入條碼號碼', 'warning');
            input.focus();
            return;
        }

        if (barcode.length < 8) {
            this.showMessage('條碼長度至少需要8位數字', 'warning');
            input.focus();
            return;
        }

        if (barcode.length > 20) {
            this.showMessage('條碼長度不能超過20位數字', 'warning');
            input.focus();
            return;
        }

        // 成功處理
        this.showMessage('條碼輸入成功！', 'success');
        
        if (this.onScanSuccess) {
            this.onScanSuccess(barcode);
        }
        
        setTimeout(() => {
            this.closeModal();
        }, 1200);
    }

    /**
     * 顯示訊息
     */
    showMessage(message, type = 'info') {
        const existingMsg = document.querySelector('.pure-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `pure-message fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        msgDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    type === 'error' ? 'fa-times-circle' :
                    'fa-info-circle'
                } mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.remove();
        }, 3000);
    }

    /**
     * 關閉模態框
     */
    closeModal() {
        const modal = document.getElementById('pureInputModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 開始輸入
     */
    startInput(callback) {
        this.onScanSuccess = callback;
        this.createInputModal();
    }
}

// 全域函數
function usePureBarcode(barcode) {
    const input = document.getElementById('pureManualInput');
    if (input) {
        input.value = barcode;
        input.focus();
        // 觸發驗證
        input.dispatchEvent(new Event('input'));
    }
}

// 全域條碼輸入器實例
window.pureBarcodeInput = new PureBarcodeInput();

// 兼容原有的函數
function openBarcodeScanner(callback) {
    window.pureBarcodeInput.startInput(callback);
}

// 新的純手動函數
function openBarcodeInput(callback) {
    window.pureBarcodeInput.startInput(callback);
}

console.log('✅ 純手動條碼輸入器載入完成 - 無攝像頭，100% 可靠'); 