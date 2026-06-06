import { Nullable } from '@models/common';

export enum DataType {
  STRING,
  BOOLEAN,
  NUMBER,
  DATE,
}

export interface ProductComponentView {
  title: string;
  description: string;
  dataType: DataType;
  value: string;
}

export interface SkuView {
  skuId: string;
  price: number;
  discount: number;
  amount: number;
  priceWithDiscount: number;
  skuSpecificComponents: ProductComponentView[];
}

export interface ProductDetails {
  productId: string;
  title: string;
  description: string;
  brandTitle: string;
  images: Nullable<string[]>;
  mainSku: SkuView;
  additionalSkus: SkuView[];
  commonComponents: ProductComponentView[];
}
