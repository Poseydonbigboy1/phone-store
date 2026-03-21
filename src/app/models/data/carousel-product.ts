import { Nullable } from '@models/common';

export class CarouselProduct {
  imgUrl: Nullable<string> = null;
  title: Nullable<string> = null;
  description: Nullable<string> = null;
  inventoryStatus: Nullable<string> = null;
  price: Nullable<Number> = null;
  rank?: Number = 0;
  tag?: Nullable<Number> = null;
}
