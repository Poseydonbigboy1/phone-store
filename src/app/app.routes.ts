import { Routes } from '@angular/router';
import { UsersComponent } from './views/users/users.component';
import { LoginPage } from './views/login-page/login-page';
import { SiteLayuotPage } from './views/site-layuot-page/site-layuot-page';
import { CatalogPage } from './views/site-layuot-page/catalog-page/catalog-page';
import { HomePage } from './views/site-layuot-page/home-page/home-page';
import { ProfilePage } from './views/site-layuot-page/profile-page/profile-page';
import { CheckoutPage } from './views/site-layuot-page/checkout-page/checkout-page';
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
    children: [
      {
        path: 'brands',
        loadComponent: () =>
          import('./views/manager-layout-page/entitys/brands/brands').then((m) => m.Brands),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import(
            './views/manager-layout-page/entitys/component-categories/component-categories'
          ).then((m) => m.ComponentCategories),
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
        path: 'checkout',
        component: CheckoutPage,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
