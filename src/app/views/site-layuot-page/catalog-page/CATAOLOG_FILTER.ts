export const CATALOG_FILTER = [
  {
    type: 'group',
    title: 'Брэнд',
    property: 'brand',
    value: [
      {
        type: 'checkbox',
        title: 'Xiaomi',
        value: false,
      },
      {
        type: 'checkbox',
        title: 'Samsung',
        value: false,
      },
      {
        type: 'checkbox',
        title: 'IPhone',
        value: false,
      },
    ],
  },
  {
    type: 'group',
    title: 'Цена',
    property: 'price',
    value: [
      {
        type: 'rangeInt',
        title: null,
        value: [500, 100000],
      },
    ],
  },
];
