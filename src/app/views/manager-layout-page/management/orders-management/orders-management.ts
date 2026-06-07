import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CheckoutHttpService } from '@backend';
import { OrderDetail, OrderSummary } from '@models/data';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

type Severity = 'info' | 'warn' | 'success' | 'danger' | 'secondary';

const STATUS_LABELS: Record<number, string> = {
  0: 'Ожидает', 1: 'Подтверждён', 2: 'В доставке', 3: 'Доставлен', 4: 'Отменён',
};
const STATUS_SEVERITY: Record<number, Severity> = {
  0: 'warn', 1: 'info', 2: 'info', 3: 'success', 4: 'danger',
};
const TRANSITIONS: Record<number, { label: string; value: number; severity: Severity }[]> = {
  0: [{ label: 'Подтвердить', value: 1, severity: 'info' }, { label: 'Отменить', value: 4, severity: 'danger' }],
  1: [{ label: 'Отправить',   value: 2, severity: 'info' }, { label: 'Отменить', value: 4, severity: 'danger' }],
  2: [{ label: 'Доставлен',   value: 3, severity: 'success' }],
  3: [], 4: [],
};

@Component({
  selector: 'app-orders-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, FormsModule,
    TableModule, ButtonModule, TagModule, DialogModule, DividerModule,
    CardModule, BadgeModule, ProgressSpinnerModule, SelectModule, ToastModule, TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './orders-management.html',
  styleUrl: './orders-management.scss',
})
export class OrdersManagement implements OnInit {
  private readonly http = inject(CheckoutHttpService);
  private readonly msg = inject(MessageService);

  orders = signal<OrderSummary[]>([]);
  filteredOrders = signal<OrderSummary[]>([]);
  loading = signal(true);

  detailVisible = signal(false);
  detailLoading = signal(false);
  selectedOrder = signal<OrderDetail | null>(null);
  statusChanging = signal(false);

  statusFilterOptions = [
    { label: 'Все статусы', value: null },
    { label: 'Ожидает',     value: 0 },
    { label: 'Подтверждён', value: 1 },
    { label: 'В доставке',  value: 2 },
    { label: 'Доставлен',   value: 3 },
    { label: 'Отменён',     value: 4 },
  ];
  selectedStatus: number | null = null;

  readonly statusLabels = STATUS_LABELS;
  readonly statusSeverity = STATUS_SEVERITY;
  readonly transitions = TRANSITIONS;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.http.getAllOrders$().subscribe({
      next: res => {
        const list = res?.data ?? [];
        this.orders.set(list);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(): void {
    const s = this.selectedStatus;
    this.filteredOrders.set(
      s === null ? this.orders() : this.orders().filter(o => o.status === s)
    );
  }

  openDetail(orderId: string): void {
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    this.selectedOrder.set(null);
    this.http.getOrderDetails$(orderId).subscribe({
      next: res => {
        this.selectedOrder.set(res?.data ?? null);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false),
    });
  }

  changeStatus(orderId: string, newStatus: number): void {
    this.statusChanging.set(true);
    this.http.changeStatus$(orderId, newStatus).subscribe({
      next: res => {
        this.statusChanging.set(false);
        if (res?.isSuccess) {
          this.msg.add({ severity: 'success', summary: 'Статус изменён', detail: STATUS_LABELS[newStatus], life: 3000 });
          this.detailVisible.set(false);
          this.loadOrders();
        } else {
          this.msg.add({ severity: 'error', summary: 'Ошибка', detail: res?.message ?? 'Не удалось изменить статус' });
        }
      },
      error: err => {
        this.statusChanging.set(false);
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message ?? err?.message });
      },
    });
  }

  deliveryLabel(type: number | undefined): string {
    return type === 1 ? 'Самовывоз' : 'Курьер';
  }
}
