import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, timeout } from 'rxjs/operators';
import { ProductComponent } from '@models/data';
import { ProductComponentsHttpService } from '@backend';
import { PaginatorState } from 'primeng/paginator';

@Injectable({ providedIn: 'root' })
export class ProductComponentsService {
  readonly items$ = new BehaviorSubject<ProductComponent[]>([]);
  readonly total$ = new BehaviorSubject<number>(0);
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: ProductComponentsHttpService) {}

  load(paginator: PaginatorState, skuIdFilter = ''): void {
    this.loading$.next(true);
    this.http.getAll$({
      skip: paginator.first ?? 0, take: paginator.rows ?? 10,
      sortBy: null, sortDirection: 0,
      id: { matchMode: 'Equals', value: '' },
      skuId: { matchMode: 'Equals', value: skuIdFilter },
      componentId: { matchMode: 'Equals', value: '' },
      valueJson: { matchMode: 'contains', value: '' },
      filtering: { matchMode: 'Equals', value: '' },
    }).pipe(
      timeout(15000),
      catchError(() => of(null)),
      finalize(() => this.loading$.next(false)),
    ).subscribe(res => {
      this.items$.next(res?.data?.items ?? []);
      this.total$.next(res?.data?.total ?? 0);
    });
  }

  create$(item: Partial<ProductComponent>): Observable<ProductComponent> {
    return this.http.create$(item).pipe(map(res => {
      if (!res.isSuccess || !res.data) throw new Error(res.message ?? 'Ошибка создания');
      return res.data;
    }));
  }

  update$(item: ProductComponent): Observable<ProductComponent> {
    return this.http.update$(item).pipe(map(res => {
      if (!res.isSuccess || !res.data) throw new Error(res.message ?? 'Ошибка обновления');
      return res.data;
    }));
  }

  delete$(id: string): Observable<boolean> {
    return this.http.delete$(id).pipe(map(res => {
      if (!res.isSuccess) throw new Error(res.message ?? 'Ошибка удаления');
      return res.data ?? false;
    }));
  }
}
