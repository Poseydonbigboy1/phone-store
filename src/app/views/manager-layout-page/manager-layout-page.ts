import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-manager-layout-page',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AvatarModule,
    BreadcrumbModule,
    RippleModule,
  ],
  templateUrl: './manager-layout-page.html',
  styleUrl: './manager-layout-page.scss',
  standalone: true,
})
export class ManagerLayoutPage implements OnInit {
  sidebarVisible = false;
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/manager' };

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
