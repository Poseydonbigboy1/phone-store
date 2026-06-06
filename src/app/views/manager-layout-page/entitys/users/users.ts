import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManagerUser, ROLE_LABELS } from '@models/data';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { Observable } from 'rxjs';
import { UsersManagerService } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, TableModule, ButtonModule, DrawerModule, PaginatorModule,
    InputTextModule, PasswordModule, FormsModule, ReactiveFormsModule, ToolbarModule,
    TagModule, ConfirmDialogModule, SelectModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  providers: [ConfirmationService],
})
export class Users implements OnInit {
  readonly items$: Observable<ManagerUser[]>;
  readonly total$: Observable<number>;
  readonly loading$: Observable<boolean>;

  readonly roleOptions = [{ label: 'CUSTOMER', value: 0 }, { label: 'MANAGER', value: 1 }];
  readonly roleLabels = ROLE_LABELS;

  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  displayForm = false;
  form: FormGroup;
  isEditMode = false;
  selectedId: string | null = null;
  displayFilter = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private svc: UsersManagerService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.items$ = svc.items$;
    this.total$ = svc.total$;
    this.loading$ = svc.loading$;
    this.form = this.fb.group({
      login: ['', Validators.required],
      name: [''],
      password: ['', Validators.required],
      roles: [0, Validators.required],
    });
    this.filterForm = this.fb.group({ login: [''] });
  }

  ngOnInit(): void { this.svc.load(this.paginatorState); }

  onPageChange(e: PaginatorState): void { this.paginatorState = e; this.svc.load(e, this.filterForm.value.login ?? ''); }

  showAddForm(): void { this.isEditMode = false; this.form.reset({ roles: 0 }); this.form.get('password')?.setValidators(Validators.required); this.form.get('password')?.updateValueAndValidity(); this.displayForm = true; }

  showEditForm(item: ManagerUser): void {
    this.isEditMode = true; this.selectedId = item.id;
    this.form.get('password')?.clearValidators(); this.form.get('password')?.updateValueAndValidity();
    this.form.patchValue({ login: item.login, name: item.name, roles: item.roles, password: '' });
    this.displayForm = true;
  }

  onFormSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    const payload: Partial<ManagerUser> = { login: value.login, name: value.name, roles: value.roles };
    if (value.password) payload.password = value.password;
    const op$ = this.isEditMode
      ? this.svc.update$({ id: this.selectedId!, ...payload } as ManagerUser)
      : this.svc.create$(payload);
    op$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: this.isEditMode ? 'Обновлено' : 'Создано' }); this.displayForm = false; this.svc.load(this.paginatorState, this.filterForm.value.login ?? ''); },
      error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
    });
  }

  delete(id: string): void {
    this.confirmationService.confirm({
      message: 'Удалить пользователя?', header: 'Подтверждение', icon: 'pi pi-exclamation-triangle',
      accept: () => this.svc.delete$(id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Удалено' }); this.svc.load(this.paginatorState, this.filterForm.value.login ?? ''); },
        error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
      }),
    });
  }

  applyFilters(): void {
    this.appliedFilters = [];
    const login = this.filterForm.get('login')?.value;
    if (login) this.appliedFilters.push({ key: 'login', value: login });
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.svc.load(this.paginatorState, login ?? '');
  }

  removeFilter(key: string): void { this.filterForm.get(key)?.reset(); this.applyFilters(); }
}
