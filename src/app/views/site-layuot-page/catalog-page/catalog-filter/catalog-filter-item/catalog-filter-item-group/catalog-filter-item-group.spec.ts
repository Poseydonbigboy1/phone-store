import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogFilterItemGroup } from './catalog-filter-item-group';

describe('CatalogFilterItemGroup', () => {
  let component: CatalogFilterItemGroup;
  let fixture: ComponentFixture<CatalogFilterItemGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogFilterItemGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogFilterItemGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
