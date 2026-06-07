import { Component, inject, OnInit } from '@angular/core';
import { MessageService, MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@services';

@Component({
  selector: 'app-manager-layout-page',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AvatarModule,
    BreadcrumbModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './manager-layout-page.html',
  styleUrl: './manager-layout-page.scss',
  standalone: true,
  providers: [MessageService],
})
export class ManagerLayoutPage implements OnInit {
  private authService = inject(AuthService);

  sidebarVisible = false;
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/manager' };

  managerName = toSignal(this.authService.user$.pipe(map(u => u?.name || u?.login || 'Менеджер')));

  get currentPageTitle(): string {
    return this.breadcrumbItems.at(-1)?.label ?? '';
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);
        this.sidebarVisible = false;
      });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  goToSite(): void {
    this.router.navigate(['/main/home']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private createBreadcrumbs(route: ActivatedRoute): MenuItem[] {
    const breadcrumbs: MenuItem[] = [];
    let currentRoute = route.firstChild;
    while (currentRoute) {
      if (currentRoute.snapshot.data['breadcrumb']) {
        breadcrumbs.push({ label: currentRoute.snapshot.data['breadcrumb'] });
      }
      currentRoute = currentRoute.firstChild;
    }
    return breadcrumbs;
  }
}
