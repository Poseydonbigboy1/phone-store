import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { MessageModule } from 'primeng/message';
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
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly _authService: AuthService;

  isLoading = false;
  loginError = signal<string | null>(null);
  registerError = signal<string | null>(null);

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
      this.loginError.set(null);
      const { login, password } = this.loginForm.getRawValue();
      this._authService.auth(login, password);
      // Reset loading state after delay (navigate will happen automatically)
      setTimeout(() => (this.isLoading = false), 2000);
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerError.set(null);
      const { name, login, password } = this.registerForm.getRawValue();
      this._authService.register(name, login, password, (msg) => {
        this.isLoading = false;
        this.registerError.set(msg);
      });
    }
  }
}
