import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products' },
];
