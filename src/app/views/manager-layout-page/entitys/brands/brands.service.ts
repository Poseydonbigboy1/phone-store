import { Injectable } from '@angular/core';
import { Brand } from '@models/data';
import { PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface BrandsResponse {
  items: Brand[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private brands: Brand[] = [];
  private brands$ = new BehaviorSubject<Brand[]>([]);

  constructor() {
    // Generate mock data
    for (let i = 1; i <= 100; i++) {
      this.brands.push({ id: this.generateGuid(), title: `Brand ${i}` });
    }
    this.brands$.next(this.brands);
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getBrands(
    paginator: PaginatorState,
    filter: { title?: string },
  ): Observable<BrandsResponse> {
    let filteredBrands = [...this.brands];

    if (filter.title) {
      filteredBrands = filteredBrands.filter((b) =>
        b.title.toLowerCase().includes(filter.title!.toLowerCase()),
      );
    }

    const start = paginator.first || 0;
    const end = start + (paginator.rows || 10);
    const paginatedBrands = filteredBrands.slice(start, end);

    return of({
      items: paginatedBrands,
      total: filteredBrands.length,
    });
  }

  addBrand(title: string): Observable<Brand> {
    const newBrand: Brand = { id: this.generateGuid(), title };
    this.brands.unshift(newBrand);
    this.brands$.next(this.brands);
    return of(newBrand).pipe(delay(300));
  }

  updateBrand(id: string, title: string): Observable<Brand> {
    const brand = this.brands.find((b) => b.id === id);
    if (brand) {
      brand.title = title;
      this.brands$.next(this.brands);
      return of(brand).pipe(delay(300));
    }
    throw new Error('Brand not found');
  }

  deleteBrand(id: string): Observable<boolean> {
    const index = this.brands.findIndex((b) => b.id === id);
    if (index !== -1) {
      this.brands.splice(index, 1);
      this.brands$.next(this.brands);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }
}
