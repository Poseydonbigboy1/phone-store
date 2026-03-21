import { Injectable } from '@angular/core';
import { CarouselProduct } from '@models/data';
import { BehaviorSubject } from 'rxjs';
import { CAROUSEL_PRODUCTS } from './carousel-products.const';

@Injectable()
export class HomePageService {
  carouselProducts$: BehaviorSubject<CarouselProduct[]> = new BehaviorSubject<CarouselProduct[]>([]);

  constructor() {}

  loadCarouselProducts(): void {
    this.carouselProducts$.next(CAROUSEL_PRODUCTS);
  }
}
