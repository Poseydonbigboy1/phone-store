import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timeout } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { Brand } from '@models/data';
import { BrandFilter } from '@models/common';
import { BrandsHttpService } from '@backend';
import { PaginatorState } from 'primeng/paginator';

@Injectable({ providedIn: 'root' })
export class BrandService {
  readonly brands$ = new BehaviorSubject<Brand[]>([]);
  readonly total$ = new BehaviorSubject<number>(0);
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: BrandsHttpService) {}

  loadBrands(paginator: PaginatorState, filter: { title?: string }): void {
    this.loading$.next(true);
    this.http
      .getBrands$(this.toFilter(paginator, filter))
      .pipe(
        timeout(15000),
        catchError(err => {
          console.error('[BrandService] loadBrands error:', err);
          return of(null);
        }),
        finalize(() => this.loading$.next(false)),
      )
      .subscribe(res => {
        this.brands$.next(res?.data?.items ?? []);
        this.total$.next(res?.data?.total ?? 0);
      });
  }

  addBrand$(title: string): Observable<Brand> {
    return this.http.createBrand$(title).pipe(
      map(res => {
        if (!res.isSuccess || !res.data) throw new Error(res.message ?? 'Ошибка создания');
        return res.data;
      }),
    );
  }

  updateBrand$(id: string, title: string): Observable<Brand> {
    return this.http.updateBrand$(id, title).pipe(
      map(res => {
        if (!res.isSuccess || !res.data) throw new Error(res.message ?? 'Ошибка обновления');
        return res.data;
      }),
    );
  }

  deleteBrand$(id: string): Observable<boolean> {
    return this.http.deleteBrand$(id).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message ?? 'Ошибка удаления');
        return res.data ?? false;
      }),
    );
  }

  private toFilter(paginator: PaginatorState, filter: { title?: string }): BrandFilter {
    return {
      skip: paginator.first ?? 0,
      take: paginator.rows ?? 10,
      sortBy: null,
      sortDirection: 0,
      id: { matchMode: 'Equals', value: '' },
      title: { matchMode: 'contains', value: filter.title ?? '' },
    };
  }
}
