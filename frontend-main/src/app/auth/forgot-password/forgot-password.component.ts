import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  loading = false;
  message = '';
  error = '';
  form!: FormGroup; // declare first

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit() {
    // Initialize form after fb is available
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    const email = this.form.value.email; // now safe

    this.auth.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.message || 'If that email is registered, you will receive a reset link.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to send reset link';
      }
    });
  }
}
