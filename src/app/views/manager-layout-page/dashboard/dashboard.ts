import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardHttpService } from '@backend';
import { DashboardViewModel } from '@models/data';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, KeyValuePipe,
    CardModule, TableModule, ButtonModule, TagModule, DividerModule, ProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit {
  private readonly http   = inject(DashboardHttpService);
  private readonly router = inject(Router);

  loading = signal(true);
  data    = signal<DashboardViewModel | null>(null);

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

  ngOnInit(): void {
    this.http.get$().subscribe({
      next: res => {
        this.data.set(res?.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToSku(skuId: string): void {
    this.router.navigate(['/manager/management/products']);
  }

  pendingCount(): number {
    return this.data()?.ordersByStatus?.['Pending'] ?? 0;
  }

  zeroCount(): number {
    return this.data()?.zeroStockSkus?.length ?? 0;
  }
}
