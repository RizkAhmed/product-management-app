import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import Swal from 'sweetalert2';
import { Product } from '../../../core/models/product';
import { environment } from '../../../../environments/environment.development';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CreateUpdateProductRequest } from '../../../core/models/createProductRequest';

declare var window: any;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  productForm: FormGroup;
  isEditMode = false;
  selectedProductId: number | null = null;
  selectedFile: File | null = null;
  productModal: any;
  fileBaseUrl = `${environment.filesUrl}/`;
  currentImagePath: string | null = null;

  @ViewChild('productFormModal') modalElement!: ElementRef;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      productCode: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: [1, Validators.required],
      minimumQuantity: [1, [Validators.required, Validators.min(1)]],
      discountRate: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.productModal = new window.bootstrap.Modal(
      this.modalElement.nativeElement
    );
  }

  getSafeImageUrl(imagePath: string): SafeUrl {
    if (!imagePath) return 'https://via.placeholder.com/50';
    return this.sanitizer.bypassSecurityTrustUrl(this.fileBaseUrl + imagePath);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedProductId = null;
    this.productForm.reset({
      category: 1,
      price: 0,
      minimumQuantity: 1,
      discountRate: 0,
    });
    this.selectedFile = null;
    const inputFile = document.getElementById('imageFile') as HTMLInputElement;
    if (inputFile) inputFile.value = '';
    this.productModal.show();
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product.id;
    this.productForm.patchValue(product);
    this.selectedFile = null;
    this.currentImagePath = product.imagePath ?? null;
    const inputFile = document.getElementById('imageFile') as HTMLInputElement;
    inputFile.value = '';
    this.productModal.show();
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    const ProductData: CreateUpdateProductRequest = {
      ...this.productForm.value,
      imageFile: this.selectedFile,
    };
    if (this.isEditMode) {
      this.productService
        .updateProduct(this.selectedProductId!, ProductData)
        .subscribe({
          next: () => {
            this.handleSuccess('Product updated successfully!');
          },
          error: (err) => {
            Swal.fire(
              'Error',
              err.error ?? 'Unexpected error occurred',
              'error'
            );
          },
        });
    } else {
      if (!this.selectedFile) {
        Swal.fire('Error', 'Image file is required for new products.', 'error');
        return;
      }

      this.productService.createProduct(ProductData).subscribe({
        next: () => {
          this.handleSuccess('Product created successfully!');
        },
        error: (err) => {
          console.log(err);
          Swal.fire('Error', err.error ?? 'Unexpected error occurred', 'error');
        },
      });
    }
  }

  deleteProduct(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe(() => {
          this.products = this.products.filter((p) => p.id !== id);
          Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
        });
      }
    });
  }
  private getErrorMessage(err: any): string {
    if (err.error && typeof err.error === 'string') {
      return err.error;
    } else if (err.error && err.error.message) {
      return err.error.message;
    } else if (err.message) {
      return err.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
  private handleSuccess(message: string): void {
    this.productModal.hide();
    this.loadProducts();
    Swal.fire('Success', message, 'success');
  }
}
