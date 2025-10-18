import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  loading = false;
  token = '';
  message = '';
  error = '';
  form!: FormGroup; // initialize in ngOnInit

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // initialize the reactive form here, after fb is available
    this.form = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{6,12}$/)
      ]]
    });

    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error = 'Invalid reset link.';
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.message = '';

    const newPassword = this.form.value.newPassword; // safe now

    this.auth.resetPassword(this.token, newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.message || 'Password reset successful';
        // Optional: redirect to login after short delay
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to reset password';
      }
    });
  }
}
