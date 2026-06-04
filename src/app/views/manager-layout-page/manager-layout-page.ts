import { Component, OnInit } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuItem } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PanelMenuModule } from 'primeng/panelmenu';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-manager-layout-page',
  imports: [
    CommonModule,
    RouterOutlet,
    StyleClassModule,
    ToolbarModule,
    AvatarModule,
    BreadcrumbModule,
    PanelMenuModule,
    RippleModule,
    BadgeModule,
  ],
  templateUrl: './manager-layout-page.html',
  styleUrl: './manager-layout-page.scss',
  standalone: true,
})
export class ManagerLayoutPage implements OnInit {
  sidebarItems: MenuItem[] = [];
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.home = { icon: 'pi pi-home', routerLink: '/manager' };
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);
      });
    this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);

    this.sidebarItems = [
      {
        label: 'Справочники',
        items: [
          {
            label: 'Брэнды',
            icon: 'pi pi-tag',
            routerLink: 'directories/brands',
          },
          {
            label: 'Категории',
            icon: 'pi pi-tags',
            routerLink: 'directories/categories',
          },
        ],
      },
    ];
  }

  private createBreadcrumbs(route: ActivatedRoute): MenuItem[] {
    const breadcrumbs: MenuItem[] = [];
    let currentRoute = route.firstChild;
    while (currentRoute) {
      if (currentRoute.snapshot.data['breadcrumb']) {
        breadcrumbs.push({
          label: currentRoute.snapshot.data['breadcrumb'],
        });
      }
      currentRoute = currentRoute.firstChild;
    }
    return breadcrumbs;
  }
}
