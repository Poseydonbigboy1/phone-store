import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { CatalogHttpService } from 'src/app/core/backend/catalog-http.service';
import { ResponseObject } from '@models/common';
import { FilterConverter } from 'src/app/views/site-layuot-page/catalog-page/filter-converter';
import { FilterRequestConverter } from './filter-request-converter';
import { CatalogFilter } from 'src/app/models/common/catalog-filter';

@Injectable()
export class CatalogPageService {
  products$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  skip$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  take$: BehaviorSubject<number> = new BehaviorSubject<number>(12);
  total$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  sortBy$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  sortDirection$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  catalogFilters$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  filterChanged$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);

  constructor(private catalogHttpService: CatalogHttpService) {
    this.filterChanged$
      .pipe(
        // skip(1),
        debounceTime(300),
        // distinctUntilChanged((prev, curr) => {
        //   return JSON.stringify(prev) === JSON.stringify(curr);
        // }),
      )
      .subscribe(() => {
        this.refreshProducts();
      });
  }

  notifyFilterChanged(): void {
    // const currentFilters = this.catalogFilters$.getValue();
    // const newFilters = JSON.parse(JSON.stringify(currentFilters));
    // this.catalogFilters$.next(newFilters);
    this.filterChanged$.next();
  }

  refreshProducts(): void {
    const skip = this.skip$.getValue();
    const take = this.take$.getValue();
    const filter = this.catalogFilters$.getValue();
    // const filterValues = FilterRequestConverter.transform(filter);

    const search = this.search$.getValue();
    const body: CatalogFilter = {
      skip,
      take,
      sortBy: this.sortBy$.getValue(),
      sortDirection: this.sortDirection$.getValue(),
      search: search || undefined,
      filterValues: FilterRequestConverter.transform(filter),
    };

    this.isLoading$.next(true);

    this.catalogHttpService.getProducts$(body).subscribe({
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
    this.catalogHttpService.getFilters$().subscribe({
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
