import { Component } from '@angular/core';
import { CatalogPageService } from '../catalog-page.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CatalogFilterItem } from './catalog-filter-item/catalog-filter-item';

@Component({
  selector: 'app-catalog-filter',
  templateUrl: './catalog-filter.html',
  standalone: true,
  imports: [CommonModule, CatalogFilterItem],
})
export class CatalogFilter {
  catalogFilters$: Observable<any[]>;

  constructor(private catalogPageService: CatalogPageService) {
    this.catalogFilters$ = this.catalogPageService.catalogFilters$;
  }
  ngOnInit() {
    this.catalogPageService.getCatalogFilters();
  }
}
