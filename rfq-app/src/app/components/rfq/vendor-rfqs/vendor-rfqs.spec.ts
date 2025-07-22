import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorRfqs } from './vendor-rfqs';

describe('VendorRfqs', () => {
  let component: VendorRfqs;
  let fixture: ComponentFixture<VendorRfqs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendorRfqs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorRfqs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
