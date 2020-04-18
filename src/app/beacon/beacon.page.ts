import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { BleService } from '../../services/ble/ble.service';
import * as advlib from 'advlib';
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
  private apDataArr: any = null;
  private mpuDataArr: any = null;
  private bmpDataArr: any = null;
  private deviceName;
  public scanning = false;
  private readonly deviceMacAddress = 'F7:A2:12:8F:25:0C';
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
          this.showData = true;
          this.apDataArr = new Array(5).fill(5);
          this.apDataArr = this.apDataArr.map(x => (x / 14).toFixed(2) );
          this.cd.detectChanges();
          // console.log(advlib);
          // const advData = {
          //   serviceData: {
          //     uuid: 'fee5',
          //     data: '6a800001b5a3f393e0a9e50e24dcca9e'
          //   }
          // };
          // const name = advlib.ble.common.memberservices.companyNames.fee5;
          // console.log(name);
          // const res = advlib.ble.data.gatt.services.members.process(advData);
          // console.log(res);
         // this.startScan();
    });
  });
}

  async startScan() {
    this.devices.splice(0, this.devices.length);
    this.showData = false;
    if (this.scanning) {
      this.stopScan();
      // console.log(this.devices);
    }
    console.log('started scanning');
    this.ble.isEnabled().then(() => {
      this.ble.isConnected(this.deviceMacAddress).then(
        () => {
         this.bleService.disconnect(this.deviceMacAddress);
         this.startScan();
        },
      () => {
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
            this.ble.stopScan();
            console.log(this.devices);
          }
        }, 5000);
      }
      );
      });

   }


   async connect(device) {
     this.ble.stopScan();
     this.ble.connect(device.id).subscribe(
      async (connectedDevice) => {
        this.devices.splice(0, this.devices.length);
        this.cd.detectChanges();
        console.log('device');
        this.deviceName = connectedDevice.name;
        this.listenToDevice(
          connectedDevice.id,
          this.bleService.primaryServiceUuid,
          this.bleService.apDataUuid,
          'ap');
        this.listenToDevice(
          connectedDevice.id,
          this.bleService.primaryServiceUuid,
          this.bleService.mpuDataUuid,
          'mpu');
        this.listenToDevice(
          connectedDevice.id,
          this.bleService.primaryServiceUuid,
          this.bleService.bmpDataUuid,
          'bmp');
        }, error => {
      // disconected
      this.showData = false;
      this.cd.detectChanges();
      console.log(error);
      }
    );
   }

   async stopScan() {
    this.scanning = false;
    this.ble.stopScan();
  }


  async listenToDevice(deviceId, serviceId, characteristics, data) {
    this.ble.startNotification(
      deviceId,
      serviceId,
      characteristics).subscribe(buffer => {
      this.showData = true;
      this.cd.detectChanges();
      if (data === 'ap') {
        this.apDataArr = new Uint8Array(buffer);
      }
      if (data === 'mpu') {
        console.log(buffer);
        const i8 = new Int8Array(buffer);
        const f32 = new Float32Array(i8.buffer);
        console.log(f32);
        this.mpuDataArr = i8;
      }
      if (data === 'bmp') {
        this.bmpDataArr = new Uint8Array(buffer);
      }
    });

  }



}
