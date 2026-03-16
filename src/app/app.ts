import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackendRequestsModule } from './core/backend/backend-requests.module';
import { UsersComponent } from './views/users/users.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackendRequestsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('phone-store');
}
