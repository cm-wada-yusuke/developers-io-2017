import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberVideoComponent } from './member-video.component';

describe('MemberVideoComponent', () => {
  let component: MemberVideoComponent;
  let fixture: ComponentFixture<MemberVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
