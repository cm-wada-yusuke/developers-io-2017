import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersVideoRoomComponent } from './members-video-room.component';

describe('MembersVideoRoomComponent', () => {
  let component: MembersVideoRoomComponent;
  let fixture: ComponentFixture<MembersVideoRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersVideoRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersVideoRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
