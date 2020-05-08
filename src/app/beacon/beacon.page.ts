import { Component, OnInit, NgZone, ChangeDetectorRef , ViewChild , EventEmitter, Output} from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { BleService } from '../../services/ble/ble.service';
import { BeaconChartComponent} from './beacon-chart/beacon-chart.component';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { LoadingService } from '../services/loading/loading.service';


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
  time: Date;
}

export interface VelocityData {
  vx: number;
  vy: number;
  vz: number;
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

  @ViewChild(BeaconChartComponent, {static: false}) chart: BeaconChartComponent;
  @Output() updateDataEvent: EventEmitter<any> = new EventEmitter();
  private readonly deviceMacAddress = 'F7:A2:12:8F:25:0C';
  public devices: any = [];
  public showData = false;
  public apDataArr: any = null;
  public mpuDataArri8: any = null;
  public bmpDataArr: any = null;
  public deviceName;
  public scanning = false;
  public accDataNew = {} as AccelerometerData;
  public accDataOld = {} as AccelerometerData;
  public gyroData = {} as GyroData;
  public accAbsoluteVectorDelta = null;
  public accAbsoluteVectorNew = null;
  public accAbsoluteVectorOld = null;
  public velocityDataNew = {} as VelocityData;
  public velocityDataOld = {} as VelocityData;
  public velocityAbsoluteVectorNew = 0;
  public velocityAbsoluteVectorOld = 0;
  public pathSum = 0;
  private lifting = false;
  public weight = 0.0;
  public startTime = 1.0;
  public pressTime = 1.0;
  public rackTime = 1.0;


  constructor(
    public platform: Platform,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef,
    public ble: BLE,
    public bleService: BleService,
    private alertCtrl: AlertController,
    private loadingService: LoadingService,
    private helpers: ErrorDialogService
    ) {
  }
  async ngOnInit() {

    await this.platform.ready().then( () => {
      this.startScan();
  });
}

  async startScan() {
    // this.loadingService.show({ message: 'Scanning...' });
    this.showData = false;
    this.ble.isEnabled().then(() => {
      this.ble.isConnected(this.deviceMacAddress).then(
        () => {

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
          this.showData = true;
          this.cd.detectChanges();
        },
      () => {
        this.devices.splice(0, this.devices.length);
        this.showData = false;
        if (this.scanning) {
          this.stopScan();
          this.loadingService.hide();
        }
        console.log('started scanning');
        this.ble.startScan([]).subscribe((device: PeripheralData) => {
          this.loadingService.hide();
          console.log('detected', device);
          if (!this.devices.find(storedDevice => storedDevice.id === device.id)) {
            this.devices.push(device);
            this.cd.detectChanges();
          }
        }, error => {
          console.log('start scan error', error);
        });
        setTimeout(() => {
            this.loadingService.hide();
            this.ble.stopScan();
            console.log(this.devices);
        }, 5000);
      }
      );
      });

   }


   async connect(device) {
     this.loadingService.show({ message: 'Connecting to ' + device.name });
     this.devices.splice(0, this.devices.length);
     console.log('connecting');
     this.ble.stopScan();
     this.ble.connect(device.id).subscribe(
      (connectedDevice) => {
        console.log(connectedDevice);
        this.loadingService.hide();
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
      this.loadingService.hide();
      this.showData = false;
      this.cd.detectChanges();
      this.helpers.showError(error);
      }
    );
   }

   async stopScan() {
    this.scanning = false;
    this.ble.stopScan();
  }


  async listenToDevice(deviceId, serviceId, characteristics, data) {
    this.loadingService.hide();
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
    const ax = ((data[0] * 256 + data[1]) / 16384) * 9.8065 ;
    const ay = ((data[2] * 256 + data[3]) / 16384) * 9.8065 ;
    let az = (data[4] * 256 + data[5]) / 16384;
    az = az > 0 ? (az - 1) * 9.8065 : (az + 1) * 9.8065;

    const time: Date = new Date();
    if (!this.accDataOld && !this.accDataNew) {
      this.accDataOld = {ax, ay, az, time };
      this.accDataNew = {ax, ay, az, time };

    } else {
      this.accDataOld.ax =  this.accDataNew.ax;
      this.accDataOld.ay =  this.accDataNew.ay;
      this.accDataOld.az =  this.accDataNew.az;
      this.accDataOld.time = new Date(this.accDataNew.time);
    }

    // set new values
    this.accDataNew = {ax, ay, az, time };

    let t = this.accDataNew.time.getMilliseconds() - this.accDataOld.time.getMilliseconds();
    t = Math.abs(t / 1000);
    const vx = (this.accDataNew.ax - this.accDataOld.ax);
    const vy = (this.accDataNew.ay - this.accDataOld.ay);
    const vz = (this.accDataNew.az - this.accDataOld.az);
    this.velocityDataNew = {vx , vy , vz };
    // compute acceleration vector absolute value
    this.accAbsoluteVectorOld = this.accAbsoluteVectorNew;
    this.accAbsoluteVectorNew = Math.sqrt(
      Math.pow(ax, 2) +
      Math.pow(ay, 2) +
      Math.pow(az, 2)
    );
    this.accAbsoluteVectorDelta = Math.abs(this.accAbsoluteVectorNew - this.accAbsoluteVectorOld);
    // console.log('Acc vec:', this.accAbsoluteVectorDelta);
    // compute velocity data
    this.velocityAbsoluteVectorOld = this.velocityAbsoluteVectorNew;
    this.velocityAbsoluteVectorNew = Math.sqrt(
      Math.pow(vx, 2) +
      Math.pow(vy, 2) +
      Math.pow(vz, 2)
    );
    // console.log('Vel vec new:', this.velocityAbsoluteVectorNew);
    // console.log('Vel vec old:', this.velocityAbsoluteVectorOld);
    // console.log('time diff', t);

    // const pathInTimeStamp = (this.velocityAbsoluteVectorNew - this.velocityAbsoluteVectorOld) ;
    // console.log('path', pathInTimeStamp);
    if (this.lifting) {
    this.chart.pushData(this.accAbsoluteVectorDelta);
    }
  }

  computeGyrometerData(data) {
    // vysledok je v jednotkach [stupne/sekundu]
    const gx = (data[6] * 256 + data[7]) / 131;
    const gy = (data[8] * 256 + data[9]) / 131;
    const gz = (data[10] * 256 + data[11]) / 131;
    this.gyroData = { gx, gy, gz};
  }
  reset() {
    this.chart.reset();
  }

  start() {
    this.reset();
    this.lifting = true;
  }
  end() {
    this.lifting = false;
  }

  async changeItem(item) {

    await this.alertCtrl.create({
      message: 'Set a new value',
      inputs: [
        { id: 'itemInput', name: item , type: 'number'}
      ],
      buttons: [
        {text: 'Cancel'},
        {
          text: 'Ok',
          handler: newData => {
              if ( item === 'weight') {
                console.log(newData);
                this.weight = newData.weight;
              }
              if ( item === 'start') {
               this.startTime = newData.start;
              }
              if ( item === 'press') {
                this.pressTime = newData.press;
              }
              if ( item === 'rack') {
                this.rackTime = newData.rack;
              }
              this.cd.detectChanges();
          }
        }
      ]
    }).then(alert => alert.present()).then(() => {
      document.getElementById('itemInput').focus();
    });
  }
}
