
export interface ProductOption {
  id?: string;
  name: string;
  price?: number; // If null/undefined, use main product price
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  categories?: string[] | null;
  subcategories?: string[] | null;
  cover_image?: string | null;
  images?: string[] | null;
  options?: ProductOption[] | null;
  stock_quantity?: number | null;
  discount_percentage?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type CategoryType = 'all' | string;

export type PaymentMethod = 'visa_card' | 'zain_cash' | 'cash_on_delivery';
