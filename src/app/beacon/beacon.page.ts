import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IBeacon } from '@ionic-native/ibeacon/ngx';
import { BLE } from '@ionic-native/ble/ngx';
import { BleService } from '../../services/ble/ble.service';

@Component({
  selector: 'app-beacon',
  templateUrl: './beacon.page.html',
  styleUrls: ['./beacon.page.scss'],
})
export class BeaconPage implements OnInit {

  private delegate = null;
  private beaconRegion = null;
  public beaconData: any = null;
  public showData = false;
  devices: any = [];
  constructor(
    public platform: Platform,
    public ibeacon: IBeacon,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef,
    public ble: BLE,
    public bleService: BleService
    ) {
  }
  async ngOnInit() {
    await this.platform.ready().then( () => {

        this.ngZone.run(() => {

          //////////////////////////////////// SENSOR DEVICE ///////////////////////////////////////
          // setTimeout(() => {
          //   console.log('no devices');
          //   this.ble.stopScan();
          // }, 10000);



          ///////////////////////////////// IBEACON DEVICE////////////////////////////////
          // Request permission to use location on iOS
          // this.ibeacon.requestAlwaysAuthorization();
          // // enable bluetooth
          // this.ibeacon.enableBluetooth().then(
          //   () => {
          // // create a new delegate and register it with the native layer
          // this.delegate = this.ibeacon.Delegate();
          // this.ibeacon.setDelegate(this.delegate);
          // // Subscribe to delegate's event handlers
          // this.delegate.didRangeBeaconsInRegion()
          // .subscribe(
          //   data => {if ( data.beacons.length ) {
          //     console.log('didRangeBeacons: ', data.beacons[0]);
          //     this.beaconData = data.beacons[0];
          //     this.showData = true;
          //     this.cd.detectChanges();
          //   }
          // },
          //   error => console.log(error)
          // );
          // this.delegate.didStartMonitoringForRegion()
          //   .subscribe(
          //     data => console.log('didStartMonitoringForRegion: ', data),
          //     error => console.log(error)
          //   );
          // this.delegate.didEnterRegion()
          //   .subscribe(
          //     (data) => {
          //        console.log('didEnterRegion: ', data),
          //       // this.ibeacon.stopMonitoringForRegion(this.beaconRegion);
          //       this.ibeacon.isRangingAvailable().then(
          //         () => {
          //           this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion).then(
          //               () => console.log('Native layer received the request to ranging'),
          //               error => console.error('Native layer failed to begin ranging: ', error)
          //             );
          //         });
          //     }
          //   );
          // this.startScan();
          //   }, error => console.log(error)
          // );
    });
  });
}

  async startScan() {
    console.log('started scanning');
    this.ble.isEnabled().then(() => {
      console.log('enabled');
      const sensorPro = '5f3a95e4-2b09-c8a9-5d36-826d4cc79ee5';
      const ibeaconDevice = '582C0ECF-183D-EFC9-FE32-D36EEDACF948';
      this.ble.startScan(['99c80001-901e-4afc-9f2e-6fa110a2c4f5']).subscribe((device) => {
        this.devices.push(device);
        this.cd.detectChanges();
      }, error => {
        console.log('start scan error', error);
      });
      console.log(this.devices);
      // this.ble.startScan([sensorPro, ibeaconDevice]).subscribe((device) => {
      //   console.log('detected', device);
      // }, error => {
      //   console.log('start scan error', error);
      // });
    } );
  //   this.ibeacon.isBluetoothEnabled()
  //   .then(
  //     () => {
  //       const uuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
  //       const uuid2 = 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0';
  //       const identifier = 'abeacon_8F82';
  //       const minor = 33423;
  //       const major = 1;
  //       const minor2 = 1;
  //       const major2 = 2;
  //       this.beaconRegion = this.ibeacon.BeaconRegion(identifier, uuid2, major2, minor2);
  //       this.ibeacon.startMonitoringForRegion(this.beaconRegion)
  //         .then(
  //           () => console.log('Native layer received the request to monitoring'),
  //           error => console.error('Native layer failed to begin monitoring: ', error)
  //         );
  //   }, error => console.error(error)
  //   );
   }


   async connect(device) {
     this.ble.connect(device.id).subscribe(
      async (connectedDevice) => {
        this.cd.detectChanges();
        console.log('device');
        console.log(connectedDevice);
        this.ble.read(connectedDevice.id, this.bleService.primaryServiceUuid, this.bleService.apDataUuid);
        }, error => {
       console.log(error);
      }
    );
   }
}
