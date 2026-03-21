import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from '@models/data';
import { AuthService } from '@services';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Nullable } from 'primeng/ts-helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-site-layuot-page',
  imports: [RouterOutlet, MenubarModule, CommonModule],
  templateUrl: './site-layuot-page.html',
  styleUrl: './site-layuot-page.scss',
  standalone: true,
})
export class SiteLayuotPage {
  menuItems: MenuItem[] = [];
  user$: Observable<Nullable<User>>;

  private readonly authService: AuthService;

  constructor() {
    this.authService = inject(AuthService);

    this.user$ = this.authService.user$;
  }

  ngOnInit() {
    this.user$.subscribe((user) => {
      this.updateMenu(!!user);
    });
  }

  updateMenu(isLoggedIn: boolean) {
    this.menuItems = [
      {
        label: 'Главная',
        icon: 'pi pi-home',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true },
      },
      { label: 'Каталог', icon: 'pi pi-list', routerLink: '/main/products' },
      {
        label: '',
        icon: 'pi pi-shopping-cart',
        routerLink: '/main/checkout',
        styleClass: 'ml-auto',
      },
      {
        label: isLoggedIn ? '' : 'Войти',
        icon: 'pi pi-user',
        routerLink: isLoggedIn ? '/main/profile' : '/login',
      },
    ];
  }
}
