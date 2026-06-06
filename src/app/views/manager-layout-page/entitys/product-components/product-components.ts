import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component as ComponentEntity, ProductComponent, Sku } from '@models/data';
import { ComponentsHttpService, SkusHttpService } from '@backend';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { forkJoin } from 'rxjs';
import { Observable } from 'rxjs';
import { ProductComponentsService } from './product-components.service';

@Component({
  selector: 'app-product-components',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, FormsModule, ReactiveFormsModule, ToolbarModule, TagModule,
    ConfirmDialogModule, CheckboxModule, SelectModule],
  templateUrl: './product-components.html',
  styleUrl: './product-components.scss',
  providers: [ConfirmationService],
})
export class ProductComponents implements OnInit {
  readonly items$: Observable<ProductComponent[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  skuOptions: Sku[] = [];
  componentOptions: ComponentEntity[] = [];

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: ProductComponentsService,
    private skusHttp: SkusHttpService,
    private componentsHttp: ComponentsHttpService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({
      skuId: ['', Validators.required],
      componentId: ['', Validators.required],
      valueJson: ['""', Validators.required],
      filtering: [true],
    });
    this.filterForm = this.fb.group({ skuId: [''] });
  }

  ngOnInit(): void {
    this.svc.load(this.paginatorState);
    const fi = { matchMode: 'Equals', value: '' };
    forkJoin([
      this.skusHttp.getAll$({ skip: 0, take: 500, sortBy: 'Id', sortDirection: 0, id: fi, productId: fi, price: fi, amount: fi, discount: fi }),
      this.componentsHttp.getAll$({ skip: 0, take: 500, sortBy: 'Title', sortDirection: 0, id: fi, title: fi, componentCategoryId: fi, dataType: fi, categoryType: fi }),
    ]).subscribe(([skuRes, compRes]) => {
      this.skuOptions = (skuRes?.data?.items ?? []).map(s => ({ ...s, _label: `${s.price} ₽ (${s.id.slice(0, 8)}…)` }));
      this.componentOptions = compRes?.data?.items ?? [];
      this.cd.markForCheck();
    });
  }

  onPageChange(e: PaginatorState): void { this.paginatorState = e; this.svc.load(e); }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ valueJson: '""', filtering: true }); this.displayForm = true; }

  showEditForm(item: ProductComponent): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.patchValue(item); this.displayForm = true;
  }

  getSkuLabel(id: string): string {
    const sku = this.skuOptions.find(s => s.id === id);
    return sku ? `${sku.price} ₽` : id;
  }

  getComponentTitle(id: string): string {
    return this.componentOptions.find(c => c.id === id)?.title ?? id;
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
