import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, of, skip } from 'rxjs';
import { CATALOG_FILTER } from './CATAOLOG_FILTER';
import { CATALOG_PRODUCTS } from 'src/app/views/site-layuot-page/catalog-page/CATALOG_PRODUCTS';
import { ProductsHttpService } from 'src/app/core/backend/products-http.service';
import { ResponseObject } from '@models/common';
import { FilterConverter } from 'src/app/views/site-layuot-page/catalog-page/filter-converter';
import { FilterRequestConverter } from './filter-request-converter';
import { ProductFilter } from 'src/app/models/common/product-filter';

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
    // const filterValues = FilterRequestConverter.transform(filter);

    const body: ProductFilter = {
      skip,
      take,
      sortBy: 0,
      sortDirection: 0,
      filterValues: FilterRequestConverter.transform(filter),
    };

    this.isLoading$.next(true);

    this.productsHttpService.getProducts$(body).subscribe({
      next: (response) => {
        console.log('[debug] [getProducts]', response);
        this.products$.next(response?.data?.products ?? []);
        this.total$.next(response?.data?.count ?? 0);
        this.isLoading$.next(false);
      },
      error: (err0r) => {
        this.isLoading$.next(false);
        alert('Ошибка получения продуктов для каталога');
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
