import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCategoriesSelectionComponent } from './material-categories-selection.component';

describe('MaterialCategoriesSelectionComponent', () => {
  let component: MaterialCategoriesSelectionComponent;
  let fixture: ComponentFixture<MaterialCategoriesSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaterialCategoriesSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialCategoriesSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
