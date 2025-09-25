export interface Product {
  id: number;
  category: number;
  productCode: string;
  name: string;
  imagePath?: string;
  price: number;
  minimumQuantity: number;
  discountRate: number;
}
