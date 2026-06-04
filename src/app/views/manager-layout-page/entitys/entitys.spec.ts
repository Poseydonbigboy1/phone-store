import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entitys } from './entitys';

describe('Entitys', () => {
  let component: Entitys;
  let fixture: ComponentFixture<Entitys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entitys],
    }).compileComponents();

    fixture = TestBed.createComponent(Entitys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
