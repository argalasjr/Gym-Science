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
  public accAbsoluteDeltaList = [];
  public pathSum = 0;
  public lifting = false;
  public weight = 0.0;
  public startTime = 1.0;
  public pressTime = 1.0;
  public rackTime = 1.0;
  public timing = false;
  public waitTime = 1;
  private readonly orders = [ 'Start', 'Press', 'Rack'];
  private orderIndex = 0;
  private didMove = false;
  public competing = false;
  public curSpeed = 0;
  public curForce = 0;
  public maxSpeed = 0;
  public maxForce = 0;
  public reps = 0;
  public newPr = false;
  public noLift = false;
  public vx = 0.0;
  public vy = 0.0;
  public vz = 0.0;
  public velocity = 0;
  public velocityList = [];
  public velocityFactor = 0.6;
  private max = list => list.reduce((a, b) => Math.max(a, b));
  private sum = list => list.reduce((a, b) => a + b , 0);

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
    // this.nativeStorage.clear();
    // this.loadingService.show({ message: 'Scanning...' });
    this.showData = false;
    this.ble.isEnabled().then(() => {
      this.ble.isConnected(this.deviceMacAddress).then(
        () => {

          // this.listenToDevice(
          //   this.deviceMacAddress,
          //   this.bleService.primaryServiceUuid,
          //   this.bleService.apDataUuid,
          //   'ap');
          this.listenToDevice(
            this.deviceMacAddress,
            this.bleService.primaryServiceUuid,
            this.bleService.mpuDataUuid,
            'mpu');
          // this.listenToDevice(
          //   this.deviceMacAddress,
          //   this.bleService.primaryServiceUuid,
          //   this.bleService.bmpDataUuid,
          //   'bmp');
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
        this.vx = 0;
        this.vz = 0;
        this.vy = 0;
        this.deviceName = connectedDevice.name;
        // this.listenToDevice(
        //   connectedDevice.id,
        //   this.bleService.primaryServiceUuid,
        //   this.bleService.apDataUuid,
        //   'ap');
        this.listenToDevice(
          connectedDevice.id,
          this.bleService.primaryServiceUuid,
          this.bleService.mpuDataUuid,
          'mpu');
        // this.listenToDevice(
        //   connectedDevice.id,
        //   this.bleService.primaryServiceUuid,
        //   this.bleService.bmpDataUuid,
        //   'bmp');
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

    const notResponingTimout = setTimeout(() => {
      console.log('disconnected');
      this.showData = false;
      this.cd.detectChanges();
      this.helpers.showError('Senzor not emitting data, please reboot');
      this.ble.stopNotification(deviceId, serviceId, characteristics);
      this.ble.disconnect(this.deviceMacAddress);
      return;
      }, 3000);
    this.ble.startNotification(
      deviceId,
      serviceId,
      characteristics).subscribe(buffer => {

      if (data === 'ap') {
        this.apDataArr = new Uint8Array(buffer);
      }

      if (data === 'mpu') {
        // console.log(buffer);
        // console.log('emmiting');
        this.mpuDataArri8 = new Int8Array(buffer);
        this.computeAccelerometerData(this.mpuDataArri8);
        this.computeGyrometerData(this.mpuDataArri8);
      }

      if (data === 'bmp') {
        this.bmpDataArr = new Uint8Array(buffer);
      }
      this.showData = true;
      this.cd.detectChanges();
      // console.log(this.mpuDataArri8);
      if (!this.mpuDataArri8.every((value) => value === 0)) {
        clearTimeout(notResponingTimout);
      }
    },
    (error) => {
      this.showData = false;
      this.cd.detectChanges();
      this.helpers.showError(error);
    });
  }

  async computeAccelerometerData(data) {
    // console.log('acc');
    // vysledok je v jednotkach [g] (g je približne 9,8065 m/s-2)
    const ax = ((data[0] * 256 + data[1]) / 16384) * 9.8065 ;
    const ay = ((data[2] * 256 + data[3]) / 16384) * 9.8065 ;
    const az = ((data[4] * 256 + data[5]) / 16384) * 9.8065 ;


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

    let newAx = 0;
    let oldAx = 0;
    newAx = Number(this.accDataNew.ax);
    oldAx = Number(this.accDataOld.ax);
    let t = this.accDataNew.time.getMilliseconds() - this.accDataOld.time.getMilliseconds();
    t = Math.abs(t / 1000);
    const vx = parseFloat(((this.accDataNew.ax - this.accDataOld.ax) * t).toFixed(4));
    const vy = parseFloat(((this.accDataNew.ay - this.accDataOld.ay) * t).toFixed(4));
    const vz = parseFloat(((this.accDataNew.az - this.accDataOld.az) * t).toFixed(4));


    // console.log(this.vx, this.vy, this.vz);
    this.velocityDataNew = {vx, vy, vz };
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
    if ( this.velocityAbsoluteVectorNew && this.velocityAbsoluteVectorOld) {
    this.velocityList.push((this.velocityAbsoluteVectorNew - this.velocityAbsoluteVectorOld));
    console.log(this.velocityList);
    this.velocity = Number(this.sum(this.velocityList).toFixed(2));
    this.velocityList.splice(0, this.velocityList.length);
    console.log(this.velocityList);
    this.velocityList.push(this.velocity);
    console.log(this.velocityList);
    }
    // console.log('Vel vec new:', this.velocityAbsoluteVectorNew);
    // console.log('Vel vec old:', this.velocityAbsoluteVectorOld);
    // console.log('time diff', t);
    if (this.isMoving()) {
      this.didMove = true;
    }

    // const pathInTimeStamp = (this.velocityAbsoluteVectorNew - this.velocityAbsoluteVectorOld) ;
    // console.log('path', pathInTimeStamp);
    if (this.lifting && this.didMove && this.orderIndex < 3) {
    this.accAbsoluteDeltaList.push(this.accAbsoluteVectorDelta);
    this.chart.pushData(this.velocity, '');
    await this.referee();
    this.didMove = this.isMoving();
    // console.log('plotting');
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
    this.accAbsoluteDeltaList.splice(0, this.accAbsoluteDeltaList.length);
    if (this.weight > 0) {
    this.reps = 0;
    flag ? this.nativeAudio.play('Start') : this.nativeAudio.play('Training');
    this.reset();
    this.timing = false;
    this.lifting = true;
    this.didMove = false;
    this.competing = flag;
    this.curSpeed = 0;
    this.cd.detectChanges();
    } else {
      this.setWeightAlert();
    }
    this.velocity = 0;
    this.velocityList.splice(0, this.velocityList.length);
  }
  end() {
    this.didMove = false;
    this.lifting = false;
    this.competing = false;
    this.orderIndex = 0;
    if (this.chart.lineChartData[0].data.length > 0) {
    this.curSpeed = Number((this.max(this.chart.lineChartData[0].data)).toFixed(1));
    console.log(this.accAbsoluteDeltaList);
    const maxAcc = Number((this.max(this.accAbsoluteDeltaList)).toFixed(1));
    this.curForce = this.weight * maxAcc;
    if ( this.curSpeed > this.maxSpeed && this.curForce > this.maxForce) {
    this.maxSpeed = this.curSpeed;
    this.maxForce = this.curForce;
    this.newPr = true;
    this.showStats('<br>NEW PERSONAL RECORD!!!<br>');
    this.cd.detectChanges();
    this.nativeStorage.setItem('w' + String(this.weight), { maxSpeed : this.maxSpeed, maxForce : this.maxForce});
    setTimeout(() => {
      this.newPr = false;
      this.cd.detectChanges();
    }, 5000);
  } else {
    this.showStats('');
  }
  }
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

  async showStats(msg) {
    await this.alertCtrl.create({
      message: 'Lifting Statistics <br> <strong>' + msg + '</strong> <br>Actual Max Speed: ' +
      this.curSpeed + ' [km/h]' +
      '<br><br> Best Max Speed: ' + this.maxSpeed + ' [km/h] ' +
      '<br><br>Actual Max Force: ' + this.curForce + ' [N]' +
      '<br><br> Best Max Force: ' + this.maxForce + ' [N]'
      ,
      buttons: [
        {
          text: 'Ok',
        }
      ]
    }).then(alert => alert.present()).then(() => {
      document.getElementById('itemInput').focus();
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
                    console.log('GOT', res);
                    this.reps = 0;
                    this.maxSpeed = res.maxSpeed;
                    this.maxForce = res.maxForce;
                    this.curSpeed = 0;
                    this.chart.lineChartData[0].data = [];
                    this.chart.chart.update();
                    this.cd.detectChanges();
                  },
                  () => {
                    this.reps = 0;
                    this.maxSpeed = 0;
                    this.curSpeed = 0;
                    this.chart.lineChartData[0].data = [];
                    this.chart.chart.update();
                    this.cd.detectChanges();
                  }
                );
              }
              if ( item === 'time') {
               this.waitTime = newData.time;
              }
              if ( item === 'velocityFactor') {
                if ( newData.velocityFactor >= 0.5 && newData.velocityFactor <= 1.0 ) {
                  this.velocityFactor = newData.velocityFactor;
                } else {
                  return ;
                }

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
    return  this.velocity < this.velocityFactor ? false : true;
  }


  async referee() {
    let plotted = false;
    let timeout = null;
    if (!this.timing && !this.isMoving()) {
      this.timing = true;
      this.noLift = false;
      this.orderIndex += 1;
      await setTimeout(() => {
        if (this.competing && this.lifting) {
        console.log(this.orders[this.orderIndex]);
        this.nativeAudio.play(this.orders[this.orderIndex]);
        this.chart.pushData(this.velocity, this.orders[this.orderIndex]);
        plotted = true;
        this.timing = false;
        this.didMove = false;
        if (this.orderIndex === 2) {
          timeout = setTimeout(() => {
            this.reps = 1;
            this.cd.detectChanges();
            this.nativeAudio.play('GoodLift');
            this.chart.pushData(0, 'Good Lift');
            plotted = true;
            console.log('good lift');
            this.end();
          }, 1500);
        }
      } else {
        if (!this.competing && this.lifting) {
        this.nativeAudio.play('Press');
        this.chart.pushData(this.velocity, 'P');
        plotted = true;
        this.reps += 1;
        this.timing = false;
        this.didMove = false;
        this.cd.detectChanges();
      }
      }
      }, this.waitTime * 1000);
    }

    if (this.timing && this.isMoving() && this.competing) {
      this.noLift = true;
      console.log('No lift');
      clearTimeout(timeout);
      this.timing = false;
      this.nativeAudio.play('NoLift');
      this.chart.pushData(this.velocity, 'No Lift');
      this.lifting = false;
      this.competing = false;
      this.orderIndex = 0;

    }
  }

  disconnect() {
    this.ble.disconnect(this.deviceMacAddress);
    this.showData = false;
    this.cd.detectChanges();
  }
}
