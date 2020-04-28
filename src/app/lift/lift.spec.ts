import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LiftPage } from './lift';

describe('LiftPage', () => {
  let component: LiftPage;
  let fixture: ComponentFixture<LiftPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LiftPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LiftPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
