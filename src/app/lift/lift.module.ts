import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { LiftPage } from './lift';
import {LiftChartComponent} from './lift-chart/lift-chart.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ChartsModule,
    RouterModule.forChild([{ path: '', component: LiftPage }])
  ],
  declarations: [LiftPage, LiftChartComponent],
  exports: [LiftChartComponent]
})
export class LiftPageModule {}
