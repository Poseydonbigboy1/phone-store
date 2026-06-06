import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, Sku } from '@models/data';
import { ProductsManagerHttpService } from '@backend';
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
import { Observable } from 'rxjs';
import { SkusService } from './skus.service';

@Component({
  selector: 'app-skus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DecimalPipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, InputNumberModule, FormsModule, ReactiveFormsModule, ToolbarModule,
    TagModule, ConfirmDialogModule, SelectModule],
  templateUrl: './skus.html',
  styleUrl: './skus.scss',
  providers: [ConfirmationService],
})
export class Skus implements OnInit {
  readonly items$: Observable<Sku[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  productOptions: Product[] = [];

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: SkusService,
    private productsHttp: ProductsManagerHttpService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({
      productId: ['', Validators.required],
      price: [0, Validators.required],
      amount: [0],
      discount: [0],
    });
    this.filterForm = this.fb.group({ productId: [''] });
  }

  ngOnInit(): void {
    this.svc.load(this.paginatorState);
    const fi = { matchMode: 'Equals', value: '' };
    this.productsHttp.getAll$({ skip: 0, take: 500, sortBy: 'Title', sortDirection: 0, id: fi, title: fi, brandId: fi })
      .subscribe(res => { this.productOptions = res?.data?.items ?? []; this.cd.markForCheck(); });
  }

  onPageChange(e: PaginatorState): void { this.paginatorState = e; this.svc.load(e); }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ price: 0, amount: 0, discount: 0 }); this.displayForm = true; }

  showEditForm(item: Sku): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.patchValue(item); this.displayForm = true;
  }

  getProductTitle(id: string): string {
    return this.productOptions.find(p => p.id === id)?.title ?? id;
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
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.svc.load(this.paginatorState);
  }

  removeFilter(key: string): void { this.filterForm.get(key)?.reset(); this.applyFilters(); }
}
