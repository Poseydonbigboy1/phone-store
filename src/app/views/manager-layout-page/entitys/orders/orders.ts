import { AsyncPipe, DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManagerUser, Order, ORDER_STATUS_LABELS, ORDER_STATUS_SEVERITIES, OrderDetail } from '@models/data';
import { CheckoutHttpService, UsersManagerHttpService } from '@backend';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';

/** Allowed transitions: current status → next statuses (int values) */
const TRANSITIONS: Record<number, number[]> = {
  0: [1, 4],  // Pending → Confirmed | Cancelled
  1: [2, 4],  // Confirmed → Shipped | Cancelled
  2: [3],     // Shipped → Delivered
  3: [],      // Delivered (final)
  4: [],      // Cancelled (final)
};

const STATUS_NAMES: Record<number, string> = {
  0: 'Ожидает', 1: 'Подтверждён', 2: 'В доставке', 3: 'Доставлен', 4: 'Отменён',
};

const STATUS_ICONS: Record<number, string> = {
  0: 'pi pi-clock', 1: 'pi pi-check', 2: 'pi pi-truck', 3: 'pi pi-home', 4: 'pi pi-times',
};

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe, SlicePipe, DatePipe, DecimalPipe, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DrawerModule, DialogModule, PaginatorModule,
    InputTextModule, ToolbarModule, TagModule, ConfirmDialogModule, SelectModule,
    ToastModule, DividerModule, ProgressSpinnerModule, TooltipModule,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  providers: [ConfirmationService, MessageService],
})
export class Orders implements OnInit {
  readonly items$: Observable<Order[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusSeverities = ORDER_STATUS_SEVERITIES;
  readonly statusNames = STATUS_NAMES;
  readonly statusIcons = STATUS_ICONS;
  readonly transitions = TRANSITIONS;

  userOptions: ManagerUser[] = [];

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  // Detail dialog
  detailVisible = signal(false);
  detailLoading = signal(false);
  selectedOrder = signal<OrderDetail | null>(null);
  statusChanging = signal(false);

  constructor(
    private svc: OrdersService,
    private usersHttp: UsersManagerHttpService,
    private checkoutHttp: CheckoutHttpService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({
      userId: ['', Validators.required],
      status: [0, Validators.required],
      totalAmount: [0],
      shippingAddress: [''],
    });
    this.filterForm = this.fb.group({ userId: [''] });
  }

  ngOnInit(): void {
    this.svc.load(this.paginatorState);
    this.usersHttp.getAll$({
      skip: 0, take: 500, sortBy: 'Login', sortDirection: 0,
      id: { matchMode: 'Equals', value: '' },
      login: { matchMode: 'Equals', value: '' },
      name: { matchMode: 'Equals', value: '' },
      roles: { matchMode: 'Equals', value: '' },
    }).subscribe(res => { this.userOptions = res?.data?.items ?? []; this.cd.markForCheck(); });
  }

  onPageChange(e: PaginatorState): void { this.paginatorState = e; this.svc.load(e); }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ status: 0, totalAmount: 0 }); this.displayForm = true; }

  showEditForm(item: Order): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.patchValue(item); this.displayForm = true;
  }

  openDetail(item: Order): void {
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    this.selectedOrder.set(null);
    this.checkoutHttp.getMyOrder$(item.id).subscribe({
      next: res => {
        this.selectedOrder.set(res?.data ?? null);
        this.detailLoading.set(false);
        this.cd.markForCheck();
      },
      error: () => {
        this.detailLoading.set(false);
        this.cd.markForCheck();
      },
    });
  }

  changeStatus(orderId: string, newStatus: number): void {
    this.statusChanging.set(true);
    this.checkoutHttp.changeStatus$(orderId, newStatus).subscribe({
      next: res => {
        this.statusChanging.set(false);
        if (res?.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'Статус изменён', detail: STATUS_NAMES[newStatus], life: 3000 });
          this.detailVisible.set(false);
          this.svc.load(this.paginatorState);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: res?.message ?? 'Не удалось изменить статус' });
        }
        this.cd.markForCheck();
      },
      error: err => {
        this.statusChanging.set(false);
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err?.message });
        this.cd.markForCheck();
      },
    });
  }

  getUserLabel(id: string): string {
    const u = this.userOptions.find(u => u.id === id);
    return u ? `${u.login}${u.name ? ' (' + u.name + ')' : ''}` : id.slice(0, 8);
  }

  deliveryLabel(type: number | undefined): string {
    return type === 1 ? 'Самовывоз' : 'Курьер';
  }

  onFormSubmit(): void {
    if (this.form.invalid) return;
    const op$ = this.isEditMode
      ? this.svc.update$({ id: this.selectedId!, orderDate: new Date().toISOString(), ...this.form.value })
      : this.svc.create$({ orderDate: new Date().toISOString(), ...this.form.value });
    op$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: this.isEditMode ? 'Обновлено' : 'Создано' });
        this.displayForm = false;
        this.svc.load(this.paginatorState);
      },
      error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
    });
  }

  delete(id: string): void {
    this.confirmationService.confirm({
      message: 'Удалить заказ?', header: 'Подтверждение', icon: 'pi pi-exclamation-triangle',
      accept: () => this.svc.delete$(id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Удалено' }); this.svc.load(this.paginatorState); },
        error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
      }),
    });
  }

  applyFilters(): void {
    this.appliedFilters = [];
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.svc.load(this.paginatorState);
  }

  removeFilter(key: string): void { this.filterForm.get(key)?.reset(); this.applyFilters(); }
}
