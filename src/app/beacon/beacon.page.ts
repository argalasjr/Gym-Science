import { Component, OnInit, NgZone, ChangeDetectorRef , ViewChild , EventEmitter, Output} from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { BleService } from '../../services/ble/ble.service';
import { BeaconChartComponent} from './beacon-chart/beacon-chart.component';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { LoadingService } from '../services/loading/loading.service';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

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

export enum Orders {
  BarIsLoaded,
  Start,
  Press,
  Rack
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
  public accAbsoluteVectorDelta = 0;
  public accAbsoluteVectorNew = 0;
  public accAbsoluteVectorOld = 0;
  public velocityDataNew = {} as VelocityData;
  public velocityDataOld = {} as VelocityData;
  public velocityAbsoluteVectorDelta = 0;
  public velocityAbsoluteVectorNew = 0;
  public velocityAbsoluteVectorOld = 0;
  public pathSum = 0;
  public lifting = false;
  public weight = 0.0;
  public startTime = 1.0;
  public pressTime = 1.0;
  public rackTime = 1.0;
  public timing = false;
  public waitTime = 1;
  private readonly orders = [ 'BarIsLoaded', 'Start', 'Press', 'Rack'];
  private orderIndex = 0;
  private didMove = false;
  private competing = false;
  public avgSpeed = 0;
  public avgForce = 0;
  public maxSpeed = 0;
  public maxForce = 0;

  private average = list => list.reduce((prev, curr) => prev + curr) / list.length;
  private max = list => list.reduce((a, b) => Math.max(a, b));
  constructor(
    public platform: Platform,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef,
    public ble: BLE,
    public bleService: BleService,
    private alertCtrl: AlertController,
    private loadingService: LoadingService,
    private helpers: ErrorDialogService,
    private nativeAudio: NativeAudio,
    private nativeStorage: NativeStorage
    ) {
  }
  async ngOnInit() {

    await this.platform.ready().then( () => {
      this.nativeAudio.preloadSimple('Start', 'assets/records/start.mp3');
      this.nativeAudio.preloadSimple('Press', 'assets/records/press.mp3');
      this.nativeAudio.preloadSimple('Rack', 'assets/records/rack.mp3');
      this.nativeAudio.preloadSimple('GoodLift', 'assets/records/goodlift.mp3');
      this.nativeAudio.preloadSimple('NoLift', 'assets/records/nolift.mp3');
      this.nativeAudio.preloadSimple('BarIsLoaded', 'assets/records/barisloaded.mp3');
      this.nativeAudio.preloadSimple('Training', 'assets/records/training.mp3');
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
    },
    (error) => {
      this.showData = false;
      this.cd.detectChanges();
      this.helpers.showError(error);
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
      this.velocityAbsoluteVectorDelta = 0.1;

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
    const vx = (this.accDataNew.ax - this.accDataOld.ax) * t;
    const vy = (this.accDataNew.ay - this.accDataOld.ay) * t;
    const vz = (this.accDataNew.az - this.accDataOld.az) * t;
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
    this.velocityAbsoluteVectorNew = Number(this.velocityAbsoluteVectorNew.toFixed(2));
    this.velocityAbsoluteVectorDelta += this.velocityAbsoluteVectorNew * 100;
    // console.log('Vel vec new:', this.velocityAbsoluteVectorNew);
    // console.log('Vel vec old:', this.velocityAbsoluteVectorOld);
    // console.log('time diff', t);
    if (this.isMoving()) {
      this.didMove = true;
    }

    // const pathInTimeStamp = (this.velocityAbsoluteVectorNew - this.velocityAbsoluteVectorOld) ;
    // console.log('path', pathInTimeStamp);
    if (this.lifting && this.didMove) {
    this.chart.pushData(this.accAbsoluteVectorDelta);
    this.competitionMode();
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
    this.orderIndex = 0;
  }

  start(flag) {
    if (this.weight > 0) {
    flag ? this.nativeAudio.play('BarIsLoaded') : this.nativeAudio.play('Training');
    this.reset();
    this.lifting = true;
    this.didMove = false;
    this.competing = flag;
    } else {
      this.setWeightAlert();
    }
  }
  end() {
    this.didMove = false;
    this.lifting = false;
    this.orderIndex = 0;
    console.log(this.average(this.chart.lineChartData[0].data));
    this.avgSpeed = Number((this.average(this.chart.lineChartData[0].data) * 3.6).toFixed(2));
    this.maxSpeed = Number((this.max(this.chart.lineChartData[0].data) * 3.6 ).toFixed(2));
    this.avgForce = Number((this.weight * (this.avgSpeed / 3.6)).toFixed(2));
    this.maxForce = Number((this.weight * (this.maxSpeed / 3.6)).toFixed(2));
    this.nativeStorage.setItem('w' + String(this.weight), {
      avgSpeed: this.avgSpeed,
      avgForce: this.avgForce,
      maxSpeed: this.maxSpeed,
      maxForce: this.maxForce});
  }

  async setWeightAlert() {

    await this.alertCtrl.create({
      message: 'Please set a weight before lifting',

      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.changeItem('weight');
          }
        }
      ]
    }).then(alert => alert.present()).then(() => {
    });
  }

  async changeItem(item) {

    await this.alertCtrl.create({
      message: 'Set a new ' + item,
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
                this.nativeStorage.getItem('w' + String(this.weight) ).then(
                  (res) => {
                    this.avgSpeed = res.avgSpeed;
                    this.avgForce = res.avgForce;
                    this.maxForce = res.maxForce;
                    this.maxSpeed = res.maxSpeed;
                    this.cd.detectChanges();
                  },
                  () => console.log('no savings')
                );
              }
              if ( item === 'time') {
               this.waitTime = newData.time;
              }
              this.cd.detectChanges();
          }
        }
      ]
    }).then(alert => alert.present()).then(() => {
      document.getElementById('itemInput').focus();
    });
  }

  isMoving() {
    return  Math.round(this.accAbsoluteVectorDelta) === 0 ? false : true;
  }


  competitionMode() {
    if (!this.timing && !this.isMoving()) {
      this.timing = true;
      this.orderIndex += 1;
      setTimeout(() => {
        if (this.competing) {
        console.log(this.orders[this.orderIndex]);
        this.nativeAudio.play(this.orders[this.orderIndex]);
        this.timing = false;
        this.didMove = false;
        if (this.orderIndex === 3) {
          setTimeout(() => {
            this.nativeAudio.play('GoodLift');
            console.log('good lift');
            this.end();
          }, 1500);
        }
      } else {
        this.nativeAudio.play('Press');
        this.timing = false;
        this.didMove = false;
      }
      }, this.waitTime * 1000);
    }

    if (this.timing && this.isMoving()) {
      console.log('No lift');
      this.nativeAudio.play('NoLift');
      this.lifting = false;
      this.orderIndex = 0;
    }

  }

  disconnect() {
    this.ble.disconnect(this.deviceMacAddress);
    this.showData = false;
    this.cd.detectChanges();
  }
}
