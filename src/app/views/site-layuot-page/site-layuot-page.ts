import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { User } from '@models/data';
import { AuthService } from '@services';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { Nullable } from 'primeng/ts-helpers';
import { Observable } from 'rxjs';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-site-layuot-page',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    CommonModule, AsyncPipe, FormsModule,
    ButtonModule, OverlayBadgeModule,
    InputTextModule, TooltipModule, AvatarModule,
    PopoverModule, RippleModule,
  ],
  templateUrl: './site-layuot-page.html',
  styleUrl: './site-layuot-page.scss',
})
export class SiteLayuotPage implements OnInit {
  @ViewChild('userMenu') userMenu!: Popover;

  user$: Observable<Nullable<User>>;
  cartCount$: Observable<number>;
  searchQuery = '';
  mobileOpen = signal(false);

  private readonly authService     = inject(AuthService);
  readonly         cartService     = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly router          = inject(Router);

  wishlistCount = this.wishlistService.count;

  constructor() {
    this.user$ = this.authService.user$;
    this.cartCount$ = this.cartService.count$;
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        this.cartService.load();
        this.wishlistService.load();
      } else {
        this.wishlistService.clear();
      }
    });
  }

  goToCart()     { this.router.navigate(['/main/cart']); }
  goToWishlist() { this.router.navigate(['/main/wishlist']); }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }

  toggleUserMenu(event: Event) { this.userMenu?.toggle(event); }
  closeUserMenu()              { this.userMenu?.hide(); }

  logout() {
    this.closeUserMenu();
    this.closeMobile();
    this.authService.logout();
  }

  onSearch() {
    const q = this.searchQuery.trim();
    this.closeMobile();
    this.router.navigate(['/main/products'], q ? { queryParams: { q } } : {});
  }
}
