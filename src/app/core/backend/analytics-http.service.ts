import { Injectable } from '@angular/core';
import { HttpBase } from './http-base';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';

export interface RevenuePoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface TopProductAnalytics {
  skuId: string;
  productTitle: string;
  brandTitle: string;
  totalSold: number;
  totalRevenue: number;
  sharePercent: number;
}

export interface NewCustomersPoint {
  date: string;
  count: number;
}

export interface AvgOrderAnalytics {
  avgAmount: number;
  medianAmount: number;
  maxAmount: number;
  totalOrders: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsHttpService extends HttpBase {
  getRevenue$(from: string, to: string, groupBy = 'day'): Observable<ResponseObject<RevenuePoint[]>> {
    return this.httpClient.get<ResponseObject<RevenuePoint[]>>(
      `${this.apiUrl}/Analytics/revenue?from=${from}&to=${to}&groupBy=${groupBy}`
    );
  }

  getTopProducts$(from: string, to: string, take = 10): Observable<ResponseObject<TopProductAnalytics[]>> {
    return this.httpClient.get<ResponseObject<TopProductAnalytics[]>>(
      `${this.apiUrl}/Analytics/top-products?from=${from}&to=${to}&take=${take}`
    );
  }

  getNewCustomers$(from: string, to: string, groupBy = 'day'): Observable<ResponseObject<NewCustomersPoint[]>> {
    return this.httpClient.get<ResponseObject<NewCustomersPoint[]>>(
      `${this.apiUrl}/Analytics/new-customers?from=${from}&to=${to}&groupBy=${groupBy}`
    );
  }

  getOrdersByStatus$(from: string, to: string): Observable<ResponseObject<Record<string, number>>> {
    return this.httpClient.get<ResponseObject<Record<string, number>>>(
      `${this.apiUrl}/Analytics/orders-by-status?from=${from}&to=${to}`
    );
  }

  getAvgOrder$(from: string, to: string): Observable<ResponseObject<AvgOrderAnalytics>> {
    return this.httpClient.get<ResponseObject<AvgOrderAnalytics>>(
      `${this.apiUrl}/Analytics/avg-order?from=${from}&to=${to}`
    );
  }
}
