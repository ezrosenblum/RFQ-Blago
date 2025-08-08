import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  ApiCategory,
  ApiSubcategory,
  ItemType,
  SaveUserCategoriesPayload,
  SelectionState,
} from '../../../models/material-categories';
import { CategoriesService } from '../../../services/materials';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-material-categories-selection',
  templateUrl: './material-categories-selection.component.html',
  styleUrl: './material-categories-selection.component.scss',
})
export class MaterialCategoriesSelectionComponent implements OnInit {
  categories: ApiCategory[] = [];
  filteredCategories: ApiCategory[] = [];

  selectedCategoryIds = new Set<number>();
  selectedSubcategoryIds = new Set<number>();
  expandedCategories = new Set<number>();

  searchTerm: string = '';
  showSelected: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;

  errorMsg: string = '';
  successMsg: string = '';

  private destroy$ = new Subject<void>();
  private searchInput$ = new Subject<string>();

  constructor(private categoriesService: CategoriesService) {
    this.setupSearchDebounce();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.updateFilteredCategories();
      });
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.clearMessages();

    this.categoriesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => this.handleCategoriesLoaded(categories),
        error: (error) => this.handleLoadError(error),
      });
  }

  private handleCategoriesLoaded(categories: ApiCategory[]): void {
    this.isLoading = false;
    this.categories = categories || [];
    this.updateFilteredCategories();
  }

  private handleLoadError(error: any): void {
    this.isLoading = false;
    this.errorMsg = 'Failed to load categories. Please try again.';
  }

  toggleSelection(itemId: number, type: ItemType): void {
    this.clearMessages();

    if (type === 'category') {
      this.toggleCategorySelection(itemId);
    } else {
      this.toggleSubcategorySelection(itemId);
    }
  }

  private toggleCategorySelection(categoryId: number): void {
    const category = this.findCategoryById(categoryId);
    if (!category) return;

    if (this.selectedCategoryIds.has(categoryId)) {
      this.deselectCategory(categoryId);
    } else {
      this.selectCategory(categoryId, category);
    }
  }

  private selectCategory(categoryId: number, category: ApiCategory): void {
    this.selectedCategoryIds.add(categoryId);

    const hasSelectedSubcategory = category.subcategories.some((sub) =>
      this.selectedSubcategoryIds.has(sub.id)
    );

    if (!hasSelectedSubcategory && category.subcategories.length > 0) {
      this.selectedSubcategoryIds.add(category.subcategories[0].id);
    }
  }

  private deselectCategory(categoryId: number): void {
    this.selectedCategoryIds.delete(categoryId);
  }

  private toggleSubcategorySelection(subcategoryId: number): void {
    const parentCategory = this.findParentCategory(subcategoryId);
    if (!parentCategory) return;

    if (this.selectedSubcategoryIds.has(subcategoryId)) {
      this.deselectSubcategory(subcategoryId, parentCategory);
    } else {
      this.selectSubcategory(subcategoryId, parentCategory);
    }
  }

  private selectSubcategory(
    subcategoryId: number,
    parentCategory: ApiCategory
  ): void {
    this.selectedSubcategoryIds.add(subcategoryId);
    this.selectedCategoryIds.add(parentCategory.id);
  }

  private deselectSubcategory(
    subcategoryId: number,
    parentCategory: ApiCategory
  ): void {
    this.selectedSubcategoryIds.delete(subcategoryId);

    const hasRemainingSelectedSubs = parentCategory.subcategories.some((sub) =>
      this.selectedSubcategoryIds.has(sub.id)
    );

    if (!hasRemainingSelectedSubs) {
      this.selectedCategoryIds.delete(parentCategory.id);
    }
  }

  getSelectionState(itemId: number, type: ItemType): SelectionState {
    if (type === 'subcategory') {
      return this.selectedSubcategoryIds.has(itemId) ? 'full' : 'none';
    }

    if (this.selectedCategoryIds.has(itemId)) {
      return 'full';
    }

    const category = this.findCategoryById(itemId);
    if (!category) return 'none';

    const hasSelectedSubcategories = category.subcategories.some((sub) =>
      this.selectedSubcategoryIds.has(sub.id)
    );

    return hasSelectedSubcategories ? 'partial' : 'none';
  }

  toggleExpanded(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value || '');
  }

  private updateFilteredCategories(): void {
    const searchQuery = this.searchTerm.trim().toLowerCase();

    if (!searchQuery) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories
      .map((category) => this.filterCategory(category, searchQuery))
      .filter((category) => this.shouldIncludeCategory(category, searchQuery));
  }

  private filterCategory(
    category: ApiCategory,
    searchQuery: string
  ): ApiCategory {
    const matchingSubcategories = category.subcategories.filter(
      (sub) =>
        this.matchesSearchQuery(sub.name, searchQuery) ||
        this.matchesSearchQuery(category.name, searchQuery)
    );

    return {
      ...category,
      subcategories: matchingSubcategories,
    };
  }

  private shouldIncludeCategory(
    category: ApiCategory,
    searchQuery: string
  ): boolean {
    return (
      this.matchesSearchQuery(category.name, searchQuery) ||
      category.subcategories.length > 0
    );
  }

  private matchesSearchQuery(text: string, query: string): boolean {
    return text.toLowerCase().includes(query);
  }

  shouldShowCategory(category: ApiCategory): boolean {
    if (!this.showSelected) return true;
    return this.getSelectionState(category.id, 'category') !== 'none';
  }

  shouldShowSubcategory(subcategory: ApiSubcategory): boolean {
    if (!this.showSelected) return true;
    return this.getSelectionState(subcategory.id, 'subcategory') !== 'none';
  }

  clearSelections(): void {
    this.selectedCategoryIds.clear();
    this.selectedSubcategoryIds.clear();
    this.clearMessages();
  }

  getSelectedCount(): number {
    return this.selectedSubcategoryIds.size;
  }

  private findCategoryById(categoryId: number): ApiCategory | undefined {
    return this.categories.find((category) => category.id === categoryId);
  }

  private findParentCategory(subcategoryId: number): ApiCategory | undefined {
    return this.categories.find((category) =>
      category.subcategories.some((sub) => sub.id === subcategoryId)
    );
  }

  private clearMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  onSaveSpecialties(): void {
    if (this.isSaving) return;

    this.clearMessages();

    const validationError = this.validateSelections();
    if (validationError) {
      this.errorMsg = validationError;
      return;
    }

    const payload = this.buildSavePayload();
    this.performSave(payload);
  }

  private validateSelections(): string | null {
    if (this.selectedCategoryIds.size === 0) {
      return 'Please select at least one category.';
    }

    const categoriesWithoutSubcategories = Array.from(
      this.selectedCategoryIds
    ).filter((categoryId) => {
      const category = this.findCategoryById(categoryId);
      return (
        category &&
        !category.subcategories.some((sub) =>
          this.selectedSubcategoryIds.has(sub.id)
        )
      );
    });

    if (categoriesWithoutSubcategories.length > 0) {
      return 'Please select at least one subcategory for each selected category.';
    }

    return null;
  }

  private buildSavePayload(): SaveUserCategoriesPayload {
    const parentCategoriesFromSubs = new Set<number>();

    for (const category of this.categories) {
      const hasSelectedSubcategory = category.subcategories.some((sub) =>
        this.selectedSubcategoryIds.has(sub.id)
      );

      if (hasSelectedSubcategory) {
        parentCategoriesFromSubs.add(category.id);
      }
    }

    const allCategoryIds = new Set([
      ...this.selectedCategoryIds,
      ...parentCategoriesFromSubs,
    ]);

    return {
      categoriesIds: Array.from(allCategoryIds),
      subcategoriesIds: Array.from(this.selectedSubcategoryIds),
    };
  }

  private performSave(payload: SaveUserCategoriesPayload): void {
    this.isSaving = true;

    this.categoriesService
      .save(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSaveSuccess(),
        error: (error) => this.handleSaveError(error),
      });
  }

  private handleSaveSuccess(): void {
    this.isSaving = false;
    this.successMsg = 'Specialties saved successfully!';
    setTimeout(() => {
      this.successMsg = '';
    }, 3000);
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;
    this.errorMsg = 'Failed to save specialties. Please try again.';
  }
}
