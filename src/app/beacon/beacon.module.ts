import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { IonicModule } from '@ionic/angular';

import { BeaconPageRoutingModule } from './beacon-routing.module';

import { BeaconPage } from './beacon.page';

import { BeaconChartComponent} from './beacon-chart/beacon-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartsModule,
    BeaconPageRoutingModule
  ],
  declarations: [BeaconPage, BeaconChartComponent],
  providers: [ ],
  exports: [BeaconChartComponent]
})
export class BeaconPageModule {}
