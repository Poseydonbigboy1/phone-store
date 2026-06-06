import { EDeliveryType, DeliveryDetail } from './delivery';

export interface OrderSummary {
  id: string;
  orderDate: string;
  status: number;
  totalAmount: number;
  itemCount: number;
  deliveryType?: EDeliveryType;
}

export interface OrderDetail {
  id: string;
  orderDate: string;
  status: number;
  totalAmount: number;
  delivery?: DeliveryDetail;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  skuId: string;
  productTitle: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface CheckoutRequest {
  delivery: DeliveryDetail;
}
