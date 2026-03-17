import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributesPage } from './attributes-page';

describe('AttributesPage', () => {
  let component: AttributesPage;
  let fixture: ComponentFixture<AttributesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AttributesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
