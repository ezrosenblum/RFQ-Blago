// models/category.models.ts
export interface Subcategory {
  id: number;
  name: string;
  note?: string | null;
}

export interface Category {
  id: number;
  name: string;
  note?: string | null;
  subcategories: Subcategory[];
}
export interface SaveUserCategoriesPayload {
  categoriesIds: number[];
  subcategoriesIds: number[];
}

export type ItemType = 'category' | 'subcategory';

export type SelectionState = 'full' | 'partial' | 'none';