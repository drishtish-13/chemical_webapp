import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundsService } from '../../services/compounds.service';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  form!: FormGroup;
  id!: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: CompoundsService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9\s\-\(\)]+$/)
      ]],
      image: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]]
    });

    this.loadCompound();
  }

  loadCompound(): void {
    this.loading = true;
    this.svc.get(this.id).subscribe({
      next: (compound) => {
        this.form.patchValue(compound);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.modalService.showError('Error', 'Failed to load compound details. Please try again.');
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showValidationErrors();
      return;
    }

    // Additional client-side validation
    if (!this.validateFormData()) {
      return;
    }

    this.loading = true;
    this.svc.update(this.id, this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.modalService.showSuccess('Success', 'Compound updated successfully!').subscribe(() => {
          this.router.navigate(['/compounds', this.id]);
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.modalService.showError('Error', 'Failed to update compound. Please try again.');
      }
    });
  }

  private validateFormData(): boolean {
    const formValue = this.form.value;
    
    // Validate name
    if (!formValue.name || formValue.name.trim().length < 2) {
      this.modalService.showError('Validation Error', 'Compound name must be at least 2 characters long.');
      return false;
    }

    // Validate image URL
    if (!this.isValidImageUrl(formValue.image)) {
      this.modalService.showError('Validation Error', 'Please provide a valid image URL (jpg, jpeg, png, gif, svg, webp).');
      return false;
    }

    // Validate description
    if (!formValue.description || formValue.description.trim().length < 10) {
      this.modalService.showError('Validation Error', 'Description must be at least 10 characters long.');
      return false;
    }

    return true;
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
      
      if (!validProtocols.includes(urlObj.protocol)) {
        return false;
      }
      
      const pathname = urlObj.pathname.toLowerCase();
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
    if (this.form.get('name')?.errors) {
      const nameErrors = this.form.get('name')?.errors;
      if (nameErrors?.['required']) errors.push('Name is required');
      if (nameErrors?.['minlength']) errors.push('Name must be at least 2 characters');
      if (nameErrors?.['maxlength']) errors.push('Name must be less than 100 characters');
      if (nameErrors?.['pattern']) errors.push('Name contains invalid characters');
    }
    
    if (this.form.get('image')?.errors) {
      const imageErrors = this.form.get('image')?.errors;
      if (imageErrors?.['required']) errors.push('Image URL is required');
      if (imageErrors?.['pattern']) errors.push('Please provide a valid image URL');
    }
    
    if (this.form.get('description')?.errors) {
      const descErrors = this.form.get('description')?.errors;
      if (descErrors?.['required']) errors.push('Description is required');
      if (descErrors?.['minlength']) errors.push('Description must be at least 10 characters');
      if (descErrors?.['maxlength']) errors.push('Description must be less than 1000 characters');
    }
    
    if (errors.length > 0) {
      this.modalService.showError('Validation Errors', errors.join('<br>'));
    }
  }

  // Helper methods for template
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['pattern']) return `Invalid ${fieldName} format`;
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  cancel(): void {
    this.router.navigate(['/compounds', this.id]);
  }
}
