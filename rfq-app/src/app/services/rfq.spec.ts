import { TestBed } from '@angular/core/testing';

import { Rfq } from './rfq';

describe('Rfq', () => {
  let service: Rfq;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rfq);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
