import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BannerHttpService, Banner, UploadHttpService } from '@backend';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-banners',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule, CardModule, TableModule, TagModule,
    DialogModule, InputTextModule,
    ConfirmDialogModule, ToastModule,
    ProgressSpinnerModule, TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './banners.html',
  styleUrl: './banners.scss',
})
export class BannersPage implements OnInit {
  private readonly http       = inject(BannerHttpService);
  private readonly uploadHttp = inject(UploadHttpService);
  private readonly msg        = inject(MessageService);
  private readonly confirm    = inject(ConfirmationService);

  banners      = signal<Banner[]>([]);
  loading      = signal(true);
  uploading    = signal(false);
  dialogVisible = signal(false);

  // Форма нового баннера
  newLink   = '';
  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.getAll$().subscribe({
      next: res => {
        this.banners.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ─── Открыть диалог добавления ───────────────────────────────────
  openAdd(): void {
    this.newLink = '';
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.dialogVisible.set(true);
  }

  // ─── Выбор файла через input ─────────────────────────────────────
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────
  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  // ─── Сохранить новый баннер ──────────────────────────────────────
  save(): void {
    const file = this.selectedFile();
    if (!file) {
      this.msg.add({ severity: 'warn', summary: 'Выберите изображение', life: 3000 });
      return;
    }

    this.uploading.set(true);
    this.uploadHttp.uploadImage$(file).subscribe({
      next: uploadRes => {
        if (!uploadRes?.isSuccess) {
          this.msg.add({ severity: 'error', summary: uploadRes?.message ?? 'Ошибка загрузки', life: 4000 });
          this.uploading.set(false);
          return;
        }

        this.http.create$({ imageUrl: uploadRes.data!, link: this.newLink, isActive: true }).subscribe({
          next: res => {
            this.uploading.set(false);
            if (res?.isSuccess) {
              this.banners.update(list => [...list, res.data!]);
              this.dialogVisible.set(false);
              this.msg.add({ severity: 'success', summary: 'Баннер добавлен', life: 3000 });
            }
          },
          error: () => {
            this.uploading.set(false);
            this.msg.add({ severity: 'error', summary: 'Ошибка сохранения', life: 4000 });
          },
        });
      },
      error: () => {
        this.uploading.set(false);
        this.msg.add({ severity: 'error', summary: 'Ошибка загрузки файла', life: 4000 });
      },
    });
  }

  // ─── Переключить активность ──────────────────────────────────────
  toggleActive(banner: Banner): void {
    const newVal = !banner.isActive;
    this.http.update$(banner.id, { isActive: newVal }).subscribe(res => {
      if (res?.isSuccess) {
        this.banners.update(list =>
          list.map(b => b.id === banner.id ? { ...b, isActive: newVal } : b)
        );
      }
    });
  }

  // ─── Переместить вверх / вниз ────────────────────────────────────
  move(banner: Banner, dir: -1 | 1): void {
    const list  = [...this.banners()];
    const idx   = list.findIndex(b => b.id === banner.id);
    const other = idx + dir;
    if (other < 0 || other >= list.length) return;

    [list[idx], list[other]] = [list[other], list[idx]];
    // Пересчитать SortOrder
    const updated = list.map((b, i) => ({ ...b, sortOrder: i }));
    this.banners.set(updated);

    this.http.reorder$(updated.map(b => ({ id: b.id, sortOrder: b.sortOrder }))).subscribe();
  }

  // ─── Удалить ─────────────────────────────────────────────────────
  deleteBanner(banner: Banner): void {
    this.confirm.confirm({
      message: 'Удалить этот баннер?',
      header: 'Подтверждение',
      icon: 'pi pi-trash',
      accept: () => {
        this.http.delete$(banner.id).subscribe(res => {
          if (res?.isSuccess) {
            this.banners.update(list => list.filter(b => b.id !== banner.id));
            this.msg.add({ severity: 'success', summary: 'Баннер удалён', life: 3000 });
          }
        });
      },
    });
  }
}
