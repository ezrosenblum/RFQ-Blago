import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqDetails } from './rfq-details';

describe('RfqDetails', () => {
  let component: RfqDetails;
  let fixture: ComponentFixture<RfqDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RfqDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
