import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { Observable } from 'rxjs';
import { CatalogPageService } from './catalog-page.service';
import { CatalogFilter } from './catalog-filter/catalog-filter';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '@services';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SortBy, SortDirection } from '@models/common';

@Component({
  selector: 'app-catalog-page',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    DataViewModule, PaginatorModule, CommonModule, DecimalPipe, RouterLink,
    CatalogFilter, CardModule, ButtonModule, FormsModule, ScrollPanelModule,
    ToastModule, TagModule, SelectModule, TooltipModule,
  ],
  providers: [CatalogPageService, MessageService],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage implements OnInit {
  products$: Observable<any[]>;
  skip$: Observable<number>;
  take$: Observable<number>;
  total$: Observable<number>;
  isLoading$: Observable<boolean>;
  catalogFilters$: Observable<any>;

  private cartService     = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService     = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoggedIn = toSignal(this.authService.user$.pipe(map(u => !!u)));
  addingSkuId: string | null = null;

  isInWishlist(skuId: string): boolean { return this.wishlistService.isInWishlist(skuId); }
  toggleWishlist(skuId: string): void  { this.wishlistService.toggle(skuId); }

  sortOptions = [
    { label: 'По умолчанию', value: { sortBy: SortBy.None, sortDirection: SortDirection.Ascending } },
    { label: 'Цена: по возрастанию', value: { sortBy: SortBy.Price, sortDirection: SortDirection.Ascending } },
    { label: 'Цена: по убыванию', value: { sortBy: SortBy.Price, sortDirection: SortDirection.Descending } },
    { label: 'Популярные', value: { sortBy: SortBy.Popularity, sortDirection: SortDirection.Descending } },
  ];
  selectedSort = this.sortOptions[0];

  constructor(private catalogPageService: CatalogPageService) {
    this.products$ = this.catalogPageService.products$;
    this.skip$ = this.catalogPageService.skip$;
    this.take$ = this.catalogPageService.take$;
    this.total$ = this.catalogPageService.total$;
    this.isLoading$ = this.catalogPageService.isLoading$;
    this.catalogFilters$ = this.catalogPageService.catalogFilters$;
  }

  ngOnInit(): void {
    // Читаем поисковый запрос из URL (если пришли из шапки)
    this.route.queryParams.subscribe(params => {
      const q = params['q'] ?? '';
      this.catalogPageService.search$.next(q);
      this.catalogPageService.skip$.next(0);
      this.catalogPageService.refreshProducts();
    });
  }

  onSortChange(): void {
    this.catalogPageService.sortBy$.next(this.selectedSort.value.sortBy);
    this.catalogPageService.sortDirection$.next(this.selectedSort.value.sortDirection);
    this.catalogPageService.skip$.next(0);
    this.catalogPageService.refreshProducts();
  }

  addToCart(product: any): void {
    const skuId: string = product?.skuId;
    if (!skuId) return;

    if (!this.isLoggedIn()) {
      this.cartService.addLocal(skuId, 1);
      this.messageService.add({
        severity: 'info',
        summary: 'Добавлено в корзину',
        detail: 'Войдите, чтобы оформить заказ',
        life: 3000,
      });
      return;
    }

    this.addingSkuId = skuId;
    this.cartService.add(skuId, 1).subscribe({
      next: () => {
        this.addingSkuId = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Добавлено в корзину',
          detail: product.title,
          life: 3000,
        });
      },
      error: (err) => {
        this.addingSkuId = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err?.error?.message ?? 'Не удалось добавить товар',
          life: 4000,
        });
      },
    });
  }

  onPageChange(event: any) {
    this.catalogPageService.skip$.next(event.first ?? 0);
    this.catalogPageService.take$.next(event.rows ?? 12);
    this.catalogPageService.refreshProducts();
  }
}
