/**
 * Order & Checkout Domain Types
 */

import { OrderStatusType } from '../lib/constants';

export type OrderStatus = OrderStatusType | 'Pending' | 'Processing' | 'On the Way' | 'Shipped' | 'Delivered' | 'Cancelled';

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
  paymentMethod: string;
  status: OrderStatus;
  statusHistory?: { status: string; changedAt: string | Date; note?: string }[];
  createdAt?: string | Date;
  whatsappSent: boolean;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface OrderData {
  _id: string;
  customerDetails: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    variantName?: string;
    variantId?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  statusHistory?: Array<{
    status: OrderStatus;
    changedAt: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  whatsappSent: boolean;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  orderNotes: string;
  paymentMethod?: string;
}

