import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-catalog-filter-item-range-number',
  imports: [CommonModule, SliderModule, FormsModule, InputNumberModule],
  templateUrl: './catalog-filter-item-range-number.html',
  styleUrl: './catalog-filter-item-range-number.scss',
})
export class CatalogFilterItemRangeNumber {
  @Input() item: any;
  @Input() type: 'int' | 'float' = 'int';

  min: number = 0;
  max: number = 0;

  ngOnInit() {
    this.min = this.item.value[0];
    this.max = this.item.value[1];
  }
}
