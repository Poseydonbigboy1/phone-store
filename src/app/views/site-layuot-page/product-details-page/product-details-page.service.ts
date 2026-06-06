import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetails } from '@models/data';
import { ResponseObject } from '@models/common';
import { BehaviorSubject, Observable, filter, switchMap, tap } from 'rxjs';
import { CatalogHttpService } from 'src/app/core/backend/products-http.service';

@Injectable()
export class ProductDetailsService {
  private catalogHttpService = inject(CatalogHttpService);
  private route = inject(ActivatedRoute);

  private product$$ = new BehaviorSubject<ProductDetails | null>(null);
  public product$ = this.product$$.asObservable();

  constructor() {
    this.route.params
      .pipe(
        filter((params) => !!params['id']),
        switchMap((params) => this.getProduct(params['id'])),
      )
      .subscribe();
  }

  private getProduct(id: string): Observable<ResponseObject<ProductDetails>> {
    return this.catalogHttpService.getProduct(id).pipe(
      tap((response) => {
        if (response.isSuccess) {
          this.product$$.next(response.data);
        }
      }),
    );
  }
}
