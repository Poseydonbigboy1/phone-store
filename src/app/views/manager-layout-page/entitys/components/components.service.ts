import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, timeout } from 'rxjs/operators';
import { Component } from '@models/data';
import { ComponentsHttpService } from '@backend';
import { PaginatorState } from 'primeng/paginator';

@Injectable({ providedIn: 'root' })
export class ComponentsService {
  readonly items$ = new BehaviorSubject<Component[]>([]);
  readonly total$ = new BehaviorSubject<number>(0);
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: ComponentsHttpService) {}

  load(paginator: PaginatorState, titleFilter = ''): void {
    this.loading$.next(true);
    this.http.getAll$({
      skip: paginator.first ?? 0, take: paginator.rows ?? 10,
      sortBy: null, sortDirection: 0,
      id: { matchMode: 'Equals', value: '' },
      title: { matchMode: 'contains', value: titleFilter },
      componentCategoryId: { matchMode: 'Equals', value: '' },
      dataType: { matchMode: 'Equals', value: '' },
      categoryType: { matchMode: 'Equals', value: '' },
    }).pipe(
      timeout(15000),
      catchError(() => of(null)),
      finalize(() => this.loading$.next(false)),
    ).subscribe(res => {
      this.items$.next(res?.data?.items ?? []);
      this.total$.next(res?.data?.total ?? 0);
    });
  }

  create$(item: Partial<Component>): Observable<Component> {
    return this.http.create$(item).pipe(map(res => {
      if (!res.isSuccess || !res.data) throw new Error(res.message ?? 'Ошибка создания');
      return res.data;
    }));
  }

  update$(item: Component): Observable<Component> {
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
