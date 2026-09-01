/**
 * Product & Catalog Component Types for Pak-o-Drive Platform
 */

import { IProduct, IProductVariant } from './index';

export interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}

export interface ProductDetailInteractiveProps {
  product: IProduct;
  relatedProducts?: IProduct[];
}


export interface ProductActionsProps {
  product: IProduct;
  selectedVariant?: IProductVariant;
}


export interface ProductImageGalleryProps {
  image: string;
  images: string[];
  name: string;
  video?: string;
  showVideoOnFront?: boolean;
}


export interface ProductSEOOptimizerProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  originalPrice: string;
  image: string;
  images: string[];
  video: string;
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  seoKeywords: string;
  setSeoKeywords: (v: string) => void;
  category: string;
  specs: Array<{ key: string; value: string }>;
  variants: any[];
}

export interface SidebarCategory {
  name: string;
  slug: string;
  icon: string;
  parentCategory?: string;
  image?: string;
  productCount?: number;
}

export interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (min: number, max: number) => void;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  onReset: () => void;
}


export interface ProductCardListProps {
  product: IProduct;
  priority?: boolean;
}

export interface ShopClientProps {
  initialProducts: IProduct[];
}

export interface HomePageClientProps {
  initialProducts: IProduct[];
  initialCategories: any[];
}

