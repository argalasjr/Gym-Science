import { Component, ViewChild  } from '@angular/core';
import { LiftChartComponent} from './lift-chart/lift-chart.component';

@Component({
  selector: 'app-lift',
  templateUrl: 'lift.html',
  styleUrls: ['lift.scss']
})

export class LiftPage {

@ViewChild(LiftChartComponent, {static: false}) chart: LiftChartComponent;
@ViewChild(LiftChartComponent, {static: false}) order: LiftChartComponent;

  constructor() {
  }
}
