import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinterComponent } from './minter.component';

describe('MinterComponent', () => {
  let component: MinterComponent;
  let fixture: ComponentFixture<MinterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
