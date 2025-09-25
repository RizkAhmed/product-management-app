import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { CreateUpdateProductRequest } from '../models/createProductRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  createProduct(productData: CreateUpdateProductRequest): Observable<Product> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('productCode', productData.productCode);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category.toString());
    formData.append('minimumQuantity', productData.minimumQuantity.toString());
    formData.append('discountRate', productData.discountRate.toString());
    formData.append('imageFile', productData.imageFile);

    return this.http.post<Product>(this.apiUrl, formData);
  }

  updateProduct(
    id: number,
    productData: CreateUpdateProductRequest
  ): Observable<Product> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('productCode', productData.productCode);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category.toString());
    formData.append('minimumQuantity', productData.minimumQuantity.toString());
    formData.append('discountRate', productData.discountRate.toString());

    if (productData.imageFile) {
      formData.append('imageFile', productData.imageFile);
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
