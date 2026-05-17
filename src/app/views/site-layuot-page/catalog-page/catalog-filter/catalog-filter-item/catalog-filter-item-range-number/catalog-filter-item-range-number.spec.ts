import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogFilterItemRangeNumber } from './catalog-filter-item-range-number';

describe('CatalogFilterItemRangeNumber', () => {
  let component: CatalogFilterItemRangeNumber;
  let fixture: ComponentFixture<CatalogFilterItemRangeNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogFilterItemRangeNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogFilterItemRangeNumber);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
