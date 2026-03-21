import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselProduct } from '@models/data';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { Observable } from 'rxjs';
import { HomePageService } from './home-page.service';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CarouselModule, TagModule, ButtonModule, PanelModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  providers: [HomePageService],
})
export class HomePage {
  responsiveOptions: any[] | undefined;
  productsPromo$: Observable<CarouselProduct[]>;
  productsLastSeen$: Observable<CarouselProduct[]>;
  productsNews$: Observable<CarouselProduct[]>;

  constructor(private homePageService: HomePageService) {
    this.productsPromo$ = this.homePageService.carouselProductsPromo$;
    this.productsLastSeen$ = this.homePageService.carouselProductsLastSeen$;
    this.productsNews$ = this.homePageService.carouselProductsNews$;
  }

  ngOnInit(): void {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];

    this.homePageService.loadCarouselProductsPromo();
    this.homePageService.loadCarouselProductsLastSeen();
    this.homePageService.loadCarouselProductsNews();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default: {
        return 'success';
      }
    }
  }
}
