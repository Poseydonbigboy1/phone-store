import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCategories } from './component-categories';

describe('ComponentCategories', () => {
  let component: ComponentCategories;
  let fixture: ComponentFixture<ComponentCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
