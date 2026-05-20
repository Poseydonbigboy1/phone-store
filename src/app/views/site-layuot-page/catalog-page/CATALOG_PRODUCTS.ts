const getRandomInt = (min: number, max: number) => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
};

export const CATALOG_PRODUCTS = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;

  const isIdEven = id % 2 === 0;
  const isIdOdd = id % 2 !== 0;
  const isIdMultipleOf3 = id % 3 === 0;
  const isIdMultipleOf5 = id % 5 === 0;

  const colorsSwitcher = [
    ...(isIdEven ? [{ color: '#000', name: 'Серебристый' }] : []),
    ...(isIdOdd ? [{ color: '#ccc', name: 'Графитовый' }] : []),
    ...(isIdMultipleOf3 ? [{ color: '#ffd700', name: 'Золотой' }] : []),
    ...(isIdMultipleOf5 ? [{ color: '#800080', name: 'Фиолетовый' }] : []),
  ];

  return {
    id: id,
    title: `iPhone 14 Pro Max (${id})`,
    colorsSwitcher: colorsSwitcher,
    ramSwitcher: ['12/256GB', '6/128GB', '6/256GB', '6/512GB'],
    price: getRandomInt(100000, 150000),
    images: [
      'https://i.allo.ua/media/catalog/product/cache/3/image/288x340/602f0fa2c1f0d1ba5e241f914e856ff9/s/m/sm-a576_galaxya57_5g_front_awesomenavy_result_1.webp',
      'https://i.allo.ua/media/catalog/product/cache/3/image/288x340/602f0fa2c1f0d1ba5e241f914e856ff9/s/m/sm-a576_galaxya57_5g_front_awesomenavy_result_1.webp',
    ],
    rating: getRandomInt(1, 5),
  };
});
