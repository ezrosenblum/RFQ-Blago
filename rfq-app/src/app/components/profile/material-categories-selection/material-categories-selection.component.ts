import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-material-categories-selection',
  templateUrl: './material-categories-selection.component.html',
  styleUrl: './material-categories-selection.component.scss'
})
export class MaterialCategoriesSelectionComponent implements OnInit {
  
  categories: Category[] = [
    {
      id: 'metals',
      name: 'Metals & Alloys',
      subcategories: [
        { 
          id: 'steel', 
          name: 'Steel & Iron', 
          materials: [
            { id: 'carbon-steel', name: 'Carbon Steel' },
            { id: 'stainless-steel', name: 'Stainless Steel' },
            { id: 'cast-iron', name: 'Cast Iron' }
          ]
        },
        { 
          id: 'aluminum', 
          name: 'Aluminum', 
          materials: [
            { id: '6061-t6', name: '6061-T6' },
            { id: '7075-t6', name: '7075-T6' },
            { id: 'cast-aluminum', name: 'Cast Aluminum' }
          ]
        },
        { 
          id: 'copper', 
          name: 'Copper & Brass', 
          materials: [
            { id: 'pure-copper', name: 'Pure Copper' },
            { id: 'brass', name: 'Brass' },
            { id: 'bronze', name: 'Bronze' }
          ]
        },
        { 
          id: 'titanium', 
          name: 'Titanium', 
          materials: [
            { id: 'grade-2', name: 'Grade 2' },
            { id: 'grade-5', name: 'Grade 5' },
            { id: 'grade-23', name: 'Grade 23' }
          ]
        }
      ]
    },
    {
      id: 'plastics',
      name: 'Plastics & Polymers',
      subcategories: [
        { 
          id: 'engineering', 
          name: 'Engineering Plastics', 
          materials: [
            { id: 'abs', name: 'ABS' },
            { id: 'pom', name: 'POM' },
            { id: 'peek', name: 'PEEK' },
            { id: 'pei', name: 'PEI' }
          ]
        },
        { 
          id: 'commodity', 
          name: 'Commodity Plastics', 
          materials: [
            { id: 'pe', name: 'PE' },
            { id: 'pp', name: 'PP' },
            { id: 'ps', name: 'PS' },
            { id: 'pvc', name: 'PVC' }
          ]
        },
        { 
          id: 'specialty', 
          name: 'Specialty Polymers', 
          materials: [
            { id: 'ptfe', name: 'PTFE' },
            { id: 'fep', name: 'FEP' },
            { id: 'pvdf', name: 'PVDF' }
          ]
        }
      ]
    },
    {
      id: 'composites',
      name: 'Composites',
      subcategories: [
        { 
          id: 'carbon', 
          name: 'Carbon Fiber', 
          materials: [
            { id: 'woven', name: 'Woven' },
            { id: 'unidirectional', name: 'Unidirectional' },
            { id: 'prepreg', name: 'Prepreg' }
          ]
        },
        { 
          id: 'glass', 
          name: 'Fiberglass', 
          materials: [
            { id: 'e-glass', name: 'E-Glass' },
            { id: 's-glass', name: 'S-Glass' },
            { id: 'chopped-strand', name: 'Chopped Strand' }
          ]
        }
      ]
    }
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
  toggleSelection(itemId: string, type: 'category' | 'subcategory' | 'material', parentId?: string): void {
    const newSelected = new Set(this.selectedItems);
    
    if (type === 'category') {
      const category = this.categories.find(c => c.id === itemId);
      if (!category) return;

      if (newSelected.has(itemId)) {
        // Deselect category and all children
        newSelected.delete(itemId);
        category.subcategories.forEach(sub => {
          newSelected.delete(sub.id);
          sub.materials.forEach(mat => newSelected.delete(`${sub.id}-${mat.id}`));
        });
      } else {
        // Select category and all children
        newSelected.add(itemId);
        category.subcategories.forEach(sub => {
          newSelected.add(sub.id);
          sub.materials.forEach(mat => newSelected.add(`${sub.id}-${mat.id}`));
        });
      }
    } else if (type === 'subcategory') {
      const category = this.categories.find(c => c.subcategories.some(s => s.id === itemId));
      const subcategory = category?.subcategories.find(s => s.id === itemId);
      
      if (!category || !subcategory) return;

      if (newSelected.has(itemId)) {
        // Deselect subcategory and materials
        newSelected.delete(itemId);
        subcategory.materials.forEach(mat => newSelected.delete(`${itemId}-${mat.id}`));
        newSelected.delete(category.id); // Deselect parent category
      } else {
        // Select subcategory and materials
        newSelected.add(itemId);
        subcategory.materials.forEach(mat => newSelected.add(`${itemId}-${mat.id}`));
        
        // Check if all subcategories are selected to auto-select parent
        const allSubsSelected = category.subcategories.every(s => newSelected.has(s.id));
        if (allSubsSelected) {
          newSelected.add(category.id);
        }
      }
    } else if (type === 'material' && parentId) {
      const materialKey = `${parentId}-${itemId}`;
      
      if (newSelected.has(materialKey)) {
        newSelected.delete(materialKey);
        newSelected.delete(parentId); // Deselect subcategory
        const category = this.categories.find(c => c.subcategories.some(s => s.id === parentId));
        if (category) {
          newSelected.delete(category.id); // Deselect category
        }
      } else {
        newSelected.add(materialKey);
        
        // Check if all materials in subcategory are selected
        const subcategory = this.categories
          .flatMap(c => c.subcategories)
          .find(s => s.id === parentId);
          
        if (subcategory) {
          const allMatsSelected = subcategory.materials.every(mat => 
            newSelected.has(`${parentId}-${mat.id}`)
          );
          
          if (allMatsSelected) {
            newSelected.add(parentId);
            
            // Check if all subcategories are selected to auto-select parent category
            const category = this.categories.find(c => c.subcategories.some(s => s.id === parentId));
            if (category) {
              const allSubsSelected = category.subcategories.every(s => newSelected.has(s.id));
              if (allSubsSelected) {
                newSelected.add(category.id);
              }
            }
          }
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
    
    this.filteredCategories = this.categories.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(sub => 
        sub.name.toLowerCase().includes(searchLower) ||
        sub.materials.some(mat => mat.name.toLowerCase().includes(searchLower)) ||
        category.name.toLowerCase().includes(searchLower)
      )
    })).filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      category.subcategories.length > 0
    );
  }

  onSearchChange(): void {
    this.updateFilteredCategories();
  }

  // Algorithm 3: Selection State Calculation
  getSelectionState(itemId: string, type: 'category' | 'subcategory'): SelectionState {
    if (type === 'category') {
      const category = this.categories.find(c => c.id === itemId);
      if (!category) return 'none';
      
      const allSelected = category.subcategories.every(sub => this.selectedItems.has(sub.id));
      const someSelected = category.subcategories.some(sub => this.selectedItems.has(sub.id));
      return allSelected ? 'full' : someSelected ? 'partial' : 'none';
    } else if (type === 'subcategory') {
      const subcategory = this.categories
        .flatMap(c => c.subcategories)
        .find(s => s.id === itemId);
        
      if (!subcategory) return 'none';
      
      const allSelected = subcategory.materials.every(mat => 
        this.selectedItems.has(`${itemId}-${mat.id}`)
      );
      const someSelected = subcategory.materials.some(mat => 
        this.selectedItems.has(`${itemId}-${mat.id}`)
      );
      return allSelected ? 'full' : someSelected ? 'partial' : 'none';
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
    return Array.from(this.selectedItems).filter(id => 
      id.includes('-') && 
      !this.categories.some(c => c.id === id) && 
      !this.categories.flatMap(c => c.subcategories).some(s => s.id === id)
    ).length;
  }

  getSelectedMaterials(): string[] {
    return Array.from(this.selectedItems)
      .filter(id => id.includes('-') && 
        !this.categories.some(c => c.id === id) && 
        !this.categories.flatMap(c => c.subcategories).some(s => s.id === id))
      .map(materialId => {
        const [subId, matId] = materialId.split('-');
        const subcategory = this.categories
          .flatMap(c => c.subcategories)
          .find(s => s.id === subId);
        const material = subcategory?.materials.find(m => m.id === matId);
        return material?.name || matId;
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
      categories: Array.from(this.selectedItems).filter(id => 
        this.categories.some(c => c.id === id)
      ),
      subcategories: Array.from(this.selectedItems).filter(id => 
        this.categories.flatMap(c => c.subcategories).some(s => s.id === id)
      ),
      materials: Array.from(this.selectedItems).filter(id => 
        id.includes('-') && 
        !this.categories.some(c => c.id === id) && 
        !this.categories.flatMap(c => c.subcategories).some(s => s.id === id)
      )
    };

    console.log('Saving specialties:', selectedData);
    // Here you would typically call your service to save the data
    // this.vendorService.saveSpecialties(selectedData).subscribe(...);
  }
}
