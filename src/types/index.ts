/**
 * Global Barrel Export for Pak-o-Drive Domain Types
 */

export * from './product';
export * from './order';
export * from './siteInfo';
export * from './admin';
export * from './analytics';
export * from './whatsapp';
export * from './theme';
export * from './common';
export * from './marketIntelligence';

// Core E-Commerce entity interfaces
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  productCount: number;
  parentCategory?: string;
  children?: ICategory[];
  subcategories?: ICategory[];
}

export interface ICartItem {
  product: import('./product').IProduct;
  quantity: number;
  variant?: import('./product').IProductVariant;
}
