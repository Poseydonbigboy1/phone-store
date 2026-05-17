import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogFilterItemCheckbox } from './catalog-filter-item-checkbox';

describe('CatalogFilterItemCheckbox', () => {
  let component: CatalogFilterItemCheckbox;
  let fixture: ComponentFixture<CatalogFilterItemCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogFilterItemCheckbox],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogFilterItemCheckbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
