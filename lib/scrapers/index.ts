// Main entry point for the scraper system
export * from './types';
export * from './marketplaces';
export * from './adapters';

import { 
  CompetitorConfig, 
  AlertThreshold, 
  AlertCondition,
  ScrapedProductData 
} from './types';

// Alert evaluation helpers
export function evaluateAlert(
  alert: AlertThreshold,
  currentPrice: number,
  previousPrice: number,
  internalPrice?: number
): boolean {
  if (!alert.enabled) return false;

  const priceDiff = currentPrice - previousPrice;
  const percentChange = previousPrice > 0 
    ? ((currentPrice - previousPrice) / previousPrice) * 100 
    : 0;

  switch (alert.condition) {
    case 'price_drop_percentage':
      return percentChange <= -alert.value;
    
    case 'price_drop_absolute':
      return priceDiff <= -alert.value;
    
    case 'price_increase_percentage':
      return percentChange >= alert.value;
    
    case 'price_increase_absolute':
      return priceDiff >= alert.value;
    
    case 'price_below':
      return currentPrice < alert.value;
    
    case 'price_above':
      return currentPrice > alert.value;
    
    default:
      return false;
  }
}

// Stock alert helpers
export function evaluateStockAlert(
  alert: AlertThreshold,
  currentInStock: boolean,
  previousInStock: boolean
): boolean {
  if (!alert.enabled) return false;

  switch (alert.condition) {
    case 'out_of_stock':
      return previousInStock && !currentInStock;
    
    case 'back_in_stock':
      return !previousInStock && currentInStock;
    
    default:
      return false;
  }
}

// Default alert presets
export const DEFAULT_ALERT_PRESETS: Omit<AlertThreshold, 'id'>[] = [
  {
    name: 'Price drops more than 10%',
    condition: 'price_drop_percentage',
    value: 10,
    enabled: true,
    notifyEmail: true,
  },
  {
    name: 'Price drops more than 20%',
    condition: 'price_drop_percentage',
    value: 20,
    enabled: false,
    notifyEmail: true,
  },
  {
    name: 'Competitor undercuts by $5+',
    condition: 'price_drop_absolute',
    value: 5,
    enabled: false,
    notifyEmail: true,
  },
  {
    name: 'Product goes out of stock',
    condition: 'out_of_stock',
    value: 0,
    enabled: true,
    notifyEmail: true,
  },
  {
    name: 'Product back in stock',
    condition: 'back_in_stock',
    value: 0,
    enabled: true,
    notifyEmail: true,
  },
];

// Utility to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

