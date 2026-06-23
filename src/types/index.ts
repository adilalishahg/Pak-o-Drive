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
  image: string;
  images?: string[];
  video?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  rating: number;
  reviewsCount: number;
  isNewArrival: boolean;
  isFeatured: boolean;
  isTopSelling: boolean;
  stock: number;
  specifications: Record<string, string>;
  variants?: IProductVariant[];
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  productCount: number;
  parentCategory?: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
  variant?: IProductVariant;
}

export interface ICustomerDetails {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantName?: string;
  variantId?: string;
}

export interface IOrder {
  _id?: string;
  customerDetails: ICustomerDetails;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: 'COD';
  status: 'Pending' | 'Processing' | 'On the Way' | 'Shipped' | 'Delivered' | 'Cancelled';
  statusHistory?: { status: string; changedAt: string | Date; note?: string }[];
  createdAt?: string | Date;
  whatsappSent: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

