import { Component, inject } from '@angular/core';
import { ProductDetailsService } from './product-details-page.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [
    CommonModule,
    GalleriaModule,
    CardModule,
    ButtonModule,
    FieldsetModule,
    TabsModule,
    TableModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.scss',
  providers: [ProductDetailsService],
})
export class ProductDetailsPage {
  private productDetailsService = inject(ProductDetailsService);
  product = toSignal(this.productDetailsService.product$);

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
}
