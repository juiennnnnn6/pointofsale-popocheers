-- 創建庫存交易記錄表
-- 用於記錄所有庫存變動的詳細信息

-- 檢查表是否已存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'inventory_transactions'
    ) THEN
        -- 創建庫存交易記錄表
        CREATE TABLE inventory_transactions (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'refund', 'purchase', 'adjustment')),
            quantity_change INTEGER NOT NULL,
            previous_stock INTEGER NOT NULL,
            new_stock INTEGER NOT NULL,
            reference_id VARCHAR(50),
            reference_type VARCHAR(20) CHECK (reference_type IN ('sale', 'refund', 'purchase', 'adjustment')),
            notes TEXT,
            created_by VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- 添加索引以提高查詢性能
        CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
        CREATE INDEX idx_inventory_transactions_transaction_type ON inventory_transactions(transaction_type);
        CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at);
        CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
        
        -- 添加註釋
        COMMENT ON TABLE inventory_transactions IS '庫存交易記錄表，記錄所有庫存變動的詳細信息';
        COMMENT ON COLUMN inventory_transactions.transaction_type IS '交易類型：sale(銷售), refund(退貨), purchase(進貨), adjustment(調整)';
        COMMENT ON COLUMN inventory_transactions.quantity_change IS '庫存變化量，正數為增加，負數為減少';
        COMMENT ON COLUMN inventory_transactions.previous_stock IS '交易前庫存數量';
        COMMENT ON COLUMN inventory_transactions.new_stock IS '交易後庫存數量';
        COMMENT ON COLUMN inventory_transactions.reference_id IS '關聯的單據號碼（如收據號、退貨單號等）';
        COMMENT ON COLUMN inventory_transactions.reference_type IS '關聯單據類型';
        COMMENT ON COLUMN inventory_transactions.notes IS '交易備註';
        COMMENT ON COLUMN inventory_transactions.created_by IS '操作人員';
        
        RAISE NOTICE '成功創建 inventory_transactions 表';
    ELSE
        RAISE NOTICE 'inventory_transactions 表已存在';
    END IF;
END $$;

-- 查看表結構確認
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_transactions' 
ORDER BY ordinal_position;
