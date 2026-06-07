export interface DashboardViewModel {
  ordersByStatus: Record<string, number>;
  revenueToday: number;
  revenue7Days: number;
  revenue30Days: number;
  topProducts: TopProductViewModel[];
  zeroStockSkus: ZeroStockSkuViewModel[];
}

export interface TopProductViewModel {
  skuId: string;
  productTitle: string;
  brandTitle: string;
  totalSold: number;
  totalRevenue: number;
}

export interface ZeroStockSkuViewModel {
  skuId: string;
  productTitle: string;
  brandTitle: string;
  price: number;
}
