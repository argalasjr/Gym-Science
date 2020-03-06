import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IBeacon } from '@ionic-native/ibeacon/ngx';
import * as advlib from 'advlib';

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
  constructor(
    public platform: Platform,
    public ibeacon: IBeacon,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef
    ) {
  }
  async ngOnInit() {
    await this.platform.ready().then( () => {
        console.log(advlib.ble);
        this.ngZone.run(() => {
          // Request permission to use location on iOS
          this.ibeacon.requestAlwaysAuthorization();
          // enable bluetooth
          this.ibeacon.enableBluetooth().then(
            () => {
          // create a new delegate and register it with the native layer
          this.delegate = this.ibeacon.Delegate();
          this.ibeacon.setDelegate(this.delegate);
          // Subscribe to delegate's event handlers
          this.delegate.didRangeBeaconsInRegion()
          .subscribe(
            data => {if ( data.beacons.length ) {
              console.log('didRangeBeacons: ', data.beacons[0]);
              this.beaconData = data.beacons[0];
              this.showData = true;
              this.cd.detectChanges();

              // advlib apple ibeacon API for ACCELERATION
              // su tam 3 sposoby v dokumentacii ako ziskat tu akceleraciu toto je treti
              // nefunguje ani jeden z nich
              // + tento treti vyuziva manufacturers v ktorich AprilBeacon nie je podporovany
              console.log(JSON.stringify( advlib.ble.common.manufacturers.apple.ibeacon.process({
                manufacturerSpecificData: {
                  companyIdentifierCode: '004c',
                  data: '0215b9407f30f5f8466eaff925556b57fe6d294c903974'
                }
              }), null, ' '));

              // malo by vypisat cca nieco taketo - dava NULL alebo undefined
              // manufacturerSpecificData: {
              //   nearable: {
              //     id: "2b9e3834cfbfaa71",
              //     temperature: 26.75,
              //     currentState: "still",
              //     accelerationX: 0.03125,
              //     accelerationY: -0.015625,
              //     accelerationZ: 0.984375,
              //     currentStateSeconds: 0,
              //     previousStateSeconds: 3,
              //     statusBytes: [ "01", "04", "01", "c1", "b2", "53" ]
              //   }
              // }
            }
          },
            error => console.log(error)
          );
          this.delegate.didStartMonitoringForRegion()
            .subscribe(
              data => console.log('didStartMonitoringForRegion: ', data),
              error => console.log(error)
            );
          this.delegate.didEnterRegion()
            .subscribe(
              (data) => {
                 console.log('didEnterRegion: ', data),
                // this.ibeacon.stopMonitoringForRegion(this.beaconRegion);
                this.ibeacon.isRangingAvailable().then(
                  () => {
                    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion).then(
                        () => console.log('Native layer received the request to ranging'),
                        error => console.error('Native layer failed to begin ranging: ', error)
                      );
                  });
              }
            );
          this.startScan();
            }, error => console.log(error)
          );
    });
  });
}

  async startScan() {
    this.ibeacon.isBluetoothEnabled()
    .then(
      () => {
        const uuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
        const identifier = 'abeacon_8F82';
        const minor = 33423;
        const major = 1;
        this.beaconRegion = this.ibeacon.BeaconRegion(identifier, uuid, major, minor);
        this.ibeacon.startMonitoringForRegion(this.beaconRegion)
          .then(
            () => console.log('Native layer received the request to monitoring'),
            error => console.error('Native layer failed to begin monitoring: ', error)
          );
    }, error => console.error(error)
    );
  }
}
