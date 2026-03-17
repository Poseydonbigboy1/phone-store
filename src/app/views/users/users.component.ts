import { Component } from '@angular/core';
import { UserHttpService } from '../../core/backend/user-http.service';
import { TableModule } from 'primeng/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SelectModule, TableModule, TagModule, ToastModule, ButtonModule, InputTextModule, RippleModule, FormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  users$: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

  constructor(private userHttpService: UserHttpService) {

  }

  ngOnInit(): void {
    this.refreshUsers();
  }

  refreshUsers(): void {
    this.userHttpService.getUsers$({skip:0, take: 10}).subscribe({
      next: (res) => {
        this.users$.next(res)
      }
    })
  }

  onRowEditInit(user: any): void { }
  onRowEditSave(user: any): void { }
  onRowEditCancel(user: any, ri: any): void { }
}
