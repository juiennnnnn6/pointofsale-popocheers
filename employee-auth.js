// 員工認證系統
// 使用 Supabase 管理員工登入狀態，支援多裝置同步

class EmployeeAuth {
    static currentEmployee = null;
    static sessionKey = 'employee_session';
    
    // 初始化認證系統
    static async initialize() {
        try {
            // 檢查是否有現有的登入會話
            const session = this.getSession();
            if (session) {
                // 驗證會話是否仍然有效
                const isValid = await this.validateSession(session);
                if (isValid) {
                    this.currentEmployee = session.employee;
                    return true;
                } else {
                    // 會話無效，清除本地儲存
                    this.clearSession();
                }
            }
            return false;
        } catch (error) {
            console.error('認證系統初始化失敗:', error);
            return false;
        }
    }
    
    // 員工登入
    static async login(employeeId) {
        try {
            // 直接創建 Supabase 客戶端
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(
                'https://cgwhckykrlphnibmuvhz.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODMsImV4cCI6MjA2ODY3NjU4M30.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'
            );
            
            console.log('開始查詢員工:', employeeId);
            
            // 先嘗試用 employee_id 欄位查找
            let { data: employee, error } = await supabase
                .from('employees')
                .select('*')
                .eq('employee_id', employeeId)
                .single();
            
            // 如果找不到，嘗試用 username 欄位查找（舊格式）
            if (error || !employee) {
                const { data: oldEmployee, error: oldError } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('username', employeeId)
                    .single();
                
                if (oldError || !oldEmployee) {
                    throw new Error('員工編號不存在');
                }
                
                employee = oldEmployee;
            }
            
            // 確保員工資料有正確的欄位
            const normalizedEmployee = {
                id: employee.id,
                employee_id: employee.employee_id || employee.username || employeeId,
                name: employee.name,
                position: employee.position || employee.role || '員工',
                permissions: employee.permissions || '{}'
            };
            
            // 創建登入會話
            const session = {
                employee: normalizedEmployee,
                loginTime: new Date().toISOString(),
                sessionId: this.generateSessionId(),
                deviceInfo: this.getDeviceInfo()
            };
            
            // 暫時禁用會話儲存到 Supabase（避免 employee_sessions 表問題）
            try {
                const { error: sessionError } = await supabase
                    .from('employee_sessions')
                    .insert([{
                        session_id: session.sessionId,
                        employee_id: employee.id,
                        login_time: session.loginTime,
                        device_info: JSON.stringify(session.deviceInfo),
                        is_active: true
                    }]);
                
                if (sessionError) {
                    console.warn('會話儲存失敗，但登入繼續:', sessionError);
                }
            } catch (sessionError) {
                console.warn('會話儲存失敗，但登入繼續:', sessionError);
            }
            
            // 儲存到本地
            this.saveSession(session);
            this.currentEmployee = normalizedEmployee;
            
            console.log('員工登入成功:', normalizedEmployee.name);
            return normalizedEmployee;
            
        } catch (error) {
            console.error('員工登入失敗:', error);
            throw error;
        }
    }
    
    // 員工登出
    static async logout() {
        try {
            const session = this.getSession();
            if (session) {
                // 標記會話為非活躍
                try {
                    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                    const supabase = createClient(
                        'https://cgwhckykrlphnibmuvhz.supabase.co',
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODMsImV4cCI6MjA2ODY3NjU4M30.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'
                    );
                    
                    await supabase
                        .from('employee_sessions')
                        .update({ is_active: false, logout_time: new Date().toISOString() })
                        .eq('session_id', session.sessionId);
                } catch (error) {
                    console.warn('會話登出失敗，但繼續清除本地狀態:', error);
                }
            }
            
            // 清除本地會話
            this.clearSession();
            this.currentEmployee = null;
            
            console.log('員工登出成功');
            return true;
            
        } catch (error) {
            console.error('員工登出失敗:', error);
            // 即使清除會話失敗，也要清除本地狀態
            this.clearSession();
            this.currentEmployee = null;
            return false;
        }
    }
    
    // 檢查是否已登入
    static isLoggedIn() {
        return this.currentEmployee !== null;
    }
    
    // 獲取當前員工資訊
    static getCurrentEmployee() {
        return this.currentEmployee;
    }
    
    // 檢查權限
    static hasPermission(requiredRoles) {
        if (!this.currentEmployee) {
            return false;
        }
        
        // 管理員擁有所有權限
        if (this.currentEmployee.position === '管理員') {
            return true;
        }
        
        // 檢查特定權限
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.includes(this.currentEmployee.position);
        }
        
        return false;
    }
    
    // 驗證會話
    static async validateSession(session) {
        try {
            // 直接創建 Supabase 客戶端
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(
                'https://cgwhckykrlphnibmuvhz.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODMsImV4cCI6MjA2ODY3NjU4M30.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'
            );
            
            // 檢查會話是否仍然活躍
            const { data, error } = await supabase
                .from('employee_sessions')
                .select('is_active, logout_time')
                .eq('session_id', session.sessionId)
                .single();
            
            if (error || !data) {
                return false;
            }
            
            // 檢查會話是否被登出
            if (!data.is_active || data.logout_time) {
                return false;
            }
            
            // 檢查會話是否過期（24小時）
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                // 會話過期，標記為非活躍
                try {
                    await supabase
                        .from('employee_sessions')
                        .update({ is_active: false, logout_time: now.toISOString() })
                        .eq('session_id', session.sessionId);
                } catch (error) {
                    console.warn('會話過期標記失敗:', error);
                }
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('會話驗證失敗:', error);
            return false;
        }
    }
    
    // 生成會話 ID
    static generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 獲取裝置資訊
    static getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenSize: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };
    }
    
    // 儲存會話到本地
    static saveSession(session) {
        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        } catch (error) {
            console.error('儲存會話失敗:', error);
        }
    }
    
    // 從本地獲取會話
    static getSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('獲取會話失敗:', error);
            return null;
        }
    }
    
    // 清除本地會話
    static clearSession() {
        try {
            localStorage.removeItem(this.sessionKey);
        } catch (error) {
            console.error('清除會話失敗:', error);
        }
    }
    
    // 獲取所有活躍會話
    static async getActiveSessions() {
        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(
                'https://cgwhckykrlphnibmuvhz.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODMsImV4cCI6MjA2ODY3NjU4M30.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'
            );
            
            const { data, error } = await supabase
                .from('employee_sessions')
                .select(`
                    *,
                    employees (name, position)
                `)
                .eq('is_active', true)
                .order('login_time', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            return data;
            
        } catch (error) {
            console.error('獲取活躍會話失敗:', error);
            return [];
        }
    }
    
    // 強制登出其他裝置
    static async logoutOtherDevices() {
        try {
            const session = this.getSession();
            if (!session) return;
            
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(
                'https://cgwhckykrlphnibmuvhz.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODMsImV4cCI6MjA2ODY3NjU4M30.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'
            );
            
            // 登出除了當前會話外的所有會話
            const { error } = await supabase
                .from('employee_sessions')
                .update({ 
                    is_active: false, 
                    logout_time: new Date().toISOString() 
                })
                .eq('employee_id', session.employee.id)
                .neq('session_id', session.sessionId);
            
            if (error) {
                throw error;
            }
            
            console.log('已登出其他裝置');
            return true;
            
        } catch (error) {
            console.error('登出其他裝置失敗:', error);
            return false;
        }
    }
    
    // 更新員工資料
    static async updateEmployeeProfile(employeeData) {
        try {
            if (!this.currentEmployee) {
                throw new Error('未登入');
            }
            
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(
                'https://cgwhckykrlphnibmuvhz.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2hja3lrcmxwaG5pYm11dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA1ODMsImV4cCI6MjA2ODY3NjU4M30.LiIG69wjvcyrJhdNAk0Y171uKCU4f-ROIiejS7Xd7zY'
            );
            
            const { data, error } = await supabase
                .from('employees')
                .update(employeeData)
                .eq('id', this.currentEmployee.id)
                .select()
                .single();
            
            if (error) {
                throw error;
            }
            
            // 更新本地員工資料
            this.currentEmployee = data;
            const session = this.getSession();
            if (session) {
                session.employee = data;
                this.saveSession(session);
            }
            
            console.log('員工資料更新成功');
            return data;
            
        } catch (error) {
            console.error('更新員工資料失敗:', error);
            throw error;
        }
    }
}

// 向全域暴露 API
window.EmployeeAuth = EmployeeAuth;

// 自動初始化認證系統
document.addEventListener('DOMContentLoaded', async function() {
    // 等待資料庫初始化
    await DatabaseManager.initialize();
    
    // 初始化認證系統
    const isLoggedIn = await EmployeeAuth.initialize();
    
    // 觸發登入狀態變更事件
    const event = new CustomEvent('authStateChanged', { 
        detail: { isLoggedIn, employee: EmployeeAuth.getCurrentEmployee() } 
    });
    document.dispatchEvent(event);
}); 