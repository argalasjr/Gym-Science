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

export interface AccelerometerData {
  ax: number;
  ay: number;
  az: number;
}


export interface GyroData {
  gx: number;
  gy: number;
  gz: number;
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

  public showData = false;
  public apDataArr: any = null;
  public mpuDataArri8: any = null;
  public bmpDataArr: any = null;
  public deviceName;
  public scanning = false;
  public accData = {} as AccelerometerData;
  public gyroData = {} as GyroData;
  public readonly deviceMacAddress = 'F7:A2:12:8F:25:0C';
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
  });
}

  async startScan() {
    this.devices.splice(0, this.devices.length);
    this.showData = false;
    if (this.scanning) {
      this.stopScan();
    }
    console.log('started scanning');
    this.ble.isEnabled().then(() => {
      this.ble.isConnected(this.deviceMacAddress).then(
        (device) => {
          this.deviceName = device.name;
          this.listenToDevice(
            this.deviceMacAddress,
            this.bleService.primaryServiceUuid,
            this.bleService.apDataUuid,
            'ap');
          this.listenToDevice(
            this.deviceMacAddress,
            this.bleService.primaryServiceUuid,
            this.bleService.mpuDataUuid,
            'mpu');
          this.listenToDevice(
            this.deviceMacAddress,
            this.bleService.primaryServiceUuid,
            this.bleService.bmpDataUuid,
            'bmp');
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
     console.log('connecting');
     this.ble.stopScan();
     this.ble.connect(device.id).subscribe(
      (connectedDevice) => {
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

      if (data === 'ap') {
        this.apDataArr = new Uint8Array(buffer);
      }

      if (data === 'mpu') {
        this.mpuDataArri8 = new Int8Array(buffer);
        this.computeAccelerometerData(this.mpuDataArri8);
        this.computeGyrometerData(this.mpuDataArri8);
      }

      if (data === 'bmp') {
        this.bmpDataArr = new Uint8Array(buffer);
      }

      this.showData = true;
      this.cd.detectChanges();
    });

  }

  computeAccelerometerData(data) {
    // vysledok je v jednotkach [g] (g je približne 9,8065 m/s-2)
    this.accData.ax = ((data[0] * 256 + data[1]) / 16384);
    this.accData.ay = (data[2] * 256 + data[3]) / 16384;
    this.accData.az = (data[4] * 256 + data[5]) / 16384;
  }

  computeGyrometerData(data) {
    // vysledok je v jednotkach [stupne/sekundu]
    this.gyroData.gx = (data[6] * 256 + data[7]) / 131;
    this.gyroData.gy = (data[8] * 256 + data[9]) / 131;
    this.gyroData.gz = (data[10] * 256 + data[11]) / 131;
  }

}
