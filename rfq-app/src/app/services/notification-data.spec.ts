import { TestBed } from '@angular/core/testing';

import { NotificationData } from './notification-data';

describe('NotificationData', () => {
  let service: NotificationData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
