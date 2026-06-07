import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ProductDetailsService } from './product-details-page.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '@services';
import { map } from 'rxjs';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    GalleriaModule, CardModule, ButtonModule, FieldsetModule,
    TabsModule, TableModule, ProgressSpinnerModule, ToastModule,
    TagModule, DividerModule, ChipModule,
  ],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.scss',
  providers: [ProductDetailsService, MessageService],
})
export class ProductDetailsPage {
  private productDetailsService = inject(ProductDetailsService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  product = toSignal(this.productDetailsService.product$);
  isLoggedIn = toSignal(this.authService.user$.pipe(map(u => !!u)));
  addingToCart = signal(false);

  // Выбранный SKU (по умолчанию — mainSku)
  selectedSkuId = signal<string | null>(null);

  // Текущий SKU — mainSku или выбранный из additionalSkus
  currentSku = computed(() => {
    const p = this.product();
    if (!p) return null;
    const id = this.selectedSkuId();
    if (!id || id === p.mainSku?.skuId) return p.mainSku;
    return p.additionalSkus?.find((s: any) => s.skuId === id) ?? p.mainSku;
  });

  // Все варианты для чипов (mainSku + additionalSkus)
  allSkus = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [p.mainSku, ...(p.additionalSkus ?? [])].filter(Boolean);
  });

  // Метка чипа: первый специфичный компонент или цена
  skuLabel(sku: any): string {
    const comp = sku?.skuSpecificComponents?.[0];
    if (comp) return `${comp.value}`;
    return `${sku?.price?.toLocaleString('ru-RU') ?? ''} ₽`;
  }

  selectSku(sku: any): void {
    this.selectedSkuId.set(sku.skuId);
  }

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px',  numVisible: 3 },
    { breakpoint: '560px',  numVisible: 1 },
  ];

  addToCart(): void {
    const sku = this.currentSku();
    const p = this.product();
    if (!sku || !p) return;

    if (!this.isLoggedIn()) {
      this.cartService.addLocal(sku.skuId, 1);
      this.messageService.add({ severity: 'info', summary: 'Добавлено в корзину', detail: 'Войдите, чтобы оформить заказ', life: 3000 });
      return;
    }

    this.addingToCart.set(true);
    this.cartService.add(sku.skuId, 1).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.messageService.add({ severity: 'success', summary: 'Добавлено в корзину', detail: p.title, life: 3000 });
      },
      error: (err) => {
        this.addingToCart.set(false);
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message ?? 'Не удалось добавить товар', life: 4000 });
      },
    });
  }
}
