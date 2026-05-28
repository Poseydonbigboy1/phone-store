import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { CatalogPageService } from 'src/app/views/site-layuot-page/catalog-page/catalog-page.service';

@Component({
  selector: 'app-catalog-filter-item-range-number',
  imports: [CommonModule, SliderModule, FormsModule, InputNumberModule],
  templateUrl: './catalog-filter-item-range-number.html',
  styleUrl: './catalog-filter-item-range-number.scss',
})
export class CatalogFilterItemRangeNumber {
  @Input() item: any;
  @Input() type: 'int' | 'float' = 'int';
  @Output() changed = new EventEmitter<void>();

  min: number = 0;
  max: number = 0;

  constructor(private catalogPageService: CatalogPageService) {}

  ngOnInit() {
    this.min = this.item.value[0];
    this.max = this.item.value[1];
  }

  onModelChange(newValue: any, index: 0 | 1) {
    this.item.value[index] = newValue;
    this.catalogPageService.notifyFilterChanged();
    this.changed.emit();
  }

  onModelChangeSlider() {
    this.catalogPageService.notifyFilterChanged();
    this.changed.emit()
  }
}
