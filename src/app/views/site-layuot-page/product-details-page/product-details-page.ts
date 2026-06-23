import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductDetailsService } from './product-details-page.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CatalogHttpService } from '@backend';
import { AuthService } from '@services';
import { map } from 'rxjs';
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
    CardModule, ButtonModule, FieldsetModule,
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
  private route                 = inject(ActivatedRoute);

  /** Индекс активного изображения в галерее (signal — надёжно работает в zoneless) */
  activeImageIndex = signal(0);

  product      = toSignal(this.productDetailsService.product$);
  isLoggedIn   = toSignal(this.authService.user$.pipe(map(u => !!u)));
  addingToCart = signal(false);
  similar      = signal<any[]>([]);

  // ── Selection state ──────────────────────────────────────────
  selectedConfigKey = signal<string | null>(null);
  selectedColor     = signal<string | null>(null);

  // ── All SKUs flat list ────────────────────────────────────────
  allSkus = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [p.mainSku, ...(p.additionalSkus ?? [])].filter(Boolean);
  });

  // ── Non-color characteristics whose values differ between SKUs ─
  varyingNonColorCharNames = computed(() => {
    const skus = this.allSkus();
    if (skus.length <= 1) return [];
    const titles = new Set<string>();
    skus.forEach(sku => sku?.skuSpecificComponents
      ?.filter((c: any) => !this.isColorTitle(c.title))
      .forEach((c: any) => titles.add(c.title)));
    return [...titles].filter(title => {
      const vals = new Set(skus.map(
        sku => sku?.skuSpecificComponents?.find((c: any) => c.title === title)?.value ?? null
      ));
      return vals.size > 1;
    });
  });

  // ── Config groups: one group = one unique combination of non-color chars ──
  configGroups = computed(() => {
    const names = this.varyingNonColorCharNames();
    if (names.length === 0) return [];
    const map = new Map<string, { key: string; label: string; skus: any[] }>();
    this.allSkus().forEach(sku => {
      const key = this.configKey(sku);
      if (!map.has(key)) {
        const label = names
          .map(t => sku?.skuSpecificComponents?.find((c: any) => c.title === t)?.value ?? '')
          .filter(Boolean)
          .join(' / ');
        map.set(key, { key, label, skus: [] });
      }
      map.get(key)!.skus.push(sku);
    });
    return [...map.values()];
  });

  // ── Currently selected config group (defaults to mainSku's group) ──
  currentConfigGroup = computed(() => {
    const groups = this.configGroups();
    if (groups.length === 0) return null;
    const key = this.selectedConfigKey() ?? this.configKey(this.product()?.mainSku);
    return groups.find(g => g.key === key) ?? groups[0];
  });

  // ── Colors available in the currently selected config group ──
  availableColors = computed(() => {
    const group = this.currentConfigGroup();
    const skus = group ? group.skus : this.allSkus();
    const seen = new Set<string>();
    const result: string[] = [];
    skus.forEach(sku => {
      const val = this.colorOf(sku);
      if (val && !seen.has(val)) { seen.add(val); result.push(val); }
    });
    return result;
  });

  // ── Active color (defaults to mainSku's color) ────────────────
  activeColor = computed(() =>
    this.selectedColor() ??
    this.colorOf(this.product()?.mainSku) ??
    null
  );

  // ── The SKU that is currently "selected" ──────────────────────
  currentSku = computed(() => {
    const p = this.product();
    if (!p) return null;
    const group = this.currentConfigGroup();
    const skus  = group ? group.skus : this.allSkus();
    const color = this.activeColor();
    if (color) {
      const match = skus.find((s: any) => this.colorOf(s) === color);
      if (match) return match;
    }
    return skus[0] ?? p.mainSku;
  });

  inWishlist = computed(() => {
    const sku = this.currentSku();
    return sku ? this.wishlistService.isInWishlist(sku.skuId) : false;
  });

  // ── Select config group ───────────────────────────────────────
  selectConfig(key: string): void {
    this.selectedConfigKey.set(key);
    // Keep color if it exists in the new group; otherwise pick first available
    const group = this.configGroups().find(g => g.key === key);
    if (!group) return;
    const colorsInGroup = group.skus.map((s: any) => this.colorOf(s)).filter(Boolean);
    const current = this.activeColor();
    if (current && !colorsInGroup.includes(current)) {
      this.selectedColor.set(colorsInGroup[0] ?? null);
    }
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  // ── Tooltip text for config chip ──────────────────────────────
  configChipTooltip(group: { skus: any[] }): string {
    const current = this.currentSku();
    if (!current) return '';
    // Prefer the SKU in this group that matches current color
    const color = this.colorOf(current);
    const sku = (color ? group.skus.find((s: any) => this.colorOf(s) === color) : null)
      ?? group.skus[0];
    return this.priceTooltip(sku, current);
  }

  // ── Tooltip text for color chip ───────────────────────────────
  colorChipTooltip(color: string): string {
    const current = this.currentSku();
    if (!current) return '';
    const group = this.currentConfigGroup();
    const skus = group ? group.skus : this.allSkus();
    const sku = skus.find((s: any) => this.colorOf(s) === color);
    if (!sku) return '';
    return this.priceTooltip(sku, current);
  }

  // ── Color dot lookup ──────────────────────────────────────────
  private readonly colorMap: Record<string, string> = {
    'черный': '#1a1a1a', 'чёрный': '#1a1a1a', 'black': '#1a1a1a',
    'белый': '#e0e0e0',  'white': '#e0e0e0',
    'серый': '#808080',  'gray': '#808080',  'grey': '#808080',
    'синий': '#1565c0',  'blue': '#1565c0',
    'красный': '#c62828','red': '#c62828',
    'зеленый': '#2e7d32','зелёный': '#2e7d32','green': '#2e7d32',
    'золотой': '#c9942a','золото': '#c9942a','gold': '#c9942a',
    'розовый': '#e91e63','pink': '#e91e63',
    'фиолетовый': '#7b1fa2','purple': '#7b1fa2',
    'титановый': '#8d9eab','titanium': '#8d9eab',
    'серебристый': '#bdbdbd','серебряный': '#bdbdbd','silver': '#bdbdbd',
    'желтый': '#f9a825', 'жёлтый': '#f9a825','yellow': '#f9a825',
    'оранжевый': '#e65100','orange': '#e65100',
  };

  getColorDot(value: string): string | null {
    const lower = value.toLowerCase();
    for (const [key, color] of Object.entries(this.colorMap)) {
      if (lower.includes(key)) return color;
    }
    return null;
  }

  // ── Helpers ───────────────────────────────────────────────────

  private isColorTitle(title: string): boolean {
    return /^цвет$/i.test((title ?? '').trim());
  }

  private colorOf(sku: any): string | null {
    return sku?.skuSpecificComponents?.find((c: any) => this.isColorTitle(c.title))?.value ?? null;
  }

  private configKey(sku: any): string {
    return this.varyingNonColorCharNames()
      .map(t => sku?.skuSpecificComponents?.find((c: any) => c.title === t)?.value ?? '')
      .join('|');
  }

  private effectivePrice(sku: any): number {
    const p = sku?.price ?? 0;
    const d = sku?.discount ?? 0;
    return Math.round(p * (1 - d / 100));
  }

  private priceTooltip(sku: any, current: any): string {
    const price   = this.effectivePrice(sku);
    const curPrice = this.effectivePrice(current);
    const diff = price - curPrice;
    const priceStr = price.toLocaleString('ru-RU') + ' ₽';
    if (diff === 0) return priceStr;
    const sign    = diff > 0 ? '+' : '−';
    const diffStr = Math.abs(diff).toLocaleString('ru-RU') + ' ₽';
    return `${priceStr} (${sign}${diffStr})`;
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  ngOnInit(): void {
    this.productDetailsService.product$.subscribe(p => {
      if (p?.mainSku?.skuId) {
        this.activeImageIndex.set(0);
        this.applyInitialSku();
        this.catalogHttp.getSimilar$(p.mainSku.skuId, 8).subscribe(res => {
          this.similar.set(res?.data ?? []);
        });
        this.trackRecentlyViewed(p.mainSku.skuId);
      }
    });
  }

  /** Подставляет конфигурацию/цвет SKU, на который кликнули в каталоге (?sku=...) */
  private applyInitialSku(): void {
    const targetSkuId = this.route.snapshot.queryParamMap.get('sku');
    if (!targetSkuId) return;
    const sku = this.allSkus().find((s: any) => s?.skuId === targetSkuId);
    if (!sku) return;
    this.selectedConfigKey.set(this.configKey(sku));
    this.selectedColor.set(this.colorOf(sku));
  }

  private trackRecentlyViewed(skuId: string): void {
    const KEY = 'recently_viewed';
    const MAX = 10;
    let ids: string[] = [];
    try { ids = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { ids = []; }
    ids = [skuId, ...ids.filter(id => id !== skuId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(url);
  }

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

  toggleWishlist(skuId: string): void {
    this.wishlistService.toggle(skuId);
  }
}
