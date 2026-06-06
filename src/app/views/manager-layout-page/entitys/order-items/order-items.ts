import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order, OrderItem, Sku } from '@models/data';
import { OrdersHttpService, SkusHttpService } from '@backend';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { forkJoin, Observable } from 'rxjs';
import { OrderItemsService } from './order-items.service';

type OrderOption = Order & { _label: string };
type SkuOption = Sku & { _label: string };

@Component({
  selector: 'app-order-items',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, InputNumberModule, FormsModule, ReactiveFormsModule, ToolbarModule,
    TagModule, ConfirmDialogModule, SelectModule],
  templateUrl: './order-items.html',
  styleUrl: './order-items.scss',
  providers: [ConfirmationService],
})
export class OrderItems implements OnInit {
  readonly items$: Observable<OrderItem[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  orderOptions: OrderOption[] = [];
  skuOptions: SkuOption[] = [];

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: OrderItemsService,
    private ordersHttp: OrdersHttpService,
    private skusHttp: SkusHttpService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({
      orderId: ['', Validators.required],
      skuId: ['', Validators.required],
      quantity: [1, Validators.required],
      price: [0, Validators.required],
    });
    this.filterForm = this.fb.group({ orderId: [''] });
  }

  ngOnInit(): void {
    this.svc.load(this.paginatorState);
    const fi = { matchMode: 'Equals', value: '' };
    forkJoin([
      this.ordersHttp.getAll$({ skip: 0, take: 500, sortBy: 'Id', sortDirection: 0, id: fi, userId: fi, status: fi, shippingAddress: fi, totalAmount: fi }),
      this.skusHttp.getAll$({ skip: 0, take: 500, sortBy: 'Id', sortDirection: 0, id: fi, productId: fi, price: fi, amount: fi, discount: fi }),
    ]).subscribe(([orderRes, skuRes]) => {
      this.orderOptions = (orderRes?.data?.items ?? []).map(o => ({ ...o, _label: `${o.id.slice(0, 8)}… | ${o.totalAmount} ₽` }));
      this.skuOptions = (skuRes?.data?.items ?? []).map(s => ({ ...s, _label: `${s.price} ₽ (${s.id.slice(0, 8)}…)` }));
      this.cd.markForCheck();
    });
  }

  onPageChange(e: PaginatorState): void { this.paginatorState = e; this.svc.load(e); }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ quantity: 1, price: 0 }); this.displayForm = true; }

  showEditForm(item: OrderItem): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.patchValue(item); this.displayForm = true;
  }

  getOrderLabel(id: string): string {
    return this.orderOptions.find(o => o.id === id)?._label ?? id.slice(0, 8) + '…';
  }

  getSkuLabel(id: string): string {
    return this.skuOptions.find(s => s.id === id)?._label ?? id.slice(0, 8) + '…';
  }

  onFormSubmit(): void {
    if (this.form.invalid) return;
    const op$ = this.isEditMode
      ? this.svc.update$({ id: this.selectedId!, ...this.form.value })
      : this.svc.create$(this.form.value);
    op$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: this.isEditMode ? 'Обновлено' : 'Создано' }); this.displayForm = false; this.svc.load(this.paginatorState); },
      error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
    });
  }

  delete(id: string): void {
    this.confirmationService.confirm({
      message: 'Удалить запись?', header: 'Подтверждение', icon: 'pi pi-exclamation-triangle',
      accept: () => this.svc.delete$(id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Удалено' }); this.svc.load(this.paginatorState); },
        error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
      }),
    });
  }

  applyFilters(): void {
    this.appliedFilters = [];
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.svc.load(this.paginatorState);
  }

  removeFilter(key: string): void { this.filterForm.get(key)?.reset(); this.applyFilters(); }
}
