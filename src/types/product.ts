/**
 * Product & Catalog Domain Types for Pak-o-Drive Platform
 */

export interface IProductVariant {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
}

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory?: string;
  image: string;
  images?: string[];
  video?: string;
  showVideoOnFront?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  rating: number;
  reviewsCount: number;
  isNewArrival: boolean;
  isFeatured: boolean;
  isTopSelling: boolean;
  stock: number;
  heroText?: string;
  specifications: Record<string, string>;
  variants?: IProductVariant[];
  slug?: string;
  createdAt?: string | Date;
}

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

export interface VariantInput {
  name: string;
  description?: string;
  price: string | number;
  originalPrice?: string | number;
  stock: string | number;
  image?: string;
}

export interface SpecInput {
  key: string;
  value: string;
}

export interface ProductFormHookOptions {
  initialData?: any;
  productId?: string;
  isEditMode?: boolean;
}

export interface BulkImportProductInput {
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  shortDescription?: string;
  video?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  isTopSelling?: boolean;
  isNewArrival?: boolean;
  specifications?: Record<string, string>;
  variants?: Array<{
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    stock?: number;
    image?: string;
  }>;
}
