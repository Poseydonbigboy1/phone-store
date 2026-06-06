import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { Observable } from 'rxjs';
import { CatalogPageService } from './catalog-page.service';
import { CatalogFilter } from './catalog-filter/catalog-filter';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '@services';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-catalog-page',
  imports: [
    DataViewModule,
    PaginatorModule,
    CommonModule,
    CatalogFilter,
    CardModule,
    ButtonModule,
    RatingModule,
    FormsModule,
    ScrollPanelModule,
    ToastModule,
  ],
  providers: [CatalogPageService, MessageService],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  products$: Observable<any[]>;
  skip$: Observable<number>;
  take$: Observable<number>;
  total$: Observable<number>;
  isLoading$: Observable<boolean>;
  catalogFilters$: Observable<any>;

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  isLoggedIn = toSignal(this.authService.user$.pipe(map(u => !!u)));
  addingSkuId: string | null = null;

  constructor(private catalogPageService: CatalogPageService) {
    this.products$ = this.catalogPageService.products$;
    this.skip$ = this.catalogPageService.skip$;
    this.take$ = this.catalogPageService.take$;
    this.total$ = this.catalogPageService.total$;
    this.isLoading$ = this.catalogPageService.isLoading$;
    this.catalogFilters$ = this.catalogPageService.catalogFilters$;
  }

  ngOnInit() {
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
