import { Injectable } from '@angular/core';
import { CarouselProduct } from '@models/data';
import { BehaviorSubject } from 'rxjs';
import {
  CAROUSEL_PRODUCTS_LAST_SEEN,
  CAROUSEL_PRODUCTS_NEWS,
  CAROUSEL_PRODUCTS_PROMO,
} from './carousel-products.const';

@Injectable()
export class HomePageService {
  carouselProductsPromo$: BehaviorSubject<CarouselProduct[]> = new BehaviorSubject<
    CarouselProduct[]
  >([]);
  carouselProductsLastSeen$: BehaviorSubject<CarouselProduct[]> = new BehaviorSubject<
    CarouselProduct[]
  >([]);
  carouselProductsNews$: BehaviorSubject<CarouselProduct[]> = new BehaviorSubject<
    CarouselProduct[]
  >([]);

  constructor() {}

  loadCarouselProductsPromo(): void {
    this.carouselProductsPromo$.next(CAROUSEL_PRODUCTS_PROMO);
  }

  loadCarouselProductsLastSeen(): void {
    this.carouselProductsLastSeen$.next(CAROUSEL_PRODUCTS_LAST_SEEN);
  }

  loadCarouselProductsNews(): void {
    this.carouselProductsNews$.next([
      ...CAROUSEL_PRODUCTS_NEWS,
      ...CAROUSEL_PRODUCTS_NEWS,
      ...CAROUSEL_PRODUCTS_NEWS,
    ]);
  }
}
