export interface FilterItem {
  matchMode: string;
  value: string;
}

export interface FilterResult<T> {
  items: T[];
  total: number;
}

export interface BrandFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  title: FilterItem;
}

export interface ComponentCategoryFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  title: FilterItem;
}

export interface ComponentFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  title: FilterItem;
  componentCategoryId: FilterItem;
  dataType: FilterItem;
  categoryType: FilterItem;
}

export interface ProductFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  title: FilterItem;
  brandId: FilterItem;
}

export interface SkuFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  productId: FilterItem;
  price: FilterItem;
  amount: FilterItem;
  discount: FilterItem;
}

export interface ProductComponentFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  skuId: FilterItem;
  componentId: FilterItem;
  valueJson: FilterItem;
  filtering: FilterItem;
}

export interface OrderFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  userId: FilterItem;
  status: FilterItem;
  shippingAddress: FilterItem;
  totalAmount: FilterItem;
}

export interface OrderItemFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  orderId: FilterItem;
  skuId: FilterItem;
  quantity: FilterItem;
  price: FilterItem;
}

export interface UserFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  login: FilterItem;
  name: FilterItem;
  roles: FilterItem;
}
