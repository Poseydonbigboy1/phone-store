import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteLayuotPage } from './site-layuot-page';

describe('SiteLayuotPage', () => {
  let component: SiteLayuotPage;
  let fixture: ComponentFixture<SiteLayuotPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteLayuotPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteLayuotPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
