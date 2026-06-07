import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsHttpService } from '@backend';
import { DashboardHttpService } from '@backend';
import { DashboardViewModel } from '@models/data';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, KeyValuePipe,
    CardModule, TableModule, ButtonModule, TagModule, DividerModule,
    ProgressSpinnerModule, ChartModule, TooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit {
  private readonly http      = inject(DashboardHttpService);
  private readonly analytics = inject(AnalyticsHttpService);
  private readonly router    = inject(Router);

  loading      = signal(true);
  data         = signal<DashboardViewModel | null>(null);
  revenueChart = signal<any>(null);
  donutChart   = signal<any>(null);

  readonly statusLabels: Record<string, string> = {
    Pending:   'Ожидает',
    Confirmed: 'Подтверждён',
    Shipped:   'Отправлен',
    Delivered: 'Доставлен',
    Cancelled: 'Отменён',
  };

  readonly statusSeverities: Record<string, string> = {
    Pending:   'warn',
    Confirmed: 'info',
    Shipped:   'secondary',
    Delivered: 'success',
    Cancelled: 'danger',
  };

  readonly statusColors: Record<string, string> = {
    Pending:   '#f59e0b',
    Confirmed: '#3b82f6',
    Shipped:   '#64748b',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
  };

  ngOnInit(): void {
    this.http.get$().subscribe({
      next: res => {
        this.data.set(res?.data ?? null);
        this.loading.set(false);
        this.buildDonutChart(res?.data?.ordersByStatus ?? {});
      },
      error: () => this.loading.set(false),
    });

    // Revenue chart for last 30 days
    const to   = new Date();
    const from = new Date(); from.setDate(from.getDate() - 29);
    const fmt  = (d: Date) => d.toISOString().slice(0, 10);

    this.analytics.getRevenue$(fmt(from), fmt(to), 'day').subscribe(res => {
      if (res?.isSuccess) this.buildRevenueChart(res.data ?? []);
    });
  }

  private buildRevenueChart(points: any[]): void {
    const labels   = points.map(p => new Date(p.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
    const revenue  = points.map(p => Math.round(p.revenue));
    const orders   = points.map(p => p.ordersCount);

    this.revenueChart.set({
      labels,
      datasets: [
        {
          label: 'Выручка, ₽',
          data: revenue,
          fill: true,
          backgroundColor: 'rgba(99,102,241,0.12)',
          borderColor: '#6366f1',
          tension: 0.4,
          pointRadius: 2,
          yAxisID: 'y',
        },
        {
          label: 'Заказы',
          data: orders,
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

  private buildDonutChart(statusMap: Record<string, number>): void {
    const labels   = Object.keys(statusMap).map(k => this.statusLabels[k] ?? k);
    const data     = Object.values(statusMap);
    const colors   = Object.keys(statusMap).map(k => this.statusColors[k] ?? '#94a3b8');

    this.donutChart.set({
      labels,
      datasets: [{ data, backgroundColor: colors, hoverOffset: 4 }],
    });
  }

  revenueChartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y:  { type: 'linear', display: true, position: 'left',  title: { display: true, text: '₽' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'шт' } },
    },
    plugins: { legend: { position: 'bottom' } },
  };

  donutChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  goToSku(skuId: string): void {
    this.router.navigate(['/manager/management/products']);
  }

  pendingCount(): number { return this.data()?.ordersByStatus?.['Pending'] ?? 0; }
  zeroCount():    number { return this.data()?.zeroStockSkus?.length ?? 0; }
}
