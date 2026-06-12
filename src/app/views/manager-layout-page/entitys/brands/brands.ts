import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand } from '@models/data';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { Observable } from 'rxjs';
import { BrandService } from './brands.service';

@Component({
  selector: 'app-brands',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    TableModule,
    ButtonModule,
    DrawerModule,
    PaginatorModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ToolbarModule,
    TagModule,
    ConfirmDialogModule,
  ],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
  providers: [ConfirmationService],
})
export class Brands implements OnInit {
  readonly brands$: Observable<Brand[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };

  displayForm = false;
  brandForm: FormGroup;
  isEditMode = false;
  selectedBrandId: string | null = null;

  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; text: string }[] = [];

  constructor(
    private brandService: BrandService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.brands$ = brandService.brands$;
    this.total$ = brandService.total$;
    this.loading$ = brandService.loading$;
    this.brandForm = this.fb.group({ title: ['', Validators.required] });
    this.filterForm = this.fb.group({ title: [''] });
  }

  ngOnInit(): void {
    this.brandService.loadBrands(this.paginatorState, {});
  }

  onPageChange(event: PaginatorState): void {
    this.paginatorState = event;
    this.brandService.loadBrands(this.paginatorState, this.filterForm.value);
  }

  showAddForm(): void {
    this.isEditMode = false;
    this.brandForm.reset();
    this.displayForm = true;
  }

  showEditForm(brand: Brand): void {
    this.isEditMode = true;
    this.selectedBrandId = brand.id;
    this.brandForm.patchValue({ title: brand.title });
    this.displayForm = true;
  }

  onFormSubmit(): void {
    if (this.brandForm.invalid) return;
    const title = this.brandForm.value.title;
    const op$ = this.isEditMode
      ? this.brandService.updateBrand$(this.selectedBrandId!, title)
      : this.brandService.addBrand$(title);

    op$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: this.isEditMode ? 'Бренд обновлён' : 'Бренд добавлен',
        });
        this.displayForm = false;
        this.brandService.loadBrands(this.paginatorState, this.filterForm.value);
      },
      error: (err: Error) => {
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
      },
    });
  }

  deleteBrand(id: string): void {
    this.confirmationService.confirm({
      message: 'Удалить бренд?',
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.brandService.deleteBrand$(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Бренд удалён' });
            this.brandService.loadBrands(this.paginatorState, this.filterForm.value);
          },
          error: (err: Error) => {
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
          },
        });
      },
    });
  }

  applyFilters(): void {
    this.appliedFilters = [];
    const title = this.filterForm.get('title')?.value;
    if (title) this.appliedFilters.push({ key: 'title', text: `Название содержит «${title}»` });
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.brandService.loadBrands(this.paginatorState, this.filterForm.value);
  }

  removeFilter(key: string): void {
    this.filterForm.get(key)?.reset();
    this.applyFilters();
  }
}
