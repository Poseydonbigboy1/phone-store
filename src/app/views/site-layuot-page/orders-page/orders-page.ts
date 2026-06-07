import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CheckoutHttpService } from '@backend';
import { OrderDetail, OrderSummary } from '@models/data';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';

interface StatusEvent {
  status: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, RouterLink,
    DataViewModule, CardModule, ButtonModule, BadgeModule, TagModule,
    ChipModule, DialogModule, DividerModule, TimelineModule, ProgressSpinnerModule,
  ],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage implements OnInit {
  private readonly checkoutHttp = inject(CheckoutHttpService);

  orders = signal<OrderSummary[]>([]);
  loading = signal(true);
  selectedOrder = signal<OrderDetail | null>(null);
  detailVisible = signal(false);
  detailLoading = signal(false);

  ngOnInit(): void {
    this.checkoutHttp.getMyOrders$().subscribe({
      next: res => {
        this.orders.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openDetail(orderId: string): void {
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    this.selectedOrder.set(null);
    this.checkoutHttp.getMyOrder$(orderId).subscribe({
      next: res => {
        this.selectedOrder.set(res?.data ?? null);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false),
    });
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  statusSeverity(status: number): 'info' | 'warn' | 'success' | 'danger' | 'secondary' {
    const map: Record<number, 'info' | 'warn' | 'success' | 'danger' | 'secondary'> = {
      0: 'warn',
      1: 'info',
      2: 'info',
      3: 'success',
      4: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  statusLabel(status: number): string {
    const map: Record<number, string> = {
      0: 'Ожидает',
      1: 'Подтверждён',
      2: 'В доставке',
      3: 'Доставлен',
      4: 'Отменён',
    };
    return map[status] ?? String(status);
  }

  deliveryLabel(type: number | undefined): string {
    return type === 1 ? 'Самовывоз' : 'Курьер';
  }

  timelineEvents(status: number): StatusEvent[] {
    const steps: StatusEvent[] = [
      { status: 'Ожидает',     icon: 'pi pi-clock', color: '#F59E0B' },
      { status: 'Подтверждён', icon: 'pi pi-check', color: '#3B82F6' },
      { status: 'В доставке',  icon: 'pi pi-truck', color: '#6366F1' },
      { status: 'Доставлен',   icon: 'pi pi-home',  color: '#10B981' },
    ];
    return steps.map((s, i) => ({
      ...s,
      color: i <= status ? s.color : '#CBD5E1',
    }));
  }
}
