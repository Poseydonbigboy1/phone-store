import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { CartItem } from '@models/data';
import { CartHttpService } from '@backend';

const LOCAL_KEY = 'cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items$ = new BehaviorSubject<CartItem[]>([]);

  readonly items$ = this._items$.asObservable();
  readonly count$ = this._items$.pipe(map(items => items.reduce((s, i) => s + i.quantity, 0)));
  readonly total$ = this._items$.pipe(map(items => items.reduce((s, i) => s + i.finalPrice * i.quantity, 0)));

  constructor(private http: CartHttpService) {}

  /** Загрузить корзину с сервера (вызывать при init для авторизованного) */
  load(): void {
    this.http.getCart$().subscribe(res => {
      if (res?.isSuccess) this._items$.next(res.data ?? []);
    });
  }

  /** Добавить товар */
  add(skuId: string, quantity = 1) {
    return this.http.addItem$(skuId, quantity).pipe(tap(res => { if (res?.isSuccess) this.load(); }));
  }

  /** Обновить количество */
  update(skuId: string, quantity: number) {
    return this.http.updateItem$(skuId, quantity).pipe(tap(res => { if (res?.isSuccess) this.load(); }));
  }

  /** Удалить позицию */
  remove(skuId: string) {
    return this.http.removeItem$(skuId).pipe(tap(res => { if (res?.isSuccess) this.load(); }));
  }

  /** Мёрж localStorage → сервер (при логине) */
  mergeOnLogin(): void {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    try {
      const items: { skuId: string; quantity: number }[] = JSON.parse(raw);
      if (items.length) {
        this.http.mergeCart$(items).subscribe(res => {
          if (res?.isSuccess) {
            localStorage.removeItem(LOCAL_KEY);
            this.load();
          }
        });
      } else {
        localStorage.removeItem(LOCAL_KEY);
        this.load();
      }
    } catch {
      localStorage.removeItem(LOCAL_KEY);
      this.load();
    }
  }

  /** Добавить в localStorage (для гостя) */
  addLocal(skuId: string, quantity = 1): void {
    const items = this.getLocal();
    const existing = items.find(i => i.skuId === skuId);
    if (existing) existing.quantity += quantity;
    else items.push({ skuId, quantity });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }

  /** Очистить состояние (после checkout) */
  clear(): void {
    this._items$.next([]);
    localStorage.removeItem(LOCAL_KEY);
  }

  private getLocal(): { skuId: string; quantity: number }[] {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'); }
    catch { return []; }
  }
}
