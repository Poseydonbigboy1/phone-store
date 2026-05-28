import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { CatalogPageService } from 'src/app/views/site-layuot-page/catalog-page/catalog-page.service';

@Component({
  selector: 'app-catalog-filter-item-checkbox',
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './catalog-filter-item-checkbox.html',
  styleUrl: './catalog-filter-item-checkbox.scss',
})
export class CatalogFilterItemCheckbox {
  @Input() item: any;
  @Output() changed = new EventEmitter<void>();

  constructor(private catalogPageService: CatalogPageService) {}

  onModelChange() {
    this.catalogPageService.notifyFilterChanged();
    this.changed.emit()
  }
}
