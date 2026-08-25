export type CourierProvider = 'PostEx' | 'Trax' | 'Leopards' | 'TCS' | 'CallCourier' | 'Manual';

export interface CourierBookingRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  totalAmount: number; // COD amount in PKR
  itemsCount: number;
  itemDescription: string;
  orderNotes?: string;
}

export interface CourierBookingResponse {
  success: boolean;
  courierName: CourierProvider;
  trackingNumber: string;
  trackingUrl: string;
  bookingDate: string;
  message?: string;
  rawResponse?: any;
}
