import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductDetailsService } from './product-details-page.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CatalogHttpService } from '@backend';
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
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, RouterModule,
    GalleriaModule, CardModule, ButtonModule, FieldsetModule,
    TabsModule, TableModule, ProgressSpinnerModule, ToastModule,
    TagModule, DividerModule, ChipModule, CarouselModule, TooltipModule,
  ],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.scss',
  providers: [ProductDetailsService, MessageService],
})
export class ProductDetailsPage implements OnInit {
  private productDetailsService = inject(ProductDetailsService);
  private cartService           = inject(CartService);
  private wishlistService       = inject(WishlistService);
  private catalogHttp           = inject(CatalogHttpService);
  private authService           = inject(AuthService);
  private messageService        = inject(MessageService);

  product      = toSignal(this.productDetailsService.product$);
  isLoggedIn   = toSignal(this.authService.user$.pipe(map(u => !!u)));
  addingToCart = signal(false);
  similar      = signal<any[]>([]);

  selectedSkuId = signal<string | null>(null);

  currentSku = computed(() => {
    const p = this.product();
    if (!p) return null;
    const id = this.selectedSkuId();
    if (!id || id === p.mainSku?.skuId) return p.mainSku;
    return p.additionalSkus?.find((s: any) => s.skuId === id) ?? p.mainSku;
  });

  allSkus = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [p.mainSku, ...(p.additionalSkus ?? [])].filter(Boolean);
  });

  inWishlist = computed(() => {
    const sku = this.currentSku();
    return sku ? this.wishlistService.isInWishlist(sku.skuId) : false;
  });

  ngOnInit(): void {
    // Load similar products and track recently viewed once main product is resolved
    this.productDetailsService.product$.subscribe(p => {
      if (p?.mainSku?.skuId) {
        this.catalogHttp.getSimilar$(p.mainSku.skuId, 8).subscribe(res => {
          this.similar.set(res?.data ?? []);
        });
        this.trackRecentlyViewed(p.mainSku.skuId);
      }
    });
  }

  private trackRecentlyViewed(skuId: string): void {
    const KEY = 'recently_viewed';
    const MAX = 10;
    let ids: string[] = [];
    try { ids = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { ids = []; }
    // Remove duplicate, prepend
    ids = [skuId, ...ids.filter(id => id !== skuId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  skuLabel(sku: any): string {
    const comp = sku?.skuSpecificComponents?.[0];
    if (comp) return `${comp.value}`;
    return `${sku?.price?.toLocaleString('ru-RU') ?? ''} ₽`;
  }

  selectSku(sku: any): void {
    this.selectedSkuId.set(sku.skuId);
  }

  toggleWishlist(skuId: string): void {
    this.wishlistService.toggle(skuId);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(url);
  }

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px',  numVisible: 3 },
    { breakpoint: '560px',  numVisible: 1 },
  ];

  // numVisible=4 — для экранов > 1440px
  carouselOptions = [
    { breakpoint: '1440px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1280px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px',  numVisible: 2, numScroll: 1 },
    { breakpoint: '576px',  numVisible: 2, numScroll: 1 },
    { breakpoint: '480px',  numVisible: 1, numScroll: 1 },
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
