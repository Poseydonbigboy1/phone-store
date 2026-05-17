import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, Input, Type } from '@angular/core';
import { CatalogFilterItem } from '../../catalog-filter-item/catalog-filter-item';

@Component({
  selector: 'app-catalog-filter-item-group',
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './catalog-filter-item-group.html',
  styleUrl: './catalog-filter-item-group.scss',
})
export class CatalogFilterItemGroup {
  @Input() item: any;

  catalogFilterItem!: Type<any>;

  constructor() {
    this.catalogFilterItem = CatalogFilterItem;
  }
}
