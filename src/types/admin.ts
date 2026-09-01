/**
 * Admin Panel Domain Types
 */

export interface DashboardData {
  stats: {
    revenue: number;
    orders: number;
    products: number;
    unreadContacts: number;
    activePromos: number;
    pageviews: number;
    cartClicks: number;
    whatsappClicks: number;
    searchesCount: number;
    abandonedCartLeak?: number;
    averageOrderValue?: number;
    totalRevenue?: number;
    totalOrders?: number;
    pendingOrders?: number;
    deliveredOrders?: number;
    totalProducts?: number;
  };
  charts: {
    labels: string[];
    pageviews: number[];
    sales: number[];
  };
  popularProducts: Array<{
    _id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    image: string;
    rating: number;
  }>;
  searches: Array<{
    keyword: string;
    count: number;
  }>;
}

export interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
  subscribedAt?: string;
}

export interface PromoData {
  _id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiryDate: string;
  promoCode?: string;
  title?: string;
  description?: string;
  discountPercentage?: number;
  bannerImage?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface ContactData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read';
  createdAt: string;
}

export interface CategoryData {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  parentCategory?: string;
  productCount: number;
  children?: CategoryData[];
}
