import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-catalog-filter-item-checkbox',
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './catalog-filter-item-checkbox.html',
  styleUrl: './catalog-filter-item-checkbox.scss',
})
export class CatalogFilterItemCheckbox {
  @Input() item: any;

  value: boolean = false;
}
