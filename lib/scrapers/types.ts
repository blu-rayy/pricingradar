// Core types for the scraper system

export type MarketplaceType = 
  | 'shopee' 
  | 'lazada' 
  | 'amazon' 
  | 'tokopedia' 
  | 'bukalapak'
  | 'facebook_marketplace'
  | 'custom';

export interface MarketplaceConfig {
  id: MarketplaceType;
  name: string;
  baseUrl: string;
  icon: string;
  enabled: boolean;
  rateLimit?: number; // requests per minute
}

export interface CompetitorProduct {
  id: string;
  url: string;
  name: string;
  marketplace: MarketplaceType;
  currentPrice?: number;
  currency?: string;
  lastScraped?: Date;
  imageUrl?: string;
}

export interface InternalProduct {
  id: string;
  sku: string;
  name: string;
  currentPrice: number;
  currency: string;
  category?: string;
}

export interface ProductMapping {
  id: string;
  internalProductId: string;
  competitorProductId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertCondition = 
  | 'price_drop_percentage'
  | 'price_drop_absolute'
  | 'price_increase_percentage'
  | 'price_increase_absolute'
  | 'price_below'
  | 'price_above'
  | 'out_of_stock'
  | 'back_in_stock';

export interface AlertThreshold {
  id: string;
  name: string;
  condition: AlertCondition;
  value: number;
  enabled: boolean;
  notifyEmail?: boolean;
  notifySlack?: boolean;
  notifyWebhook?: string;
}

export interface CompetitorConfig {
  id: string;
  name: string;
  description?: string;
  marketplace: MarketplaceType;
  urls: string[];
  products: CompetitorProduct[];
  productMappings: ProductMapping[];
  alertThresholds: AlertThreshold[];
  scrapeFrequency: 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Scraper adapter interface - each marketplace implements this
export interface ScraperAdapter {
  marketplace: MarketplaceType;
  
  // Validate if URL belongs to this marketplace
  validateUrl(url: string): boolean;
  
  // Extract product info from URL
  scrapeProduct(url: string): Promise<ScrapedProductData>;
  
  // Search for products (optional)
  searchProducts?(query: string): Promise<ScrapedProductData[]>;
}

export interface ScrapedProductData {
  url: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  seller?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  variants?: ProductVariant[];
  scrapedAt: Date;
}

export interface ProductVariant {
  name: string;
  price: number;
  inStock: boolean;
}

// Configuration wizard state
export interface ConfigWizardState {
  step: 'marketplace' | 'urls' | 'products' | 'mappings' | 'alerts' | 'review';
  marketplace?: MarketplaceType;
  urls: string[];
  products: CompetitorProduct[];
  mappings: ProductMapping[];
  alerts: AlertThreshold[];
}

