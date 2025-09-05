import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedQuoteDetails } from './approved-quote-details';

describe('ApprovedQuoteDetails', () => {
  let component: ApprovedQuoteDetails;
  let fixture: ComponentFixture<ApprovedQuoteDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovedQuoteDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedQuoteDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
