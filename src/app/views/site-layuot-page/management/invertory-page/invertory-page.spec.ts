import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvertoryPage } from './invertory-page';

describe('InvertoryPage', () => {
  let component: InvertoryPage;
  let fixture: ComponentFixture<InvertoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvertoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(InvertoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
