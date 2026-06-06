export enum EDeliveryType {
  Courier = 0,
  Pickup  = 1,
}

export interface DeliveryDetail {
  type: EDeliveryType;
  recipientName: string;
  phone: string;
  address?: string;
  comment?: string;
}
