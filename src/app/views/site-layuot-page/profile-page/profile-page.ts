import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Nullable } from '@models/common';
import { User } from '@models/data';
import { AuthService } from '@services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  standalone: true,
})
export class ProfilePage {
  user$: Observable<Nullable<User>>;

  private readonly authService: AuthService;

  constructor() {
    this.authService = inject(AuthService);

    this.user$ = this.authService.user$ as Observable<Nullable<User>>;
  }
}
