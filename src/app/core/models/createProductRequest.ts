export interface CreateUpdateProductRequest {
  category: number;
  productCode: string;
  name: string;
  imageFile: File;
  price: number;
  minimumQuantity: number;
  discountRate: number;
}
