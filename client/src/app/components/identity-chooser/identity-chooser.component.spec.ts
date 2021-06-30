import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityChooserComponent } from './identity-chooser.component';

describe('IdentityChooserComponent', () => {
  let component: IdentityChooserComponent;
  let fixture: ComponentFixture<IdentityChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentityChooserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
