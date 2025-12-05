-- PricingRadar Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================
-- COMPETITORS TABLE
-- Stores competitor configurations
-- ============================================
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    marketplace VARCHAR(50) NOT NULL,
    -- 'shopee', 'amazon', 'lazada', etc.
    base_url VARCHAR(500),
    scrape_frequency VARCHAR(20) DEFAULT 'daily',
    -- 'hourly', 'daily', 'weekly'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- PRODUCTS TABLE
-- Internal products (your products)
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    current_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- COMPETITOR_PRODUCTS TABLE
-- Products from competitors that we track
-- ============================================
CREATE TABLE competitor_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    external_id VARCHAR(255),
    -- Product ID from the marketplace
    name VARCHAR(500),
    current_price DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    image_url VARCHAR(1000),
    seller_name VARCHAR(255),
    rating DECIMAL(3, 2),
    review_count INTEGER,
    in_stock BOOLEAN DEFAULT true,
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competitor_id, url)
);
-- ============================================
-- PRODUCT_MAPPINGS TABLE
-- Links competitor products to internal products
-- ============================================
CREATE TABLE product_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    competitor_product_id UUID NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3, 2) DEFAULT 1.0,
    -- How confident we are in the mapping
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, competitor_product_id)
);
-- ============================================
-- PRICE_HISTORY TABLE
-- Historical price data for tracking trends
-- ============================================
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_product_id UUID NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    -- Before discount
    discount_percentage DECIMAL(5, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    in_stock BOOLEAN DEFAULT true,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create index for faster time-series queries
CREATE INDEX idx_price_history_product_time ON price_history(competitor_product_id, scraped_at DESC);
CREATE INDEX idx_price_history_scraped_at ON price_history(scraped_at DESC);
-- ============================================
-- ALERTS TABLE
-- Alert configurations
-- ============================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    -- 'price_drop_percentage', 'price_below', etc.
    threshold_value DECIMAL(12, 2) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    -- NULL means all products
    competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
    -- NULL means all competitors
    notify_email BOOLEAN DEFAULT true,
    notify_slack BOOLEAN DEFAULT false,
    webhook_url VARCHAR(500),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- ALERT_LOGS TABLE
-- Triggered alert history
-- ============================================
CREATE TABLE alert_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    competitor_product_id UUID NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
    previous_price DECIMAL(12, 2),
    current_price DECIMAL(12, 2) NOT NULL,
    change_percentage DECIMAL(5, 2),
    message TEXT NOT NULL,
    suggested_action TEXT,
    is_read BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alert_logs_triggered ON alert_logs(triggered_at DESC);
-- ============================================
-- SCRAPE_LOGS TABLE
-- Track scraping runs and errors
-- ============================================
CREATE TABLE scrape_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES competitors(id) ON DELETE
    SET NULL,
        competitor_product_id UUID REFERENCES competitor_products(id) ON DELETE
    SET NULL,
        status VARCHAR(20) NOT NULL,
        -- 'success', 'failed', 'partial'
        products_scraped INTEGER DEFAULT 0,
        products_failed INTEGER DEFAULT 0,
        error_message TEXT,
        duration_ms INTEGER,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
);
CREATE INDEX idx_scrape_logs_started ON scrape_logs(started_at DESC);
-- ============================================
-- HELPER FUNCTIONS
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply triggers to tables with updated_at
CREATE TRIGGER update_competitors_updated_at BEFORE
UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_products_updated_at BEFORE
UPDATE ON competitor_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_mappings_updated_at BEFORE
UPDATE ON product_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE
UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================
-- View: Current prices with competitor info
CREATE OR REPLACE VIEW v_current_prices AS
SELECT cp.id as competitor_product_id,
    cp.name as product_name,
    cp.current_price,
    cp.currency,
    cp.in_stock,
    cp.last_scraped_at,
    c.id as competitor_id,
    c.name as competitor_name,
    c.marketplace,
    pm.product_id as internal_product_id,
    p.name as internal_product_name,
    p.current_price as internal_price,
    p.sku
FROM competitor_products cp
    JOIN competitors c ON cp.competitor_id = c.id
    LEFT JOIN product_mappings pm ON cp.id = pm.competitor_product_id
    LEFT JOIN products p ON pm.product_id = p.id
WHERE c.is_active = true;
-- View: Price comparison summary
CREATE OR REPLACE VIEW v_price_comparison AS
SELECT p.id as product_id,
    p.sku,
    p.name as product_name,
    p.current_price as your_price,
    p.currency,
    COUNT(DISTINCT cp.id) as competitor_count,
    MIN(cp.current_price) as min_competitor_price,
    MAX(cp.current_price) as max_competitor_price,
    AVG(cp.current_price) as avg_competitor_price,
    p.current_price - AVG(cp.current_price) as price_vs_avg
FROM products p
    LEFT JOIN product_mappings pm ON p.id = pm.product_id
    LEFT JOIN competitor_products cp ON pm.competitor_product_id = cp.id
WHERE p.is_active = true
GROUP BY p.id,
    p.sku,
    p.name,
    p.current_price,
    p.currency;