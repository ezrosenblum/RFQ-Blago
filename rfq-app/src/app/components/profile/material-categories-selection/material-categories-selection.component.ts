import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  Category,
  Subcategory,
  ItemType,
  SaveUserCategoriesPayload,
  SelectionState,
} from '../../../models/material-categories';
import { CategoriesService } from '../../../services/materials';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../models/user.model';
import { AlertService } from '../../../services/alert.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@Component({
  selector: 'app-material-categories-selection',
  standalone: true,
  templateUrl: './material-categories-selection.component.html',
  styleUrl: './material-categories-selection.component.scss',
})
export class MaterialCategoriesSelectionComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;

  categories: Category[] = [];
  filteredCategories: Category[] = [];

  selectedCategoryIds = new Set<number>();
  selectedSubcategoryIds = new Set<number>();
  expandedCategories = new Set<number>();

  private originalCategoryIds = new Set<number>();
  private originalSubcategoryIds = new Set<number>();

  private categoryById = new Map<number, Category>();
  private parentBySubId = new Map<number, number>();

  searchTerm = '';
  showSelected = false;
  isLoading = false;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();
  private searchInput$ = new BehaviorSubject<string>('');

  constructor(
    private categoriesService: CategoriesService,
    private translate: TranslateService,
    private alertService: AlertService,
    private errorHandlerService: ErrorHandlerService
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

  private loadCategories(): void {
    this.isLoading = true;
    this.clearMessages();

    this.categoriesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => this.handleCategoriesLoaded(categories ?? []),
        error: (error) => this.handleLoadError(error),
      });
  }

  private handleCategoriesLoaded(categories: Category[]): void {
    this.isLoading = false;
    this.categories = categories;
    this.rebuildIndexes(categories);
    this.initializeUserSelections();
    this.updateFilteredCategories();
  }

  private rebuildIndexes(categories: Category[]): void {
    this.categoryById.clear();
    this.parentBySubId.clear();

    for (const c of categories) {
      this.categoryById.set(c.id, c);
      for (const s of c.subcategories ?? []) {
        this.parentBySubId.set(s.id, c.id);
      }
    }
  }

  private handleLoadError(error: HttpErrorResponse): void {
    this.isLoading = false;
    this.showErrorMessage('PROFILE.LOAD_CATEGORIES_ERROR_MESSAGE', 5000);
  }

  private setupSearchDebounce(): void {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((term) => (this.searchTerm = term.trim())),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateFilteredCategories());
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value ?? '');
  }

  private initializeUserSelections(): void {
    if (!this.user) return;

    const userCategoryIds = new Set<number>(
      this.user.categories?.map((c) => c.id) ?? []
    );
    const userSubcategoryIds = new Set<number>(
      this.user.subcategories?.map((s) => s.id) ?? []
    );

    this.selectedCategoryIds.clear();
    this.selectedSubcategoryIds.clear();
    this.originalCategoryIds.clear();
    this.originalSubcategoryIds.clear();

    for (const category of this.categories) {
      if (userCategoryIds.has(category.id)) {
        this.selectedCategoryIds.add(category.id);
        this.originalCategoryIds.add(category.id);
      }

      for (const sub of category.subcategories ?? []) {
        if (userSubcategoryIds.has(sub.id)) {
          this.selectedSubcategoryIds.add(sub.id);
          this.originalSubcategoryIds.add(sub.id);
          this.selectedCategoryIds.add(category.id);
          this.originalCategoryIds.add(category.id);
        }
      }
    }

    this.autoExpandSelectedCategories();
  }

  private autoExpandSelectedCategories(): void {
    for (const category of this.categories) {
      const hasSelectedSub = (category.subcategories ?? []).some((s) =>
        this.selectedSubcategoryIds.has(s.id)
      );
      if (hasSelectedSub || this.selectedCategoryIds.has(category.id)) {
        this.expandedCategories.add(category.id);
      }
    }
  }

  toggleSelection(itemId: number, type: ItemType): void {
    this.clearMessages();
    type === 'category'
      ? this.toggleCategorySelection(itemId)
      : this.toggleSubcategorySelection(itemId);
  }

  private toggleCategorySelection(categoryId: number): void {
    const category = this.categoryById.get(categoryId);
    if (!category) return;

    if (this.selectedCategoryIds.has(categoryId)) {
      this.deselectCategory(category);
    } else {
      this.selectCategory(category);
    }
  }

  private selectCategory(category: Category): void {
    this.selectedCategoryIds.add(category.id);
    for (const sub of category.subcategories ?? [])
      this.selectedSubcategoryIds.add(sub.id);
  }

  private deselectCategory(category: Category): void {
    this.selectedCategoryIds.delete(category.id);
    for (const sub of category.subcategories ?? [])
      this.selectedSubcategoryIds.delete(sub.id);
  }

  private toggleSubcategorySelection(subcategoryId: number): void {
    const parentCategoryId = this.parentBySubId.get(subcategoryId);
    if (parentCategoryId == null) return;

    if (this.selectedSubcategoryIds.has(subcategoryId)) {
      this.deselectSubcategory(subcategoryId, parentCategoryId);
    } else {
      this.selectSubcategory(subcategoryId, parentCategoryId);
    }
  }

  private selectSubcategory(subId: number, parentCategoryId: number): void {
    this.selectedSubcategoryIds.add(subId);
    this.selectedCategoryIds.add(parentCategoryId);
  }

  private deselectSubcategory(subId: number, parentCategoryId: number): void {
    this.selectedSubcategoryIds.delete(subId);

    const parent = this.categoryById.get(parentCategoryId);
    if (!parent) return;

    const anyRemaining = (parent.subcategories ?? []).some((s) =>
      this.selectedSubcategoryIds.has(s.id)
    );
    if (!anyRemaining) this.selectedCategoryIds.delete(parentCategoryId);
  }

  getSelectionState(itemId: number, type: ItemType): SelectionState {
    if (type === 'subcategory')
      return this.selectedSubcategoryIds.has(itemId) ? 'full' : 'none';

    const category = this.categoryById.get(itemId);
    if (!category) return 'none';

    const subs = category.subcategories ?? [];
    if (subs.length === 0)
      return this.selectedCategoryIds.has(itemId) ? 'full' : 'none';

    let selectedCount = 0;
    for (const s of subs)
      if (this.selectedSubcategoryIds.has(s.id)) selectedCount++;

    if (selectedCount === 0) return 'none';
    if (selectedCount === subs.length) return 'full';
    return 'partial';
  }

  toggleExpanded(categoryId: number): void {
    if (this.expandedCategories.has(categoryId))
      this.expandedCategories.delete(categoryId);
    else this.expandedCategories.add(categoryId);
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  private updateFilteredCategories(): void {
    const q = this.searchTerm.toLowerCase();
    if (!q) {
      this.filteredCategories = this.categories.slice();
      return;
    }

    this.filteredCategories = this.categories
      .map((category) => this.filterCategory(category, q))
      .filter((category) => this.shouldIncludeCategory(category, q));
  }

  private filterCategory(category: Category, q: string): Category {
    const subs = category.subcategories ?? [];
    const matchingSubs = subs.filter(
      (s) => this.matches(q, s.name) || this.matches(q, category.name)
    );
    return { ...category, subcategories: matchingSubs };
  }

  private shouldIncludeCategory(category: Category, q: string): boolean {
    return (
      this.matches(q, category.name) ||
      (category.subcategories?.length ?? 0) > 0
    );
  }

  private matches(q: string, text: string): boolean {
    return (text ?? '').toLowerCase().includes(q);
  }

  shouldShowCategory(category: Category): boolean {
    return (
      !this.showSelected ||
      this.getSelectionState(category.id, 'category') !== 'none'
    );
  }

  shouldShowSubcategory(sub: Subcategory): boolean {
    return (
      !this.showSelected ||
      this.getSelectionState(sub.id, 'subcategory') !== 'none'
    );
  }

  clearSelections(): void {
    this.selectedCategoryIds.clear();
    this.selectedSubcategoryIds.clear();
    this.clearMessages();
  }

  getSelectedCount(): number {
    return this.selectedSubcategoryIds.size;
  }

  hasSelectionChanged(): boolean {
    return (
      !this.setsEqual(this.selectedCategoryIds, this.originalCategoryIds) ||
      !this.setsEqual(this.selectedSubcategoryIds, this.originalSubcategoryIds)
    );
  }

  isSaveDisabled(): boolean {
    return this.isSaving || !this.hasSelectionChanged();
  }

  private setsEqual(a: Set<number>, b: Set<number>): boolean {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  onSaveSpecialties(): void {
    if (this.isSaving) return;
    this.clearMessages();
    this.performSave(this.buildSavePayload());
  }

  private buildSavePayload(): SaveUserCategoriesPayload {
    const parentCategoriesFromSubs = new Set<number>();
    for (const subId of this.selectedSubcategoryIds) {
      const parentCategoryId = this.parentBySubId.get(subId);
      if (parentCategoryId != null) parentCategoriesFromSubs.add(parentCategoryId);
    }

    const allCategoryIds = new Set<number>([
      ...this.selectedCategoryIds,
      ...parentCategoriesFromSubs,
    ]);

    return {
      categoriesIds: Array.from(allCategoryIds),
      subcategoriesIds: Array.from(this.selectedSubcategoryIds),
    };
  }

  private performSave(payload: SaveUserCategoriesPayload): void {
    this.alertService.confirm('ALERTS.CONFIRM_SAVE').then((result) => {
      if (result.isConfirmed) {
        this.isSaving = true;

        this.categoriesService
          .save(payload)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => this.handleSaveSuccess(),
            error: (error) => {
              this.isSaving = false;
              const message = this.errorHandlerService.handleError(error);
              this.showErrorMessage(message);
            },
          });
      }
    });
  }

  private handleSaveSuccess(): void {
    this.isSaving = false;
    this.showSuccessMessage('PROFILE.SAVE_SUCCESS_MESSAGE', 3000);
    this.originalCategoryIds = new Set(this.selectedCategoryIds);
    this.originalSubcategoryIds = new Set(this.selectedSubcategoryIds);
  }

  private showErrorMessage(messageKey: string, duration = 3000): void {
    this.scrollToTop();
    this.translate
      .get(messageKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg) => {
        this.errorMessage = msg;
        this.clearMessageAfterDelay(duration, 'error');
      });
  }

  private showSuccessMessage(messageKey: string, duration = 3000): void {
    this.scrollToTop();
    this.translate
      .get(messageKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg) => {
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
    type: 'error' | 'success'
  ): void {
    setTimeout(() => {
      if (type === 'error') this.errorMessage = null;
      else this.successMessage = null;
    }, delay);
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}
