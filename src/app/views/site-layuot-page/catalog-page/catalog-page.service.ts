import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, of, skip } from 'rxjs';
import { CATALOG_FILTER } from './CATAOLOG_FILTER';
import { CATALOG_PRODUCTS } from 'src/app/views/site-layuot-page/catalog-page/CATALOG_PRODUCTS';
import { ProductsHttpService } from 'src/app/core/backend/products-http.service';
import { ResponseObject } from '@models/common';
import { FilterConverter } from 'src/app/views/site-layuot-page/catalog-page/filter-converter';

@Injectable()
export class CatalogPageService {
  products$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  skip$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  take$: BehaviorSubject<number> = new BehaviorSubject<number>(12);
  total$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  catalogFilters$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private productsHttpService: ProductsHttpService) {}

  changeFilter(filter: any) {
    this.catalogFilters$.next([...this.catalogFilters$.getValue(), filter]);
  }

  refreshProducts(): void {
    const skip = this.skip$.getValue();
    const take = this.take$.getValue();
    const filter = this.catalogFilters$.getValue();

    this.isLoading$.next(true);

    of(CATALOG_PRODUCTS)
      .pipe(
        delay(2000),
        map((products: any[]) => {
          return {
            data: {
              items: products.slice(skip, skip + take),
              count: products.length,
            },
          };
        }),
      )
      .subscribe({
        next: (data) => {
          console.log('[debug] [getProducts]', data);
          this.products$.next(data.data.items);
          this.total$.next(data.data.count);
          this.isLoading$.next(false);
        },
        error: (err0r) => {
          this.isLoading$.next(false);
        },
      });
  }

  getCatalogFilters() {
    this.productsHttpService.getFitlers$().subscribe({
      next: (response: ResponseObject<any>) => {
        const filter = FilterConverter.transform(response.data);
        console.log(`[debug] [getCatalogFilters] [success] [converetedFilter]`, filter);
        this.catalogFilters$.next(filter);
      },
      error: (err0r) => {
        alert('Ошибка получения фильтров дял каталога');
      },
    });
    // of(CATALOG_FILTER).subscribe((filters) => {
    //   this.catalogFilters$.next(filters);
    // });
  }
}
