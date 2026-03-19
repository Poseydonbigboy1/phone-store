import { Routes } from '@angular/router';
import { UsersComponent } from './views/users/users.component';
import { LoginPage } from './views/login-page/login-page';
import { SiteLayuotPage } from './views/site-layuot-page/site-layuot-page';
import { CatalogPage } from './views/site-layuot-page/catalog-page/catalog-page';
import { ProductDetailsPage } from './views/site-layuot-page/product-details-page/product-details-page';
import { HomePage } from './views/site-layuot-page/home-page/home-page';
import { ProfilePage } from './views/site-layuot-page/profile-page/profile-page';
import { CheckoutPage } from './views/site-layuot-page/checkout-page/checkout-page';
import { NotFound } from './views/not-found/not-found';
import { authGuard } from '@guards';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
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
        component: ProductDetailsPage,
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
