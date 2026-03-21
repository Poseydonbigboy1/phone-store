import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { HomePageService } from './home-page.service';
import { Observable } from 'rxjs';
import { CarouselProduct } from '@models/data';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CarouselModule, TagModule, ButtonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  providers: [HomePageService],
})
export class HomePage {
  responsiveOptions: any[] | undefined;
  products$: Observable<CarouselProduct[]>;

  constructor(private homePageService: HomePageService) {
    this.products$ = this.homePageService.carouselProducts$;
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

    this.homePageService.loadCarouselProducts();
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
