import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid user name or password.',
        });
        console.error(err);
      },
    });
  }
}
