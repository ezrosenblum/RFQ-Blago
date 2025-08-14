import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteDetails } from './quote-details';

describe('QuoteDetails', () => {
  let component: QuoteDetails;
  let fixture: ComponentFixture<QuoteDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
