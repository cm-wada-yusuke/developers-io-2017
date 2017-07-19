import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TttComponent } from './ttt.component';

describe('TttComponent', () => {
  let component: TttComponent;
  let fixture: ComponentFixture<TttComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TttComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
