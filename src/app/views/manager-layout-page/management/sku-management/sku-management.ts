import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ComponentsHttpService, ProductsManagerHttpService, SkuManagementHttpService,
  SkuManagementViewModel, SkuImageViewModel, SkuComponentView, UploadHttpService,
} from '@backend';
import { Component as ComponentModel, Product } from '@models/data';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';

const fi = { matchMode: 'Equals', value: '' };

@Component({
  selector: 'app-sku-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, ReactiveFormsModule,
    TableModule, ButtonModule, TagModule, ChipModule, DialogModule, DrawerModule,
    DividerModule, CardModule, FloatLabelModule, InputTextModule, InputNumberModule,
    SelectModule, ConfirmDialogModule, ToastModule, ProgressSpinnerModule, TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sku-management.html',
  styleUrl: './sku-management.scss',
})
export class SkuManagement implements OnInit {
  private readonly skuHttp     = inject(SkuManagementHttpService);
  private readonly productsHttp = inject(ProductsManagerHttpService);
  private readonly compHttp    = inject(ComponentsHttpService);
  private readonly uploadHttp  = inject(UploadHttpService);
  private readonly msg         = inject(MessageService);
  private readonly confirm     = inject(ConfirmationService);
  private readonly fb          = inject(FormBuilder);

  // EDataType.IMAGE = 4 (порядок: STRING=0, INT=1, DOUBLE=2, BOOLEAN=3, IMAGE=4)
  readonly IMAGE_DATA_TYPE = 4;
  uploadingIndex = signal<number | null>(null);

  skus        = signal<SkuManagementViewModel[]>([]);
  products    = signal<Product[]>([]);
  components  = signal<ComponentModel[]>([]);
  loading     = signal(true);

  // Карточка просмотра
  cardVisible = signal(false);
  selectedSku = signal<SkuManagementViewModel | null>(null);

  // Форма создания/редактирования
  formVisible  = signal(false);
  isEdit       = signal(false);
  formLoading  = signal(false);
  form!: FormGroup;

  // Менеджер изображений
  imagesVisible    = signal(false);
  imagesSku        = signal<SkuManagementViewModel | null>(null);
  images           = signal<SkuImageViewModel[]>([]);
  imagesLoading    = signal(false);
  uploadingImages  = signal(false);
  isDragOver       = signal(false);

  // Изображения в карточке просмотра
  cardImages       = signal<SkuImageViewModel[]>([]);
  cardImagesLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    forkJoin({
      skus:     this.skuHttp.getAll$(),
      products: this.productsHttp.getAll$({ skip: 0, take: 1000, sortBy: 'Title', sortDirection: 0,
                  id: fi, brandId: fi, title: fi }),
      comps:    this.compHttp.getAll$({ skip: 0, take: 1000, sortBy: 'Title', sortDirection: 0,
                  id: fi, title: fi, componentCategoryId: fi, dataType: fi, categoryType: fi }),
    }).subscribe(({ skus, products, comps }) => {
      this.skus.set(skus?.data ?? []);
      this.products.set(products?.data?.items ?? []);
      this.components.set(comps?.data?.items ?? []);
      this.loading.set(false);
    });
  }

  private initForm(sku?: SkuManagementViewModel): void {
    this.form = this.fb.group({
      id:        [sku?.id ?? null],
      productId: [sku?.productId ?? '', Validators.required],
      price:     [sku?.price ?? 0, [Validators.required, Validators.min(0)]],
      discount:  [sku?.discount ?? 0, [Validators.min(0), Validators.max(100)]],
      amount:    [sku?.amount ?? 0, [Validators.required, Validators.min(0)]],
      components: this.fb.array(
        (sku?.components ?? []).map(c => this.makeCompRow(c))
      ),
    });
  }

  private makeCompRow(c?: SkuComponentView): FormGroup {
    return this.fb.group({
      productComponentId: [c?.productComponentId ?? null],
      componentId:        [c?.componentId ?? '', Validators.required],
      value:              [c?.value ?? '', Validators.required],
    });
  }

  get compArray(): FormArray { return this.form.get('components') as FormArray; }

  addComponent(): void { this.compArray.push(this.makeCompRow()); }
  removeComponent(i: number): void { this.compArray.removeAt(i); }

  openCard(sku: SkuManagementViewModel): void {
    this.selectedSku.set(sku);
    this.cardImages.set([]);
    this.cardVisible.set(true);
    this.cardImagesLoading.set(true);
    this.skuHttp.getImages$(sku.id).subscribe({
      next: res => { this.cardImages.set(res?.data ?? []); this.cardImagesLoading.set(false); },
      error: () => this.cardImagesLoading.set(false),
    });
  }

  openCreate(): void {
    this.isEdit.set(false);
    this.initForm();
    this.formVisible.set(true);
  }

  openEdit(sku: SkuManagementViewModel): void {
    this.isEdit.set(true);
    this.initForm(sku);
    this.formVisible.set(true);
    this.cardVisible.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    this.formLoading.set(true);
    const v = this.form.value;
    this.skuHttp.upsert$({
      id:         v.id ?? undefined,
      productId:  v.productId,
      price:      v.price,
      discount:   v.discount,
      amount:     v.amount,
      components: v.components,
    }).subscribe({
      next: res => {
        this.formLoading.set(false);
        if (res?.isSuccess) {
          this.msg.add({ severity: 'success', summary: this.isEdit() ? 'Обновлено' : 'Создано', life: 3000 });
          this.formVisible.set(false);
          this.reload();
        } else {
          this.msg.add({ severity: 'error', summary: 'Ошибка', detail: res?.message ?? undefined });
        }
      },
      error: err => {
        this.formLoading.set(false);
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message ?? err?.message });
      },
    });
  }

  deleteSku(sku: SkuManagementViewModel): void {
    this.confirm.confirm({
      message: `Удалить SKU «${sku.productTitle}»?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.skuHttp.delete$(sku.id).subscribe({
          next: () => { this.msg.add({ severity: 'success', summary: 'Удалено', life: 2000 }); this.reload(); },
          error: err => this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message }),
        });
      },
    });
  }

  private reload(): void {
    this.skuHttp.getAll$().subscribe(res => this.skus.set(res?.data ?? []));
  }

  stockSeverity(amount: number): 'success' | 'warn' | 'danger' {
    if (amount > 10) return 'success';
    if (amount > 0)  return 'warn';
    return 'danger';
  }

  componentLabel(id: string): string {
    return this.components().find(c => c.id === id)?.title ?? id;
  }

  // ─── Менеджер изображений ──────────────────────────────────────────────────

  openImages(sku: SkuManagementViewModel): void {
    this.imagesSku.set(sku);
    this.imagesVisible.set(true);
    this.loadImages(sku.id);
  }

  private loadImages(skuId: string): void {
    this.imagesLoading.set(true);
    this.skuHttp.getImages$(skuId).subscribe({
      next: res => { this.images.set(res?.data ?? []); this.imagesLoading.set(false); },
      error: () => { this.imagesLoading.set(false); },
    });
  }

  onImagesFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;
    this.uploadFiles(Array.from(files));
    (event.target as HTMLInputElement).value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void { this.isDragOver.set(false); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.uploadFiles(Array.from(files));
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(url);
  }

  private uploadFiles(files: File[]): void {
    const sku = this.imagesSku();
    if (!sku) return;
    const mediaFiles = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (!mediaFiles.length) {
      this.msg.add({ severity: 'warn', summary: 'Выберите изображение или видео', life: 3000 });
      return;
    }
    const imageFiles = mediaFiles;
    this.uploadingImages.set(true);
    let done = 0;
    let errors = 0;
    imageFiles.forEach(file => {
      this.skuHttp.uploadImage$(sku.id, file).subscribe({
        next: res => {
          done++;
          if (res?.isSuccess && res.data) {
            this.images.update(list => [...list, res.data!]);
            // Обновляем превью в основном списке SKU
            this.skus.update(list => list.map(s =>
              s.id === sku.id ? { ...s } : s
            ));
          } else { errors++; }
          if (done + errors === imageFiles.length) this.uploadingImages.set(false);
        },
        error: () => {
          errors++;
          if (done + errors === imageFiles.length) this.uploadingImages.set(false);
          this.msg.add({ severity: 'error', summary: 'Ошибка загрузки' });
        },
      });
    });
  }

  deleteImage(img: SkuImageViewModel, fromCard = false): void {
    const sku = fromCard ? this.selectedSku() : this.imagesSku();
    if (!sku) return;
    this.skuHttp.deleteImage$(sku.id, img.productComponentId).subscribe({
      next: () => {
        this.images.update(list => list.filter(i => i.productComponentId !== img.productComponentId));
        this.cardImages.update(list => list.filter(i => i.productComponentId !== img.productComponentId));
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Не удалось удалить', life: 3000 }),
    });
  }

  isImageComponent(componentId: string): boolean {
    const comp = this.components().find(c => c.id === componentId);
    return (comp as any)?.dataType === this.IMAGE_DATA_TYPE;
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingIndex.set(index);
    this.uploadHttp.uploadImage$(file).subscribe({
      next: res => {
        this.uploadingIndex.set(null);
        if (res?.isSuccess && res.data) {
          this.compArray.at(index).patchValue({ value: res.data });
          this.msg.add({ severity: 'success', summary: 'Загружено', life: 2000 });
        } else {
          this.msg.add({ severity: 'error', summary: 'Ошибка загрузки', detail: res?.message ?? undefined });
        }
        input.value = '';
      },
      error: err => {
        this.uploadingIndex.set(null);
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message ?? 'Не удалось загрузить файл' });
        input.value = '';
      },
    });
  }
}
