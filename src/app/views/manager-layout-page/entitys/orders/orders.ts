import { AsyncPipe, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_SEVERITIES } from '@models/data';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, SlicePipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, FormsModule, ReactiveFormsModule, ToolbarModule, TagModule,
    ConfirmDialogModule, SelectModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  providers: [ConfirmationService],
})
export class Orders implements OnInit {
  readonly items$: Observable<Order[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  readonly statusOptions = [
    { label: 'В ожидании', value: 0 }, { label: 'В обработке', value: 1 },
    { label: 'Отправлен', value: 2 }, { label: 'Доставлен', value: 3 }, { label: 'Отменён', value: 4 },
  ];
  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusSeverities = ORDER_STATUS_SEVERITIES;

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: OrdersService,
    private fb: FormBuilder,
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

  ngOnInit(): void { this.svc.load(this.paginatorState); }

  onPageChange(e: PaginatorState): void { this.paginatorState = e; this.svc.load(e, this.filterForm.value.userId ?? ''); }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ status: 0, totalAmount: 0 }); this.displayForm = true; }

  showEditForm(item: Order): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.patchValue(item); this.displayForm = true;
  }

  onFormSubmit(): void {
    if (this.form.invalid) return;
    const op$ = this.isEditMode
      ? this.svc.update$({ id: this.selectedId!, orderDate: new Date().toISOString(), ...this.form.value })
      : this.svc.create$({ orderDate: new Date().toISOString(), ...this.form.value });
    op$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: this.isEditMode ? 'Обновлено' : 'Создано' }); this.displayForm = false; this.svc.load(this.paginatorState, this.filterForm.value.userId ?? ''); },
      error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
    });
  }

  delete(id: string): void {
    this.confirmationService.confirm({
      message: 'Удалить заказ?', header: 'Подтверждение', icon: 'pi pi-exclamation-triangle',
      accept: () => this.svc.delete$(id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Удалено' }); this.svc.load(this.paginatorState, this.filterForm.value.userId ?? ''); },
        error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
      }),
    });
  }

  applyFilters(): void {
    this.appliedFilters = [];
    const userId = this.filterForm.get('userId')?.value;
    if (userId) this.appliedFilters.push({ key: 'userId', value: userId });
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.svc.load(this.paginatorState, userId ?? '');
  }

  removeFilter(key: string): void { this.filterForm.get(key)?.reset(); this.applyFilters(); }
}
