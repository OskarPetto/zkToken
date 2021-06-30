import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityOverviewComponent } from './identity-overview.component';

describe('IdentityOverviewComponent', () => {
  let component: IdentityOverviewComponent;
  let fixture: ComponentFixture<IdentityOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentityOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
