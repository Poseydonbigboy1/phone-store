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
      this.updateMenu(user);
    });
  }

  updateMenu(user: Nullable<User>) {
    this.menuItems = [
      {
        label: 'Главная',
        icon: 'pi pi-home',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true },
      },
      { label: 'Каталог', icon: 'pi pi-list', routerLink: '/main/products' },
    ];
    if (user?.role === 'MANAGER') {
      this.menuItems.push({
        label: 'Панель управления',
        icon: 'pi pi-cog',
        routerLink: '/manager',
      });
    }

    this.menuItems.push(
      {
        label: '',
        icon: 'pi pi-shopping-cart',
        routerLink: '/main/checkout',
        styleClass: 'ml-auto',
      },
      {
        label: !!user ? '' : 'Войти',
        icon: 'pi pi-user',
        routerLink: !!user ? '/main/profile' : '/login',
      },
    );
  }
}
