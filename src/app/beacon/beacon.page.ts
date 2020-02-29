import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IBeacon } from '@ionic-native/ibeacon/ngx';

// import { AdvLib } from 'advlib/';

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
