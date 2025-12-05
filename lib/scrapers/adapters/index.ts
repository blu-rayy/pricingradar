import { MarketplaceType, ScraperAdapter } from '../types';
import { ShopeeAdapter } from './shopee';
import { AmazonAdapter } from './amazon';
import { LazadaAdapter } from './lazada';

// Registry of all available adapters
const adapters: Map<MarketplaceType, ScraperAdapter> = new Map();

// Register adapters
adapters.set('shopee', new ShopeeAdapter());
adapters.set('amazon', new AmazonAdapter());
adapters.set('lazada', new LazadaAdapter());

export function getAdapter(marketplace: MarketplaceType): ScraperAdapter | undefined {
  return adapters.get(marketplace);
}

export function getAllAdapters(): ScraperAdapter[] {
  return Array.from(adapters.values());
}

export function detectAdapterFromUrl(url: string): ScraperAdapter | null {
  for (const adapter of adapters.values()) {
    if (adapter.validateUrl(url)) {
      return adapter;
    }
  }
  return null;
}

// Re-export adapters for direct use if needed
export { ShopeeAdapter } from './shopee';
export { AmazonAdapter } from './amazon';
export { LazadaAdapter } from './lazada';

