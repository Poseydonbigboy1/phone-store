import { Component, inject } from '@angular/core';
import { ProductDetailsService } from './product-details-page.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '@services';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [
    CommonModule,
    GalleriaModule,
    CardModule,
    ButtonModule,
    FieldsetModule,
    TabsModule,
    TableModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.scss',
  providers: [ProductDetailsService, MessageService],
})
export class ProductDetailsPage {
  private productDetailsService = inject(ProductDetailsService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  product = toSignal(this.productDetailsService.product$);
  isLoggedIn = toSignal(this.authService.user$.pipe(map(u => !!u)));
  addingToCart = false;

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px',  numVisible: 3 },
    { breakpoint: '560px',  numVisible: 1 },
  ];

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    // Гость — сохраняем в localStorage
    if (!this.isLoggedIn()) {
      this.cartService.addLocal(p.mainSku.skuId, 1);
      this.messageService.add({
        severity: 'info',
        summary: 'Добавлено в корзину',
        detail: 'Войдите, чтобы оформить заказ',
        life: 3000,
      });
      return;
    }

    this.addingToCart = true;
    this.cartService.add(p.mainSku.skuId, 1).subscribe({
      next: () => {
        this.addingToCart = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Добавлено в корзину',
          detail: p.title,
          life: 3000,
        });
      },
      error: (err) => {
        this.addingToCart = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err?.error?.message ?? 'Не удалось добавить товар',
          life: 4000,
        });
      },
    });
  }
}
