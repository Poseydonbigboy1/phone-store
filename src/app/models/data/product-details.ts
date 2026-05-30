import { Nullable } from '@models/common';

export enum DataType {
  STRING,
  BOOLEAN,
  NUMBER,
  DATE,
}

export interface ProductComponent {
  title: string;
  description: string;
  dataType: DataType;
  value: string;
}

export interface Sku {
  skuId: string;
  price: number;
  discount: number;
  amount: number;
  priceWithDiscount: number;
  skuSpecificComponents: ProductComponent[];
}

export interface ProductDetails {
  productId: string;
  title: string;
  description: string;
  brandTitle: string;
  images: Nullable<string[]>;
  mainSku: Sku;
  additionalSkus: Sku[];
  commonComponents: ProductComponent[];
}
