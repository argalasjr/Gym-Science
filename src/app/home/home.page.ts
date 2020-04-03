import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
// import { BLE } from '@ionic-native/ble/ngx';
// import { BleService } from '../services/ble.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public sensor: any = null;
  public showData = false;
  constructor(
    public platform: Platform,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef,
  //  public ble: BLE,
 //   public bleService: BleService
    ) {
  }
  async ngOnInit() {
    await this.platform.ready().then(
      () => {
        this.ngZone.run(() => {

          // console.log('started scanning');
          // console.log(this.bleService.deviceUuid);
          // this.ble.isEnabled().then(() => console.log('enabled'));
          // this.ble.startScan([this.bleService.deviceUuid]).subscribe((device) => {
          //   console.log('detected', device);
          // }, error => {
          //   console.log('start scan error', error);
          // });
          // setTimeout(() => {
          //   console.log('no devices');
          //   this.ble.stopScan();
          // }, 10000);
        });
    });
  }

}
