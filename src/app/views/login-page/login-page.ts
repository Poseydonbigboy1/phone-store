import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TabsModule } from 'primeng/tabs';
import { AuthService } from '@services';

@Component({
  selector: 'app-login-page',
  imports: [
    ButtonModule,
    PasswordModule,
    InputTextModule,
    TabsModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly _authService: AuthService;

  activeTab: number = 0;
  isLoading = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this._authService = inject(AuthService);
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        login: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('passwordConfirm')?.value
      ? null
      : { passwordMismatch: true };
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { login, password } = this.loginForm.getRawValue();
      this._authService.auth(login, password);
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      console.log('Register:', this.registerForm.value);
      // здесь регистрация
      setTimeout(() => (this.isLoading = false), 1800);
    }
  }
}
