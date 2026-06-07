import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services';
import { AuthHttpService, UserAddressHttpService } from '@backend';
import { UserAddress } from '@models/data';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, RouterModule,
    TabsModule, ButtonModule, CardModule, InputTextModule, FloatLabelModule,
    PasswordModule, TagModule, DividerModule, DialogModule, ToastModule, CheckboxModule,
  ],
  providers: [MessageService],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly authHttp   = inject(AuthHttpService);
  private readonly addrHttp   = inject(UserAddressHttpService);
  private readonly fb         = inject(FormBuilder);
  private readonly router     = inject(Router);
  private readonly msg        = inject(MessageService);

  user = toSignal(this.auth.user$);

  // Форма профиля
  profileForm!: FormGroup;
  profileLoading = signal(false);

  // Форма пароля
  passwordForm!: FormGroup;
  passwordLoading = signal(false);

  // Адреса
  addresses = signal<UserAddress[]>([]);
  addrDialogVisible = signal(false);
  addrForm!: FormGroup;
  editingAddressId = signal<string | null>(null);
  addrLoading = signal(false);

  ngOnInit(): void {
    const u = this.user();
    this.profileForm = this.fb.group({
      name:  [u?.name  ?? '', Validators.required],
      login: [u?.login ?? '', Validators.required],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      repeat:      ['', Validators.required],
    });

    this.initAddrForm();
    this.loadAddresses();
  }

  // ── Профиль ─────────────────────────────────────────────────────────────

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileLoading.set(true);
    this.authHttp.updateProfile$(this.profileForm.value).subscribe({
      next: res => {
        this.profileLoading.set(false);
        if (res?.isSuccess) {
          this.msg.add({ severity: 'success', summary: 'Сохранено', life: 2500 });
          this.auth.getProfile$().subscribe();
        } else {
          this.msg.add({ severity: 'error', summary: 'Ошибка', detail: res?.message ?? '' });
        }
      },
      error: err => {
        this.profileLoading.set(false);
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message });
      },
    });
  }

  // ── Пароль ──────────────────────────────────────────────────────────────

  savePassword(): void {
    const v = this.passwordForm.value;
    if (this.passwordForm.invalid) return;
    if (v.newPassword !== v.repeat) {
      this.msg.add({ severity: 'warn', summary: 'Пароли не совпадают' });
      return;
    }
    this.passwordLoading.set(true);
    this.authHttp.changePassword$({ oldPassword: v.oldPassword, newPassword: v.newPassword }).subscribe({
      next: res => {
        this.passwordLoading.set(false);
        if (res?.isSuccess) {
          this.msg.add({ severity: 'success', summary: 'Пароль изменён', life: 2500 });
          this.passwordForm.reset();
        } else {
          this.msg.add({ severity: 'error', summary: 'Ошибка', detail: res?.message ?? '' });
        }
      },
      error: err => {
        this.passwordLoading.set(false);
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message });
      },
    });
  }

  // ── Адреса ──────────────────────────────────────────────────────────────

  private initAddrForm(addr?: UserAddress): void {
    this.addrForm = this.fb.group({
      label:     [addr?.label   ?? 'Дом', Validators.required],
      address:   [addr?.address ?? '', Validators.required],
      isDefault: [addr?.isDefault ?? false],
    });
  }

  private loadAddresses(): void {
    this.addrHttp.getAll$().subscribe(res => {
      if (res?.isSuccess) this.addresses.set(res.data ?? []);
    });
  }

  openAddAddress(): void {
    this.editingAddressId.set(null);
    this.initAddrForm();
    this.addrDialogVisible.set(true);
  }

  openEditAddress(addr: UserAddress): void {
    this.editingAddressId.set(addr.id);
    this.initAddrForm(addr);
    this.addrDialogVisible.set(true);
  }

  saveAddress(): void {
    if (this.addrForm.invalid) return;
    this.addrLoading.set(true);
    const id = this.editingAddressId();
    const obs = id
      ? this.addrHttp.update$(id, this.addrForm.value)
      : this.addrHttp.create$(this.addrForm.value);

    obs.subscribe({
      next: res => {
        this.addrLoading.set(false);
        if (res?.isSuccess) {
          this.addrDialogVisible.set(false);
          this.loadAddresses();
          this.msg.add({ severity: 'success', summary: id ? 'Обновлено' : 'Добавлено', life: 2000 });
        } else {
          this.msg.add({ severity: 'error', summary: 'Ошибка', detail: res?.message ?? '' });
        }
      },
      error: err => {
        this.addrLoading.set(false);
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message });
      },
    });
  }

  deleteAddress(id: string): void {
    this.addrHttp.delete$(id).subscribe({
      next: () => this.addresses.update(list => list.filter(a => a.id !== id)),
      error: () => this.msg.add({ severity: 'error', summary: 'Не удалось удалить' }),
    });
  }

  // ── Выйти ───────────────────────────────────────────────────────────────

  logout(): void {
    this.auth.logout();
  }
}
