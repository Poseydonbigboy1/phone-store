import { CarouselProduct } from '@models/data';

export const CAROUSEL_PRODUCTS: CarouselProduct[] = [
  {
    imgUrl: 'https://i.can.ua/big_promo/0/71.jpg',
    title: 'Новый iPhone 15 Pro',
    description: 'Титановый корпус, чип A17 Pro и невероятные возможности камеры.',
    inventoryStatus: 'INSTOCK',
    price: 999,
  },
  {
    imgUrl: 'https://i.can.ua/big_promo/0/71.jpg',
    title: 'Инновации складываются',
    description: 'Раскладные смартфоны нового поколения уже в наличии.',
    inventoryStatus: 'LOWSTOCK',
    price: 799,

  },
  {
    imgUrl: 'https://i.can.ua/big_promo/0/71.jpg',
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Встречайте новую эру мобильного ИИ с Galaxy AI.',
    inventoryStatus: 'OUTOFSTOCK',
    price: 1199,
  }
];
