import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DecimalPipe, FormsModule,
    DataViewModule, ButtonModule, CardModule, InputNumberModule, ToastModule, TooltipModule, DividerModule],
  providers: [MessageService],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage implements OnInit {
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly originalTotal$ = this.cart.items$.pipe(
    map(items => items.reduce((s, i) => s + i.price * i.quantity, 0))
  );
  readonly discount$ = this.cart.items$.pipe(
    map(items => items.reduce((s, i) => s + (i.price - i.finalPrice) * i.quantity, 0))
  );

  private qtyChange$ = new Subject<{ skuId: string; qty: number }>();

  ngOnInit(): void {
    this.cart.load();
    // debounce — обновляем quantity на сервере с задержкой
    this.qtyChange$.pipe(debounceTime(500), distinctUntilChanged((a, b) => a.skuId === b.skuId && a.qty === b.qty))
      .subscribe(({ skuId, qty }) => {
        this.cart.update(skuId, qty).subscribe();
      });
  }

  onQtyChange(skuId: string, qty: number): void {
    this.qtyChange$.next({ skuId, qty });
  }

  remove(skuId: string): void {
    this.cart.remove(skuId).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: '', detail: 'Товар удалён из корзины', life: 2000 }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить товар' }),
    });
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  goToCatalog(): void {
    this.router.navigate(['/main/products']);
  }
}
