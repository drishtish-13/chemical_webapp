import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hidePassword = true;
  loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private modalService: ModalService
  ) {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.authService.login(this.loginForm.value.email!, this.loginForm.value.password!)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.modalService.showSuccess('Welcome!', 'Login successful!').subscribe(() => {
            this.router.navigate(['/gallery']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.modalService.showError('Login Failed', err.error?.message || 'Invalid email or password. Please try again.');
        }
      });
  }
}
