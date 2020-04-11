import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { BleService } from '../../services/ble/ble.service';
export interface PeripheralCharacteristic {
  service: string;
  characteristic: string;
  properties: string[];
  descriptors?: any[];
}

export interface PeripheralData {
  name: string;
  id: string;
  rssi: number;
  advertising: ArrayBuffer | any;
}

export interface PeripheralDataExtended extends PeripheralData {
  services: string[];
  characteristics: PeripheralCharacteristic[];
}

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
  public scanning = false;
  devices: any = [];
  constructor(
    public platform: Platform,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef,
    public ble: BLE,
    public bleService: BleService
    ) {
  }
  async ngOnInit() {
    await this.platform.ready().then( () => {

        this.ngZone.run(() => {
          this.startScan();
    });
  });
}

  async startScan() {
    console.log('started scanning');
    this.ble.isEnabled().then(() => {
      this.ble.startScan([]).subscribe((device: PeripheralData) => {
        console.log('detected', device);
        if (!this.devices.find(storedDevice => storedDevice.id === device.id)) {
          this.devices.push(device);
          this.cd.detectChanges();
        }
      }, error => {
        console.log('start scan error', error);
      });
      setTimeout(() => {
        if (this.scanning) {
          this.stopScan();
        }
      }, 5000);
      });
    console.log(this.devices);

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

   async stopScan() {
    this.scanning = false;
    this.ble.stopScan();
  }
}
