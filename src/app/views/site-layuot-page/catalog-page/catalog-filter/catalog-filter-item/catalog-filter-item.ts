import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CatalogFilterItemGroup } from './catalog-filter-item-group/catalog-filter-item-group';
import { CatalogFilterItemCheckbox } from './catalog-filter-item-checkbox/catalog-filter-item-checkbox';
import { CatalogFilterItemRangeNumber } from './catalog-filter-item-range-number/catalog-filter-item-range-number';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-catalog-filter-item',
  templateUrl: './catalog-filter-item.html',
  standalone: true,
  imports: [
    CommonModule,
    CatalogFilterItemGroup,
    CatalogFilterItemCheckbox,
    CatalogFilterItemRangeNumber,
  ],
})
export class CatalogFilterItem {
  @Input() item: any;
}
