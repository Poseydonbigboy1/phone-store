import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogHttpService } from '@backend';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '@services';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, RouterLink, NgTemplateOutlet,
    CarouselModule, TagModule, ButtonModule,
    ProgressSpinnerModule, ToastModule, TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private catalogHttp    = inject(CatalogHttpService);
  private cartService    = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService    = inject(AuthService);
  private messageService = inject(MessageService);

  isLoggedIn  = toSignal(this.authService.user$.pipe(map(u => !!u)));
  popular     = signal<any[]>([]);
  discounted  = signal<any[]>([]);
  recentlyViewed = signal<any[]>([]);
  addingSkuId = signal<string | null>(null);

  carouselOptions = [
    { breakpoint: '1200px', numVisible: 4, numScroll: 1 },
    { breakpoint: '992px',  numVisible: 3, numScroll: 1 },
    { breakpoint: '768px',  numVisible: 2, numScroll: 1 },
    { breakpoint: '480px',  numVisible: 1, numScroll: 1 },
  ];

  ngOnInit(): void {
    this.catalogHttp.getPopular$(10).subscribe(res => {
      if (res?.isSuccess) this.popular.set(res.data ?? []);
    });
    this.catalogHttp.getDiscounted$(10).subscribe(res => {
      if (res?.isSuccess) this.discounted.set(res.data ?? []);
    });
    this.loadRecentlyViewed();
  }

  private loadRecentlyViewed(): void {
    const raw = localStorage.getItem('recently_viewed');
    if (!raw) return;
    const ids: string[] = JSON.parse(raw);
    if (!ids.length) return;
    this.catalogHttp.getBatch$(ids).subscribe(res => {
      if (res?.isSuccess) {
        // Keep localStorage order
        const map = new Map((res.data ?? []).map((p: any) => [p.skuId, p]));
        const sorted = ids.map(id => map.get(id)).filter(Boolean);
        this.recentlyViewed.set(sorted);
      }
    });
  }

  effectivePrice(product: any): number {
    return product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;
  }

  isInWishlist(skuId: string): boolean { return this.wishlistService.isInWishlist(skuId); }
  toggleWishlist(skuId: string): void  { this.wishlistService.toggle(skuId); }

  addToCart(product: any): void {
    const skuId: string = product?.skuId;
    if (!skuId) return;

    if (!this.isLoggedIn()) {
      this.cartService.addLocal(skuId, 1);
      this.messageService.add({ severity: 'info', summary: 'Добавлено в корзину', detail: 'Войдите для оформления заказа', life: 3000 });
      return;
    }

    this.addingSkuId.set(skuId);
    this.cartService.add(skuId, 1).subscribe({
      next: () => {
        this.addingSkuId.set(null);
        this.messageService.add({ severity: 'success', summary: 'Добавлено в корзину', detail: product.title, life: 3000 });
      },
      error: (err) => {
        this.addingSkuId.set(null);
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err?.error?.message ?? 'Не удалось добавить', life: 4000 });
      },
    });
  }
}
