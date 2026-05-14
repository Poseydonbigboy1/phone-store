export class ProductAttributeType {
  id?: string;
  title?: string;
}


export class Product {
    id?: string;
    title?: string;
    description?: string
    attributes: any[] = [];
}

export class ProductAttribute {
    id?: string;
}