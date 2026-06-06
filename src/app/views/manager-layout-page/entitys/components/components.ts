import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component as ComponentEntity, DATA_TYPE_LABELS } from '@models/data';
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
import { ComponentsService } from './components.service';

@Component({
  selector: 'app-components',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, FormsModule, ReactiveFormsModule, ToolbarModule, TagModule,
    ConfirmDialogModule, SelectModule],
  templateUrl: './components.html',
  styleUrl: './components.scss',
  providers: [ConfirmationService],
})
export class Components implements OnInit {
  readonly items$: Observable<ComponentEntity[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  readonly dataTypeOptions = [
    { label: 'STRING', value: 0 }, { label: 'INT', value: 1 },
    { label: 'DOUBLE', value: 2 }, { label: 'BOOLEAN', value: 3 },
  ];
  readonly dataTypeLabels = DATA_TYPE_LABELS;

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: ComponentsService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dataType: [0, Validators.required],
      categoryType: [0],
      componentCategoryId: ['', Validators.required],
    });
    this.filterForm = this.fb.group({ title: [''] });
  }

  ngOnInit(): void { this.svc.load(this.paginatorState); }

  onPageChange(e: PaginatorState): void {
    this.paginatorState = e;
    this.svc.load(this.paginatorState, this.filterForm.value.title ?? '');
  }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ dataType: 0, categoryType: 0 }); this.displayForm = true; }

  showEditForm(item: ComponentEntity): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.patchValue(item);
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
        next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Удалено' }); this.svc.load(this.paginatorState, this.filterForm.value.title ?? ''); },
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
