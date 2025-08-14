import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePreviewDialog } from './image-preview-dialog';

describe('ImagePreviewDialog', () => {
  let component: ImagePreviewDialog;
  let fixture: ComponentFixture<ImagePreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagePreviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagePreviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
