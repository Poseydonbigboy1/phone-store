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
import { RouterOutlet } from '@angular/router';

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

  ngOnInit() {
    this.sidebarItems = [
      {
        label: 'Справочники',
        items: [
          {
            label: 'Брэнды',
            icon: 'pi pi-tag',
          },
          {
            label: 'Категории',
            icon: 'pi pi-tags',
          },
        ],
      },
    ];

    this.breadcrumbItems = [
      { icon: 'pi pi-home' },
      { label: 'Favorites' },
      { label: 'Dashboard' },
    ];
  }
}
