import { Component, OnInit } from '@angular/core';
import {
  ApiCategory,
  ApiSubcategory,
  ItemType,
  SaveUserCategoriesPayload,
  SelectionState,
} from '../../../models/material-categories';
import { CategoriesService } from '../../../services/materials';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

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

  successMessage: string | null = null;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();
  private searchInput$ = new Subject<string>();

  constructor(
    private categoriesService: CategoriesService,
    private translate: TranslateService
  ) {
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

  private handleLoadError(error: HttpErrorResponse): void {
    this.isLoading = false;
    this.showErrorMessage('PROFILE.LOAD_CATEGORIES_ERROR_MESSAGE', 5000);
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

    // Select ALL subcategories when category is selected
    if (category.subcategories.length > 0) {
      category.subcategories.forEach((subcategory) => {
        this.selectedSubcategoryIds.add(subcategory.id);
      });
    }
  }

  private deselectCategory(categoryId: number): void {
    this.selectedCategoryIds.delete(categoryId);

    // Deselect ALL subcategories when category is deselected
    const category = this.findCategoryById(categoryId);
    if (category) {
      category.subcategories.forEach((subcategory) => {
        this.selectedSubcategoryIds.delete(subcategory.id);
      });
    }
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

    // For categories: check if category is fully selected
    if (this.selectedCategoryIds.has(itemId)) {
      const category = this.findCategoryById(itemId);
      if (!category) return 'none';

      // If category has no subcategories, it's fully selected
      if (category.subcategories.length === 0) {
        return 'full';
      }

      // Check if ALL subcategories are selected
      const allSubcategoriesSelected = category.subcategories.every((sub) =>
        this.selectedSubcategoryIds.has(sub.id)
      );

      // Check if SOME subcategories are selected
      const someSubcategoriesSelected = category.subcategories.some((sub) =>
        this.selectedSubcategoryIds.has(sub.id)
      );

      if (allSubcategoriesSelected) {
        return 'full';
      } else if (someSubcategoriesSelected) {
        return 'partial';
      } else {
        return 'none';
      }
    }

    // Category is not selected but check if some subcategories are selected
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

  onSaveSpecialties(): void {
    if (this.isSaving) return;
    this.clearMessages();
    const payload = this.buildSavePayload();
    this.performSave(payload);
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
    this.showSuccessMessage('PROFILE.SAVE_SUCCESS_MESSAGE', 3000);
  }

  private handleSaveError(error: HttpErrorResponse): void {
    this.isSaving = false;

    // Handle specific HTTP status codes
    let messageKey = 'PROFILE.SAVE_ERROR_MESSAGE';

    if (error.status === 400) {
      messageKey = 'PROFILE.VALIDATION_ERROR_MESSAGE';
    } else if (error.status === 403) {
      messageKey = 'PROFILE.PERMISSION_ERROR_MESSAGE';
    } else if (error.status >= 500) {
      messageKey = 'PROFILE.SERVER_ERROR_MESSAGE';
    }

    this.showErrorMessage(messageKey, 3000);
  }

  // Centralized message handling methods
  private showErrorMessage(messageKey: string, duration: number = 3000): void {
    this.scrollToTop();

    this.translate.get(messageKey).subscribe((msg: string) => {
      this.errorMessage = msg;
      this.clearMessageAfterDelay(duration, 'error');
    });
  }

  private showSuccessMessage(
    messageKey: string,
    duration: number = 3000
  ): void {
    this.scrollToTop();

    this.translate.get(messageKey).subscribe((msg: string) => {
      this.successMessage = msg;
      this.clearMessageAfterDelay(duration, 'success');
    });
  }

  private scrollToTop(): void {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private clearMessageAfterDelay(
    delay: number,
    messageType: 'error' | 'success'
  ): void {
    setTimeout(() => {
      if (messageType === 'error') {
        this.errorMessage = null;
      } else {
        this.successMessage = null;
      }
    }, delay);
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}
