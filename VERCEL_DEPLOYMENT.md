# Vercel 部署指南

## 🚀 快速部署到 Vercel

### 方法一：使用 Vercel CLI（推薦）

1. **安裝 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登入 Vercel**
   ```bash
   vercel login
   ```

3. **部署項目**
   ```bash
   vercel
   ```

### 方法二：使用 GitHub 自動部署

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "準備 Vercel 部署"
   git push origin master
   ```

2. **在 Vercel 網站部署**
   - 訪問 [vercel.com](https://vercel.com)
   - 使用 GitHub 帳號登入
   - 點擊 "New Project"
   - 選擇您的 GitHub 倉庫
   - 點擊 "Deploy"

### 方法三：直接上傳

1. 訪問 [vercel.com](https://vercel.com)
2. 註冊/登入帳號
3. 點擊 "New Project"
4. 選擇 "Upload" 選項
5. 上傳您的項目文件夾

## 📱 多裝置同步

### 在任何裝置上訪問您的系統

部署完成後，您會獲得一個類似這樣的網址：
```
https://your-project-name.vercel.app
```

### 在不同裝置上使用

1. **電腦**：直接在瀏覽器中訪問部署網址
2. **手機**：在手機瀏覽器中訪問相同網址
3. **平板**：在任何裝置上都能同步使用

## 🔄 自動同步更新

### 每次推送代碼都會自動更新

1. 在本地修改代碼
2. 推送到 GitHub：
   ```bash
   git add .
   git commit -m "更新功能"
   git push origin master
   ```
3. Vercel 會自動檢測並重新部署

## 📋 部署檢查清單

- [ ] 項目已推送到 GitHub
- [ ] 創建了 vercel.json 配置文件
- [ ] 在 Vercel 上連接了 GitHub 倉庫
- [ ] 部署成功並獲得網址
- [ ] 測試所有功能正常運作

## 🛠️ 故障排除

### 如果部署失敗：

1. **檢查文件結構**：確保 index.html 在根目錄
2. **檢查 vercel.json**：確保配置正確
3. **查看部署日誌**：在 Vercel 控制台查看錯誤信息

### 如果功能不正常：

1. **檢查瀏覽器控制台**：查看 JavaScript 錯誤
2. **檢查 localStorage**：確保數據存儲正常
3. **清除瀏覽器緩存**：重新載入頁面

## 🌐 自定義域名（可選）

1. 在 Vercel 控制台點擊您的項目
2. 進入 "Settings" > "Domains"
3. 添加您的自定義域名
4. 按照指示配置 DNS

## 📊 監控和分析

- **訪問統計**：在 Vercel 控制台查看訪問量
- **性能監控**：查看頁面載入速度
- **錯誤追蹤**：監控部署狀態

---

**注意**：部署後，您的進銷存系統將可以在任何裝置上通過網址訪問，實現真正的跨裝置同步！ 