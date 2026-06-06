export interface Order {
  id: string;
  userId: string;
  orderDate: string;
  status: number;
  totalAmount: number;
  shippingAddress: string;
}

export const ORDER_STATUS_LABELS: Record<number, string> = {
  0: 'В ожидании',
  1: 'В обработке',
  2: 'Отправлен',
  3: 'Доставлен',
  4: 'Отменён',
};

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export const ORDER_STATUS_SEVERITIES: Record<number, TagSeverity> = {
  0: 'warn',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'danger',
};
