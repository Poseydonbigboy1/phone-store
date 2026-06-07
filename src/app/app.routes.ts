import { Routes } from '@angular/router';
import { LoginPage } from './views/login-page/login-page';
import { SiteLayuotPage } from './views/site-layuot-page/site-layuot-page';
import { CatalogPage } from './views/site-layuot-page/catalog-page/catalog-page';
import { HomePage } from './views/site-layuot-page/home-page/home-page';
import { ProfilePage } from './views/site-layuot-page/profile-page/profile-page';
import { NotFound } from './views/not-found/not-found';
import { authGuard } from '@guards';
import { ManagerLayoutPage } from './views/manager-layout-page/manager-layout-page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'manager',
    component: ManagerLayoutPage,
    canActivate: [authGuard],
    data: { breadcrumb: 'Панель менеджера' },
    children: [
      {
        path: 'management',
        data: { breadcrumb: 'Управление' },
        children: [
          {
            path: 'orders',
            data: { breadcrumb: 'Заказы' },
            loadComponent: () =>
              import('./views/manager-layout-page/management/orders-management/orders-management')
                .then(m => m.OrdersManagement),
          },
          {
            path: 'products',
            data: { breadcrumb: 'Товары (SKU)' },
            loadComponent: () =>
              import('./views/manager-layout-page/management/sku-management/sku-management')
                .then(m => m.SkuManagement),
          },
        ],
      },
      {
        path: 'directories',
        data: { breadcrumb: 'Справочники' },
        children: [
          {
            path: 'brands',
            data: { breadcrumb: 'Бренды' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/brands/brands').then((m) => m.Brands),
          },
          {
            path: 'categories',
            data: { breadcrumb: 'Категории компонентов' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/component-categories/component-categories').then((m) => m.ComponentCategories),
          },
          {
            path: 'components',
            data: { breadcrumb: 'Компоненты' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/components/components').then((m) => m.Components),
          },
          {
            path: 'products',
            data: { breadcrumb: 'Продукты' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/products/products').then((m) => m.Products),
          },
          {
            path: 'skus',
            data: { breadcrumb: 'SKU' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/skus/skus').then((m) => m.Skus),
          },
          {
            path: 'product-components',
            data: { breadcrumb: 'Компоненты продуктов' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/product-components/product-components').then((m) => m.ProductComponents),
          },
          {
            path: 'orders',
            data: { breadcrumb: 'Заказы' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/orders/orders').then((m) => m.Orders),
          },
          {
            path: 'order-items',
            data: { breadcrumb: 'Позиции заказов' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/order-items/order-items').then((m) => m.OrderItems),
          },
          {
            path: 'users',
            data: { breadcrumb: 'Пользователи' },
            loadComponent: () =>
              import('./views/manager-layout-page/entitys/users/users').then((m) => m.Users),
          },
        ],
      },
    ],
  },
  {
    path: '',
    redirectTo: 'main/home',
    pathMatch: 'full',
  },
  {
    path: 'main',
    component: SiteLayuotPage,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'home',
        component: HomePage,
      },
      {
        path: 'products',
        component: CatalogPage,
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./views/site-layuot-page/product-details-page/product-details-page').then(
            (m) => m.ProductDetailsPage,
          ),
      },
      {
        path: 'profile',
        component: ProfilePage,
        canActivate: [authGuard],
      },
      {
        path: 'cart',
        loadComponent: () => import('./views/site-layuot-page/cart-page/cart-page').then(m => m.CartPage),
        canActivate: [authGuard],
      },
      {
        path: 'checkout',
        loadComponent: () => import('./views/site-layuot-page/checkout-page/checkout-page').then(m => m.CheckoutPage),
        canActivate: [authGuard],
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/site-layuot-page/orders-page/orders-page').then(m => m.OrdersPage),
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
