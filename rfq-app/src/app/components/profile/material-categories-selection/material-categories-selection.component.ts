import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-material-categories-selection',
  templateUrl: './material-categories-selection.component.html',
  styleUrl: './material-categories-selection.component.scss',
})
export class MaterialCategoriesSelectionComponent implements OnInit {
  categories: Category[] = [
    {
      id: 'metals',
      name: 'Metals & Alloys',
      subcategories: [
        { id: 'steel', name: 'Steel & Iron' },
        { id: 'aluminum', name: 'Aluminum' },
        { id: 'copper', name: 'Copper & Brass' },
        { id: 'titanium', name: 'Titanium' },
      ],
    },
    {
      id: 'plastics',
      name: 'Plastics & Polymers',
      subcategories: [
        { id: 'engineering', name: 'Engineering Plastics' },
        { id: 'commodity', name: 'Commodity Plastics' },
        { id: 'specialty', name: 'Specialty Polymers' },
      ],
    },
    {
      id: 'composites',
      name: 'Composites',
      subcategories: [
        { id: 'carbon', name: 'Carbon Fiber' },
        { id: 'glass', name: 'Fiberglass' },
      ],
    },
  ];

  selectedItems = new Set<string>();
  expandedCategories = new Set<string>();
  searchTerm = '';
  showSelected = false;
  filteredCategories: Category[] = [];

  ngOnInit(): void {
    this.updateFilteredCategories();
  }

  // Algorithm 1: Hierarchical Selection Logic
  toggleSelection(itemId: string, type: 'category' | 'subcategory'): void {
    const newSelected = new Set(this.selectedItems);

    if (type === 'category') {
      const category = this.categories.find((c) => c.id === itemId);
      if (!category) return;

      if (newSelected.has(itemId)) {
        // Deselect category and all subcategories
        newSelected.delete(itemId);
        category.subcategories.forEach((sub) => {
          newSelected.delete(sub.id);
        });
      } else {
        // Select category and all subcategories
        newSelected.add(itemId);
        category.subcategories.forEach((sub) => {
          newSelected.add(sub.id);
        });
      }
    } else if (type === 'subcategory') {
      const category = this.categories.find((c) =>
        c.subcategories.some((s) => s.id === itemId)
      );
      const subcategory = category?.subcategories.find((s) => s.id === itemId);

      if (!category || !subcategory) return;

      if (newSelected.has(itemId)) {
        // Deselect subcategory and parent category
        newSelected.delete(itemId);
        newSelected.delete(category.id);
      } else {
        // Select subcategory
        newSelected.add(itemId);

        // Check if all subcategories are selected to auto-select parent
        const allSubsSelected = category.subcategories.every((s) =>
          newSelected.has(s.id)
        );
        if (allSubsSelected) {
          newSelected.add(category.id);
        }
      }
    }

    this.selectedItems = newSelected;
  }

  // Algorithm 2: Search and Filter Logic
  updateFilteredCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.categories;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();

    this.filteredCategories = this.categories
      .map((category) => ({
        ...category,
        subcategories: category.subcategories.filter(
          (sub) =>
            sub.name.toLowerCase().includes(searchLower) ||
            category.name.toLowerCase().includes(searchLower)
        ),
      }))
      .filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          category.subcategories.length > 0
      );
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredCategories();
  }
  getSelectionState(
    itemId: string,
    type: 'category' | 'subcategory'
  ): SelectionState {
    if (type === 'category') {
      const category = this.categories.find((c) => c.id === itemId);
      if (!category) return 'none';

      const allSelected = category.subcategories.every((sub) =>
        this.selectedItems.has(sub.id)
      );
      const someSelected = category.subcategories.some((sub) =>
        this.selectedItems.has(sub.id)
      );
      return allSelected ? 'full' : someSelected ? 'partial' : 'none';
    } else if (type === 'subcategory') {
      const isSelected = this.selectedItems.has(itemId);
      return isSelected ? 'full' : 'none';
    }

    return 'none';
  }

  isMaterialSelected(subcategoryId: string, materialId: string): boolean {
    return this.selectedItems.has(`${subcategoryId}-${materialId}`);
  }

  toggleExpanded(categoryId: string): void {
    const newExpanded = new Set(this.expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    this.expandedCategories = newExpanded;
  }

  isExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  clearSelections(): void {
    this.selectedItems.clear();
  }

  getSelectedCount(): number {
    return Array.from(this.selectedItems).filter(
      (id) =>
        id.includes('-') &&
        !this.categories.some((c) => c.id === id) &&
        !this.categories
          .flatMap((c) => c.subcategories)
          .some((s) => s.id === id)
    ).length;
  }

  getSelectedSubcategories(): string[] {
    return Array.from(this.selectedItems)
      .filter((id) =>
        this.categories.flatMap((c) => c.subcategories).some((s) => s.id === id)
      )
      .map((subId) => {
        const subcategory = this.categories
          .flatMap((c) => c.subcategories)
          .find((s) => s.id === subId);
        return subcategory?.name || subId;
      });
  }

  shouldShowCategory(category: Category): boolean {
    if (!this.showSelected) return true;
    return this.getSelectionState(category.id, 'category') !== 'none';
  }

  shouldShowSubcategory(subcategory: Subcategory): boolean {
    if (!this.showSelected) return true;
    return this.getSelectionState(subcategory.id, 'subcategory') !== 'none';
  }

  shouldShowMaterial(subcategoryId: string, materialId: string): boolean {
    if (!this.showSelected) return true;
    return this.isMaterialSelected(subcategoryId, materialId);
  }

  onSaveSpecialties(): void {
    const selectedData = {
      categories: Array.from(this.selectedItems).filter((id) =>
        this.categories.some((c) => c.id === id)
      ),
      subcategories: Array.from(this.selectedItems).filter((id) =>
        this.categories.flatMap((c) => c.subcategories).some((s) => s.id === id)
      ),
      materials: Array.from(this.selectedItems).filter(
        (id) =>
          id.includes('-') &&
          !this.categories.some((c) => c.id === id) &&
          !this.categories
            .flatMap((c) => c.subcategories)
            .some((s) => s.id === id)
      ),
    };

    console.log('Saving specialties:', selectedData);
    // Here you would typically call your service to save the data
    // this.vendorService.saveSpecialties(selectedData).subscribe(...);
  }
}
