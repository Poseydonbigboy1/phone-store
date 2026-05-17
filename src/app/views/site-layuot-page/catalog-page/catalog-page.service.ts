import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { CATALOG_FILTER } from './CATAOLOG_FILTER';

@Injectable()
export class CatalogPageService {
  products$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  catalogFilters$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor() {}

  getProducts(filter: any): void {}

  getCatalogFilters() {
    of(CATALOG_FILTER).subscribe((filters) => {
      this.catalogFilters$.next(filters);
    });
  }
}
