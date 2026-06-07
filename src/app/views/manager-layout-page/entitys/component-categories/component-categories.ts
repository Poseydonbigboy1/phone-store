import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentCategory } from '@models/data';
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
import { ComponentCategoryService } from './component-categories.service';

@Component({
  selector: 'app-component-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, FormsModule, ReactiveFormsModule, ToolbarModule, TagModule, ConfirmDialogModule],
  templateUrl: './component-categories.html',
  styleUrl: './component-categories.scss',
  providers: [ConfirmationService],
})
export class ComponentCategories implements OnInit {
  readonly items$: Observable<ComponentCategory[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: ComponentCategoryService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({ title: ['', Validators.required] });
    this.filterForm = this.fb.group({ title: [''] });
  }

  ngOnInit(): void { this.svc.load(this.paginatorState); }

  onPageChange(event: PaginatorState): void {
    this.paginatorState = event;
    this.svc.load(this.paginatorState, this.filterForm.value.title ?? '');
  }

  showAddForm(): void { this.isEditMode = false; this.form.reset(); this.displayForm = true; }

  showEditForm(item: ComponentCategory): void {
    this.isEditMode = true;
    this.selectedId = item.id;
    this.form.patchValue({ title: item.title });
    this.displayForm = true;
  }

  onFormSubmit(): void {
    if (this.form.invalid) return;
    const op$ = this.isEditMode
      ? this.svc.update$({ id: this.selectedId!, ...this.form.value })
      : this.svc.create$(this.form.value);
    op$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: this.isEditMode ? 'Обновлено' : 'Создано' });
        this.displayForm = false;
        this.svc.load(this.paginatorState, this.filterForm.value.title ?? '');
      },
      error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
    });
  }

  delete(id: string): void {
    this.confirmationService.confirm({
      message: 'Удалить запись?', header: 'Подтверждение', icon: 'pi pi-exclamation-triangle',
      accept: () => this.svc.delete$(id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Удалено' });
          this.svc.load(this.paginatorState, this.filterForm.value.title ?? '');
        },
        error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
      }),
    });
  }

  applyFilters(): void {
    this.appliedFilters = [];
    const title = this.filterForm.get('title')?.value;
    if (title) this.appliedFilters.push({ key: 'title', value: title });
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.svc.load(this.paginatorState, title ?? '');
  }

  removeFilter(key: string): void { this.filterForm.get(key)?.reset(); this.applyFilters(); }
}
