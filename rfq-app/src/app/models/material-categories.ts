// models/category.models.ts
export interface ApiSubcategory {
  id: number;
  name: string;
  note?: string | null;
}

export interface ApiCategory {
  id: number;
  name: string;
  note?: string | null;
  subcategories: ApiSubcategory[];
}
export interface SaveUserCategoriesPayload {
  categoriesIds: number[];
  subcategoriesIds: number[];
}

export type ItemType = 'category' | 'subcategory';

export type SelectionState = 'full' | 'partial' | 'none';