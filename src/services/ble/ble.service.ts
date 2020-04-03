import { Injectable } from '@angular/core';
import { Observable, merge, throwError, from } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';
import { tap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BleService {

  deviceUuid = '5f3a95e4-2b09-c8a9-5d36-826d4cc79ee5';
  primaryServiceUuid = '6a800001-b5a3-f393-e0a9-e50e24dcca9e';
  apDataUuid = '6a803216-b5a3-f393-e0a9-e50e24dcca9e';
  mpuDataUuid = '6a806050-b5a3-f393-e0a9-e50e24dcca9e';
  sampleIntervalUuid = '6a80ff0c-b5a3-f393-e0a9-e50e24dcca9e';
  bmpDataUuid = '6a80b280-b5a3-f393-e0a9-e50e24dcca9e';
  toScanUuids = [
    this.deviceUuid,
    this.primaryServiceUuid,
    this.apDataUuid,
    this.mpuDataUuid ,
    this.sampleIntervalUuid ,
    this.bmpDataUuid
  ];


  constructor(private ble: BLE) { }

  connect(deviceId: string): Observable<any> {
    console.log(`connecting to ${deviceId}`);
    return this.ble.connect(deviceId).pipe(
      tap(data => {
        console.log(`connected to ${deviceId}`);
      }),
      catchError(error => {
        console.log(`connection error ${deviceId}`);
        return throwError(`Error when connecting to ${deviceId}`);
      })
    );
  }

  disconnect(deviceId: string): Observable<void> {
    console.log(`disconnecting from ${deviceId}`);
    return from(this.ble.disconnect(deviceId)).pipe(
      tap(data => {
        console.log(`disconnected from ${deviceId}`);
      }),
      catchError(error => {
        console.log(`error when disconnecting from ${deviceId}`);
        return throwError(`Error when disconnecting from ${deviceId}`);
      })
    );
  }

  write(deviceId: string, serviceId: string, characteristicId: string, data: ArrayBuffer): Observable<void> {
    console.log(`writing to ${deviceId}::${serviceId}::${characteristicId}`);
    return from(this.ble.write(deviceId, serviceId, characteristicId, data)).pipe(
      tap(() => console.log(`write to ${deviceId}::${serviceId}::${characteristicId} success`)),
      catchError(error => {
        console.log(`error when writing to ${deviceId}::${serviceId}::${characteristicId}`);
        return throwError(`Error when writing to ${deviceId}::${serviceId}::${characteristicId}`);
      })
    );
  }

  read(deviceId: string, serviceId: string, characteristicId: string): Observable<ArrayBuffer> {
    console.log(`reading from ${deviceId}::${serviceId}::${characteristicId}`);
    return from(this.ble.read(deviceId, serviceId, characteristicId)).pipe(
      tap(() => console.log(`reading from ${deviceId}::${serviceId}::${characteristicId} success`)),
      catchError(error => {
        console.log(`error when reading from ${deviceId}::${serviceId}::${characteristicId}`);
        return throwError(`Error when reading from ${deviceId}::${serviceId}::${characteristicId}`);
      })
    );
  }

  observe(deviceId: string, serviceId: string, characteristicId: string): Observable<ArrayBuffer> {
    console.log(`observing ${deviceId}::${serviceId}::${characteristicId}`);
    return this.ble.startNotification(deviceId, serviceId, characteristicId).pipe(
      tap(() => console.log(`received from ${deviceId}::${serviceId}::${characteristicId}`)),
      catchError(error => {
        console.log(`error when observing ${deviceId}::${serviceId}::${characteristicId}`);
        return throwError(`Error when observing ${deviceId}::${serviceId}::${characteristicId}`);
      })
    );
  }

  readAndObserve(deviceId: string, serviceId: string, characteristicId: string): Observable<ArrayBuffer> {
    return merge(
      this.read(deviceId, serviceId, characteristicId),
      this.observe(deviceId, serviceId, characteristicId)
    );
  }
}
