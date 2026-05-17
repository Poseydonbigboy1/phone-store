import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { Observable } from 'rxjs';
import { CatalogPageService } from './catalog-page.service';
import { CatalogFilter } from './catalog-filter/catalog-filter';

@Component({
  selector: 'app-catalog-page',
  imports: [DataViewModule, CommonModule, CatalogFilter],
  providers: [CatalogPageService],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  products$: Observable<any[]>;

  constructor(private catalogPageService: CatalogPageService) {
    this.products$ = this.catalogPageService.products$;
  }

  ngOnInit() {}
}
