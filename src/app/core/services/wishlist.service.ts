import { Injectable, inject, signal, computed } from '@angular/core';
import { WishlistHttpService } from '@backend';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(WishlistHttpService);

  private _ids = signal<string[]>([]);

  readonly count = computed(() => this._ids().length);

  isInWishlist(skuId: string): boolean {
    return this._ids().includes(skuId);
  }

  load(): void {
    this.http.getIds$().subscribe(res => {
      if (res?.isSuccess) this._ids.set(res.data ?? []);
    });
  }

  clear(): void {
    this._ids.set([]);
  }

  toggle(skuId: string): void {
    if (this.isInWishlist(skuId)) {
      this.http.remove$(skuId).subscribe(res => {
        if (res?.isSuccess) this._ids.update(ids => ids.filter(id => id !== skuId));
      });
    } else {
      this.http.add$(skuId).subscribe(res => {
        if (res?.isSuccess) this._ids.update(ids => [...ids, skuId]);
      });
    }
  }
}
