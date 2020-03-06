import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BeaconPageRoutingModule } from './beacon-routing.module';

import { BeaconPage } from './beacon.page';

import { IBeacon } from '@ionic-native/ibeacon/ngx';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BeaconPageRoutingModule
  ],
  declarations: [BeaconPage],
  providers: [
    IBeacon
  ]
})
export class BeaconPageModule {}
