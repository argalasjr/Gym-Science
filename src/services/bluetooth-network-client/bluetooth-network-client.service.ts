import { Injectable } from '@angular/core';
import { Observable, merge, throwError, from } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';
import { tap, catchError } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class BluetoothNetworkClientService {

  networkServiceUuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
  ipCharacteristicsUuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
  ssidCharacteristicsUuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
  passCharacteristicsUuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';
  connectedWifiNetworkCharacteristicsUuid = 'B5B182C7-EAB1-4988-AA99-B5C1517008D9';

  constructor(private ble: BLE) { }

  connect(deviceId: string): Observable<PeripheralDataExtended> {
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
