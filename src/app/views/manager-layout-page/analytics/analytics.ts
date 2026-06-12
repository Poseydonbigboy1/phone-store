import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AnalyticsHttpService,
  RevenuePoint,
  TopProductAnalytics,
  NewCustomersPoint,
  AvgOrderAnalytics,
} from '@backend';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, FormsModule,
    CardModule, ButtonModule, TableModule, ChartModule,
    DatePickerModule, SelectButtonModule,
    TabsModule, ProgressSpinnerModule, ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class AnalyticsPage implements OnInit {
  private readonly http = inject(AnalyticsHttpService);

  // Filters (plain properties for ngModel binding)
  dateFrom   = this.daysAgo(30);
  dateTo     = new Date();
  groupByOpt = [
    { label: 'По дням',    value: 'day' },
    { label: 'По неделям', value: 'week' },
    { label: 'По месяцам', value: 'month' },
  ];
  groupBy = 'day';

  // Loading
  loading = signal(false);

  // Revenue report
  revenuePoints  = signal<RevenuePoint[]>([]);
  revenueChart   = signal<any>(null);

  // Top products
  topProducts    = signal<TopProductAnalytics[]>([]);
  topBarChart    = signal<any>(null);

  // New customers
  newCustomers   = signal<NewCustomersPoint[]>([]);
  customersChart = signal<any>(null);

  // Avg order
  avgOrder = signal<AvgOrderAnalytics | null>(null);

  ngOnInit(): void {
    this.apply();
  }

  apply(): void {
    this.loading.set(true);
    const from = this.fmtDate(this.dateFrom);
    const to   = this.fmtDate(this.dateTo);
    const gb   = this.groupBy;
    let done   = 0;
    const check = () => { if (++done === 4) this.loading.set(false); };

    this.http.getRevenue$(from, to, gb).subscribe(res => {
      const pts = res?.data ?? [];
      this.revenuePoints.set(pts);
      this.buildRevenueChart(pts);
      check();
    });

    this.http.getTopProducts$(from, to, 10).subscribe(res => {
      const top = res?.data ?? [];
      this.topProducts.set(top);
      this.buildTopBarChart(top);
      check();
    });

    this.http.getNewCustomers$(from, to, gb).subscribe(res => {
      const pts = res?.data ?? [];
      this.newCustomers.set(pts);
      this.buildCustomersChart(pts);
      check();
    });

    this.http.getAvgOrder$(from, to).subscribe(res => {
      this.avgOrder.set(res?.data ?? null);
      check();
    });
  }

  private buildRevenueChart(pts: RevenuePoint[]): void {
    const labels  = pts.map(p => this.fmtLabel(p.date));
    this.revenueChart.set({
      labels,
      datasets: [
        {
          label: 'Выручка, ₽',
          data: pts.map(p => Math.round(p.revenue)),
          fill: true,
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderColor: '#6366f1',
          tension: 0.4,
          pointRadius: 2,
          yAxisID: 'y',
        },
        {
          label: 'Заказы, шт',
          data: pts.map(p => p.ordersCount),
          fill: false,
          borderColor: '#22c55e',
          borderDash: [4, 4],
          tension: 0.4,
          pointRadius: 2,
          yAxisID: 'y1',
        },
      ],
    });
  }

  private buildTopBarChart(top: TopProductAnalytics[]): void {
    const slice = [...top].reverse(); // highest at top for horizontal bar
    this.topBarChart.set({
      labels: slice.map(t => t.productTitle.length > 30 ? t.productTitle.slice(0, 30) + '…' : t.productTitle),
      datasets: [{
        label: 'Выручка, ₽',
        data: slice.map(t => Math.round(t.totalRevenue)),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderColor: '#6366f1',
        borderWidth: 1,
      }],
    });
  }

  private buildCustomersChart(pts: NewCustomersPoint[]): void {
    this.customersChart.set({
      labels: pts.map(p => this.fmtLabel(p.date)),
      datasets: [{
        label: 'Новые клиенты',
        data: pts.map(p => p.count),
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderColor: '#22c55e',
        borderWidth: 1,
      }],
    });
  }

  revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y:  { type: 'linear', display: true, position: 'left' },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
    },
    plugins: { legend: { position: 'bottom' } },
  };

  barChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  barChartOptions2 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  exportRevenue(): void {
    const from = this.fmtDate(this.dateFrom);
    const to   = this.fmtDate(this.dateTo);
    // Simple CSV export
    const headers = ['Дата', 'Выручка (₽)', 'Заказов'];
    const rows    = this.revenuePoints().map(p => [
      this.fmtLabel(p.date), Math.round(p.revenue), p.ordersCount
    ]);
    this.downloadCsv('revenue.csv', [headers, ...rows]);
  }

  exportTopProducts(): void {
    const headers = ['Товар', 'Бренд', 'Продано (шт)', 'Выручка (₽)', 'Доля (%)'];
    const rows    = this.topProducts().map(t => [
      t.productTitle, t.brandTitle, t.totalSold, Math.round(t.totalRevenue), t.sharePercent
    ]);
    this.downloadCsv('top-products.csv', [headers, ...rows]);
  }

  private downloadCsv(filename: string, rows: any[][]): void {
    const bom = '﻿';
    const csv = bom + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  totalRevenue(): number {
    return this.revenuePoints().reduce((s, p) => s + p.revenue, 0);
  }

  totalOrders(): number {
    return this.revenuePoints().reduce((s, p) => s + p.ordersCount, 0);
  }

  totalNewCustomers(): number {
    return this.newCustomers().reduce((s, p) => s + p.count, 0);
  }

  private fmtDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private fmtLabel(dateStr: string): string {
    const d = new Date(dateStr);
    if (this.groupBy === 'month') return d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    if (this.groupBy === 'week')  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  }

  private daysAgo(n: number): Date {
    const d = new Date(); d.setDate(d.getDate() - n); return d;
  }
}
