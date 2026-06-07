import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WishlistHttpService } from '@backend';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, RouterModule,
    CardModule, ButtonModule, TagModule, ProgressSpinnerModule, ToastModule, OverlayBadgeModule,
  ],
  providers: [MessageService],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
})
export class WishlistPage implements OnInit {
  private readonly http           = inject(WishlistHttpService);
  private readonly cartService    = inject(CartService);
  private readonly wishlist       = inject(WishlistService);
  private readonly msg            = inject(MessageService);
  private readonly router         = inject(Router);

  loading = signal(true);
  items   = signal<any[]>([]);

  ngOnInit(): void {
    this.http.getWishlist$().subscribe({
      next: res => {
        this.items.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  remove(skuId: string): void {
    this.wishlist.toggle(skuId);
    this.items.update(list => list.filter(i => i.skuId !== skuId));
  }

  addToCart(item: any): void {
    this.cartService.addLocal(item.skuId, 1);
    this.msg.add({ severity: 'success', summary: 'Добавлено в корзину', detail: item.title, life: 2500 });
  }

  imageUrl(item: any): string {
    return item.imageUrl || item.images?.[0] || '';
  }

  finalPrice(item: any): number {
    return item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
  }
}
