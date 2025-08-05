interface Material {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

type SelectionState = 'full' | 'partial' | 'none';