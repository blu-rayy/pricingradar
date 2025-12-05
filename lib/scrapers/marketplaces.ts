import { MarketplaceConfig, MarketplaceType } from './types';

export const SUPPORTED_MARKETPLACES: MarketplaceConfig[] = [
  {
    id: 'shopee',
    name: 'Shopee',
    baseUrl: 'https://shopee.com',
    icon: '🛒',
    enabled: true,
    rateLimit: 30,
  },
  {
    id: 'lazada',
    name: 'Lazada',
    baseUrl: 'https://lazada.com',
    icon: '🏪',
    enabled: true,
    rateLimit: 30,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    baseUrl: 'https://amazon.com',
    icon: '📦',
    enabled: true,
    rateLimit: 20,
  },
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    baseUrl: 'https://tokopedia.com',
    icon: '🛍️',
    enabled: true,
    rateLimit: 30,
  },
  {
    id: 'bukalapak',
    name: 'Bukalapak',
    baseUrl: 'https://bukalapak.com',
    icon: '🏬',
    enabled: true,
    rateLimit: 30,
  },
  {
    id: 'facebook_marketplace',
    name: 'Facebook Marketplace',
    baseUrl: 'https://facebook.com/marketplace',
    icon: '👥',
    enabled: false, // Requires special handling
    rateLimit: 10,
  },
  {
    id: 'custom',
    name: 'Custom Website',
    baseUrl: '',
    icon: '🌐',
    enabled: true,
    rateLimit: 60,
  },
];

export function getMarketplaceConfig(id: MarketplaceType): MarketplaceConfig | undefined {
  return SUPPORTED_MARKETPLACES.find(m => m.id === id);
}

export function detectMarketplace(url: string): MarketplaceType | null {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('shopee.')) return 'shopee';
  if (urlLower.includes('lazada.')) return 'lazada';
  if (urlLower.includes('amazon.')) return 'amazon';
  if (urlLower.includes('tokopedia.')) return 'tokopedia';
  if (urlLower.includes('bukalapak.')) return 'bukalapak';
  if (urlLower.includes('facebook.com/marketplace')) return 'facebook_marketplace';
  
  return 'custom';
}

export function validateMarketplaceUrl(url: string, marketplace: MarketplaceType): boolean {
  try {
    const parsed = new URL(url);
    const config = getMarketplaceConfig(marketplace);
    
    if (!config) return false;
    if (marketplace === 'custom') return true;
    
    return parsed.hostname.includes(marketplace.replace('_', '.'));
  } catch {
    return false;
  }
}

