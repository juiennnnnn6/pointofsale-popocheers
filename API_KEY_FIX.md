# 🔧 Supabase API Key 修復指南

## 🚨 問題：Invalid API key

這個錯誤通常由以下原因造成：

### 1. **API Key 已過期或被重置**
- Supabase 可能會定期重置 API Key
- 需要重新獲取新的 API Key

### 2. **專案設定問題**
- 專案可能被暫停或刪除
- 需要檢查專案狀態

### 3. **網路連接問題**
- 防火牆或網路設定阻擋連接
- 需要檢查網路連接

## 🔍 診斷步驟

### 步驟 1：檢查 Supabase 專案狀態

1. **登入 Supabase 控制台**
   - 前往 https://supabase.com/dashboard
   - 登入您的帳號

2. **檢查專案狀態**
   - 確認專案 `cgwhckykrlphnibmuvhz` 仍然存在
   - 檢查專案是否處於活躍狀態

### 步驟 2：重新獲取 API Key

1. **進入專案設定**
   - 在 Supabase 控制台點擊您的專案
   - 前往 **Settings** → **API**

2. **複製新的 API Key**
   - 找到 **Project API keys** 區段
   - 複製 **anon public** key
   - 格式應該類似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **更新程式碼**
   - 開啟 `database.js` 檔案
   - 更新 `SUPABASE_ANON_KEY` 的值

### 步驟 3：驗證連接

1. **使用診斷工具**
   - 開啟 `supabase-diagnostic.html`
   - 點擊「開始診斷」
   - 檢查所有測試項目

2. **手動測試**
   ```javascript
   // 在瀏覽器控制台執行
   const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
   const supabase = createClient('https://cgwhckykrlphnibmuvhz.supabase.co', 'YOUR_NEW_API_KEY');
   
   // 測試連接
   const { data, error } = await supabase.from('products').select('count').limit(1);
   console.log('連接結果:', { data, error });
   ```

## 🛠️ 常見解決方案

### 方案 1：重新生成 API Key
```bash
# 在 Supabase 控制台
1. Settings → API
2. 點擊 "Regenerate" 按鈕
3. 複製新的 anon public key
4. 更新 database.js
```

### 方案 2：檢查專案 URL
```javascript
// 確認 URL 格式正確
const SUPABASE_URL = 'https://cgwhckykrlphnibmuvhz.supabase.co';
// 注意：不要包含結尾的斜線
```

### 方案 3：檢查網路連接
```javascript
// 測試基本連接
fetch('https://cgwhckykrlphnibmuvhz.supabase.co/rest/v1/')
  .then(response => console.log('連接成功'))
  .catch(error => console.log('連接失敗:', error));
```

## 📋 檢查清單

- [ ] Supabase 專案仍然存在
- [ ] 專案狀態為活躍
- [ ] API Key 格式正確（以 `eyJ` 開頭）
- [ ] URL 格式正確
- [ ] 網路連接正常
- [ ] 沒有防火牆阻擋

## 🆘 如果問題持續

1. **創建新專案**
   - 如果原專案有問題，可以創建新的 Supabase 專案
   - 更新 URL 和 API Key

2. **檢查 Supabase 服務狀態**
   - 前往 https://status.supabase.com
   - 確認服務正常運作

3. **聯繫支援**
   - 如果以上步驟都無法解決
   - 可能需要聯繫 Supabase 支援

## 🔄 更新程式碼範例

```javascript
// database.js
const SUPABASE_URL = 'https://YOUR_NEW_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_NEW_ANON_KEY';

// 測試連接
async function testConnection() {
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        const { data, error } = await supabase.from('products').select('count').limit(1);
        
        if (error) {
            console.error('連接失敗:', error);
            return false;
        } else {
            console.log('連接成功');
            return true;
        }
    } catch (error) {
        console.error('初始化失敗:', error);
        return false;
    }
}
```

## ✅ 成功指標

當修復成功時，您應該看到：
- ✅ 診斷工具顯示「連接成功」
- ✅ 可以正常讀取/寫入資料
- ✅ 沒有 "Invalid API key" 錯誤
- ✅ 所有資料表都能正常存取 