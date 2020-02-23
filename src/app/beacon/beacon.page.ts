import { Component, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IBeacon, IBeaconPluginResult } from '@ionic-native/ibeacon/ngx';
import { BluetoothNetworkClientService } from '../../services/bluetooth-network-client/bluetooth-network-client.service';
// import { AdvLib } from 'advlib/';

@Component({
  selector: 'app-beacon',
  templateUrl: './beacon.page.html',
  styleUrls: ['./beacon.page.scss'],
})
export class BeaconPage implements OnInit {

  private delegate = null;

  constructor(
    public platform: Platform,
    public ibeacon: IBeacon,
    private bleService: BluetoothNetworkClientService,
    public ngZone: NgZone
    // public adv: AdvLib
    ) {
  }
  async ngOnInit() {
    await this.platform.ready().then( () => {
        this.ngZone.run(() => {
          // Request permission to use location on iOS
          this.ibeacon.requestAlwaysAuthorization();
          // create a new delegate and register it with the native layer
          this.delegate = this.ibeacon.Delegate();
          // // Subscribe to some of the delegate's event handlers
          this.delegate.didRangeBeaconsInRegion()
          .subscribe(
            data => console.log('didRangeBeaconsInRegion: ', data),
            error => console.error()
          );
          this.delegate.didStartMonitoringForRegion()
            .subscribe(
              data => console.log('didStartMonitoringForRegion: ', data),
              error => console.error()
            );
          this.delegate.didEnterRegion()
            .subscribe(
              data => {
                // const rawHexPacket = '421655daba50e1fe0201050c097265656c79416374697665';
                // const processedPacket = this.adv.ble.process(rawHexPacket);
                // console.log(JSON.stringify(processedPacket, null, ' '));
                console.log('didEnterRegion: ', data);
                this.bleService.connect(data.region.uuid);
                // this.bleService.read(data.region.uuid, data.region.uuid, data.region.uuid);
              }
            );
          this.startScan();
    });
  });
}

  async startScan() {
    this.ibeacon.isAdvertisingAvailable()
    .then(
      () => {
      console.log('Advertising avaiable');
      this.ibeacon.isAdvertising()
      .then(
        () => {
        console.log('Advertising');
        const uuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
        const identifier = 'advertisedBeacon';
        const minor = 33423;
        const major = 1;
        const beaconRegion = this.ibeacon.BeaconRegion(identifier, uuid, major, minor);
        this.ibeacon.enableBluetooth();
        this.ibeacon.startMonitoringForRegion(beaconRegion)
          .then(
            () => console.log('Native layer received the request to monitoring'),
            error => console.error('Native layer failed to begin monitoring: ', error)
          );
        },
        error => console.error('Error advertising', error)
      );
    }
      ,
      error => console.error('Error advertising not available', error)
    );
  }

}
