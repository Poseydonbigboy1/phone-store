import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { User } from '@models/data';
import { AuthService } from '@services';
import { CartService } from '../../core/services/cart.service';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Nullable } from 'primeng/ts-helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-site-layuot-page',
  imports: [RouterOutlet, MenubarModule, CommonModule, AsyncPipe, BadgeModule, ButtonModule, OverlayBadgeModule],
  templateUrl: './site-layuot-page.html',
  styleUrl: './site-layuot-page.scss',
  standalone: true,
})
export class SiteLayuotPage implements OnInit {
  menuItems: MenuItem[] = [];
  user$: Observable<Nullable<User>>;
  cartCount$: Observable<number>;

  private readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  constructor() {
    this.user$ = this.authService.user$;
    this.cartCount$ = this.cartService.count$;
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      this.updateMenu(user);
      if (user) this.cartService.load();
    });
  }

  updateMenu(user: Nullable<User>) {
    this.menuItems = [
      { label: 'Главная', icon: 'pi pi-home', routerLink: '/', routerLinkActiveOptions: { exact: true } },
      { label: 'Каталог', icon: 'pi pi-list', routerLink: '/main/products' },
    ];
    if (user?.role === 'MANAGER') {
      this.menuItems.push({ label: 'Панель управления', icon: 'pi pi-cog', routerLink: '/manager' });
    }
    if (user) {
      this.menuItems.push({ label: 'Мои заказы', icon: 'pi pi-list-check', routerLink: '/main/orders' });
    }
    this.menuItems.push({
      label: !!user ? '' : 'Войти',
      icon: 'pi pi-user',
      routerLink: !!user ? '/main/profile' : '/login',
    });
  }

  goToCart() {
    this.router.navigate(['/main/cart']);
  }
}
