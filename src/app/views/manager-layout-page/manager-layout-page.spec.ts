import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerLayoutPage } from './manager-layout-page';

describe('ManagerLayoutPage', () => {
  let component: ManagerLayoutPage;
  let fixture: ComponentFixture<ManagerLayoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerLayoutPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerLayoutPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
