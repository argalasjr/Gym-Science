import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformancePage } from './performance';
import { ChartsModule } from 'ng2-charts';
import { PerformanceChartComponent } from './performance-chart/performance-chart.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ChartsModule,
    RouterModule.forChild([{ path: '', component: PerformancePage }])
  ],
  declarations: [PerformancePage, PerformanceChartComponent],
  exports: [PerformanceChartComponent]
})
export class PerformancePageModule {}
