import { MarketplaceType, ScrapedProductData, ScraperAdapter } from '../types';

export abstract class BaseScraperAdapter implements ScraperAdapter {
  abstract marketplace: MarketplaceType;
  abstract urlPatterns: RegExp[];

  validateUrl(url: string): boolean {
    return this.urlPatterns.some(pattern => pattern.test(url));
  }

  abstract scrapeProduct(url: string): Promise<ScrapedProductData>;

  // Optional: implement in subclasses if marketplace supports search
  async searchProducts?(query: string): Promise<ScrapedProductData[]>;

  // Helper to extract product ID from URL
  protected abstract extractProductId(url: string): string | null;

  // Helper for rate limiting
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper to parse price strings
  protected parsePrice(priceStr: string): number {
    // Remove currency symbols and non-numeric characters except decimal
    const cleaned = priceStr.replace(/[^0-9.,]/g, '');
    // Handle different decimal separators
    const normalized = cleaned.replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  // Helper to detect currency from price string
  protected detectCurrency(priceStr: string): string {
    if (priceStr.includes('$')) return 'USD';
    if (priceStr.includes('₱') || priceStr.toLowerCase().includes('php')) return 'PHP';
    if (priceStr.includes('Rp') || priceStr.toLowerCase().includes('idr')) return 'IDR';
    if (priceStr.includes('RM') || priceStr.toLowerCase().includes('myr')) return 'MYR';
    if (priceStr.includes('S$') || priceStr.toLowerCase().includes('sgd')) return 'SGD';
    if (priceStr.includes('฿') || priceStr.toLowerCase().includes('thb')) return 'THB';
    if (priceStr.includes('₫') || priceStr.toLowerCase().includes('vnd')) return 'VND';
    return 'USD';
  }
}

