import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteSendMessageDialog } from './quote-send-message-dialog';

describe('QuoteSendMessageDialog', () => {
  let component: QuoteSendMessageDialog;
  let fixture: ComponentFixture<QuoteSendMessageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteSendMessageDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteSendMessageDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
