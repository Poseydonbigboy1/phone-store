import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, timeout } from 'rxjs/operators';
import { Order } from '@models/data';
import { OrdersHttpService } from '@backend';
import { PaginatorState } from 'primeng/paginator';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  readonly items$ = new BehaviorSubject<Order[]>([]);
  readonly total$ = new BehaviorSubject<number>(0);
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: OrdersHttpService) {}

  load(paginator: PaginatorState, userIdFilter = ''): void {
    this.loading$.next(true);
    this.http.getAll$({
      skip: paginator.first ?? 0, take: paginator.rows ?? 10,
      sortBy: null, sortDirection: 0,
      id: { matchMode: 'Equals', value: '' },
      userId: { matchMode: 'Equals', value: userIdFilter },
      status: { matchMode: 'Equals', value: '' },
      shippingAddress: { matchMode: 'contains', value: '' },
      totalAmount: { matchMode: 'Equals', value: '' },
    }).pipe(
      timeout(15000),
      catchError(() => of(null)),
      finalize(() => this.loading$.next(false)),
    ).subscribe(res => {
      this.items$.next(res?.data?.items ?? []);
      this.total$.next(res?.data?.total ?? 0);
    });
  }

  create$(item: Partial<Order>): Observable<Order> {
    return this.http.create$(item).pipe(map(res => {
      if (!res.isSuccess || !res.data) throw new Error(res.message ?? 'Ошибка создания');
      return res.data;
    }));
  }

  update$(item: Order): Observable<Order> {
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
