import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackendRequestsModule } from './core/backend/backend-requests.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackendRequestsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('phone-store');
}
