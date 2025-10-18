import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { DetailComponent } from './pages/detail/detail.component';
import { EditComponent } from './pages/edit/edit.component';
import { AuthGuard } from './guards/auth.guard'; // Auth Guard
import { LoginComponent } from './auth/login/login.component'; // Login page
import { SignupComponent } from './auth/signup/signup.component'; // Signup page
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: '', redirectTo: 'compounds', pathMatch: 'full' },
  { path: 'compounds', component: GalleryComponent, canActivate: [AuthGuard] },
  { path: 'compounds/:id', component: DetailComponent, canActivate: [AuthGuard] },
  { path: 'compounds/:id/edit', component: EditComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'compounds' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
