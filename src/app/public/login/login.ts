import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


//Imports do Sistema
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  carregando = false;
  erro: string | null = null;

  onSubmit(): void {
    if (this.loginForm.invalid || this.carregando) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.erro = null;

    const { email, senha } = this.loginForm.getRawValue();

    this.authService.login(email, senha).subscribe({
      next: () => {
        this.carregando = false;
        void this.router.navigate(['/']);
      },
      error: () => {
        this.carregando = false;
        this.erro = 'Não foi possível entrar. Confira seu e-mail e sua senha.';
      }
    });
  }
}
