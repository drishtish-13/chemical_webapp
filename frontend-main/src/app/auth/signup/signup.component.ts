import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  hidePassword = true;
  loading = false;
  errorMessage = '';

  signupForm = this.fb.group({
  username: ['', Validators.required],
  email: [
    '',
    [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      )
    ]
  ],
  password: [
    '',
    [
      Validators.required,
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{6,12}$/)
    ]
  ]
});

  // Password validation methods
  getPasswordValue(): string {
    return this.signupForm.get('password')?.value || '';
  }

  hasMinLength(): boolean {
    return this.getPasswordValue().length >= 6;
  }

  hasUppercase(): boolean {
    return /(?=.*[A-Z])/.test(this.getPasswordValue());
  }

  hasNumber(): boolean {
    return /(?=.*\d)/.test(this.getPasswordValue());
  }

  hasSpecialChar(): boolean {
    return /(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-])/.test(this.getPasswordValue());
  }



  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private modalService: ModalService
  ) {}

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.authService.signup(
      this.signupForm.value.username!,
      this.signupForm.value.email!,
      this.signupForm.value.password!
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.modalService.showSuccess('Account Created!', 'Your account has been created successfully. Please sign in.').subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Signup failed. Please try again.';
        this.modalService.showError('Signup Failed', this.errorMessage);
      }
    });
  }
}
