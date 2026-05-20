import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { Observable, skip } from 'rxjs';
import { CatalogPageService } from './catalog-page.service';
import { CatalogFilter } from './catalog-filter/catalog-filter';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-catalog-page',
  imports: [
    DataViewModule,
    PaginatorModule,
    CommonModule,
    CatalogFilter,
    CardModule,
    ButtonModule,
    RatingModule,
    FormsModule,
    ScrollPanelModule,
  ],
  providers: [CatalogPageService],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  products$: Observable<any[]>;
  skip$: Observable<number>;
  take$: Observable<number>;
  total$: Observable<number>;
  isLoading$: Observable<boolean>;

  constructor(private catalogPageService: CatalogPageService) {
    this.products$ = this.catalogPageService.products$;
    this.skip$ = this.catalogPageService.skip$;
    this.take$ = this.catalogPageService.take$;
    this.total$ = this.catalogPageService.total$;
    this.isLoading$ = this.catalogPageService.isLoading$;
  }

  ngOnInit() {
    this.catalogPageService.refreshProducts();
  }

  addToCart(product: any) {
    console.log('[debug] [CatalogPage] [addToCart] [product]', product);
  }

  onPageChange(event: any) {
    this.catalogPageService.skip$.next(event.first ?? 0);
    this.catalogPageService.take$.next(event.rows ?? 12);
    this.catalogPageService.refreshProducts();
  }
}
