import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteFormDialog } from './quote-form-dialog';

describe('QuoteFormDialog', () => {
  let component: QuoteFormDialog;
  let fixture: ComponentFixture<QuoteFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
