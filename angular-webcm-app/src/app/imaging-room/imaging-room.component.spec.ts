import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagingRoomComponent } from './imaging-room.component';

describe('ImagingRoomComponent', () => {
  let component: ImagingRoomComponent;
  let fixture: ComponentFixture<ImagingRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagingRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
