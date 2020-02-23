import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BeaconPage } from './beacon.page';

describe('BeaconPage', () => {
  let component: BeaconPage;
  let fixture: ComponentFixture<BeaconPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeaconPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BeaconPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
