import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label, ThemeService } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { Observable } from 'rxjs';
import { ErrorDialogService } from '../../../services/error-dialog/error-dialog.service';



@Component({
  selector: 'app-lift-chart',
  templateUrl: 'lift-chart.component.html',
  styleUrls: ['lift-chart.component.scss']
})
export class LiftChartComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [
    { data: [], label: 'Speed', yAxisID: 'y-axis-1' }
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
          }
        }
      ]
    },
    annotation: {
      // annotations: [
      //   {
      //     type: 'line',
      //     mode: 'vertical',
      //     scaleID: 'x-axis-0',
      //     value: 'March',
      //     borderColor: 'orange',
      //     borderWidth: 2,
      //     label: {
      //       enabled: true,
      //       fontColor: 'orange',
      //       content: 'LineAnno'
      //     }
      //   },
      // ],
    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

    // sensor data observable
   public sensorData = new Observable(subscriber => {
      setInterval(() => {
          const next = this.nextVelocityData();
          subscriber.next(next);
    }, 1000);

});
    // referee timer for orders
    public referee = new Observable(subscriber => {
    setInterval(() => {
      subscriber.next(this.timeToCount);
  }, 1000);

});

 // set order for lift
 public sensorSub = this.sensorData.subscribe((speed: number) => {
  if (this.barIsLoadedFlag) {
 // console.log(this.velocityData);
  // plot data from sensor
  this.pushOne(speed);

  // console.log(speed, this.refereeCounting);
  // start of lift
  if ( speed > 0 && this.orderIndex === 0 ) {
    // console.log(this.orders[this.orderIndex]);
    (this.rules === 'IPF') ?  this.orderIndex++ : this.orderIndex += 2;
    // moving to start order (IPF rules) or press (WUAP rules)
  }

  // order from referee
  if (speed === 0 && !this.refereeCounting && this.orderIndex > 0) {
   console.log('counting');
   this.timeToCount = 0;
   this.refereeCounting = true;
   const refSub = this.referee.subscribe((time: number) => {

      this.timeToCount += 1000;
      // time passsed order can proceed
      if (this.timeToCount === 2000) {
        this.order = this.orders[this.orderIndex];
        this.orderIndex = this.orderIndex + 1;
        this.refereeCounting = false;
        console.log('ref dole');
        refSub.unsubscribe();
        this.timeToCount = 0;
        if (this.order === 'Rack!') {
          this.errorDialog.showError('Good lift!');
          console.log('senzor dole');
          // sensorSub.unsubscribe();
          this.barIsLoadedFlag = false;
        }
          // lifter moved bar too early
      }

      if ( speed > 0 && this.refereeCounting) {
        this.timeToCount = 0;
        this.orderIndex = 0;
        this.refereeCounting = false;
        this.order = this.orders[4];
        this.errorDialog.showError('Sorry no lift!');
        refSub.unsubscribe();
        this.barIsLoadedFlag = false;
        // sensorSub.unsubscribe();
      }
  });

  }
}
  }, error => { console.error('something wrong occurred: ' + error); });



  public velocityData = [0, 0, 0, 0 , 10, 10, 0, 0, 0, 20, 40, 20, 0, 0, 0 , 20, 30, 20 , 10 , 15 , 0, 0];
  public velocityIndex = 0;
  public timeToCount = 0;
  public refereeCounting = false;
  public resetValues = false;
  private orders = ['Bar is loaded!', 'Start!', 'Press!', 'Rack!', 'No lift!'];
  private orderIndex = 0;
  public rules = 'IPF';
  public order = '';
  public barIsLoadedFlag = false;
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor( private errorDialog: ErrorDialogService) { }

  ngOnInit() {
  }


  private nextVelocityData() {
    this.velocityIndex = this.velocityIndex + 1;
    if (this.velocityIndex === this.velocityData.length) {
      this.velocityIndex = 0;
      //return -1;
    }
    return this.velocityData[this.velocityIndex];
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public hideOne() {
    const isHidden = this.chart.isDatasetHidden(1);
    this.chart.hideDataset(1, !isHidden);
  }

  public pushOne(num: any) {
    this.lineChartData.forEach((x, i) => {
      const data: number[] = x.data as number[];
      data.push(num);
    });
    this.lineChartLabels.push(`Label ${this.lineChartLabels.length}`);
    console.log('label ' + this.lineChartLabels.length, num, this.refereeCounting, this.timeToCount);
  }

  public changeColor() {
    this.lineChartColors[2].borderColor = 'green';
    this.lineChartColors[2].backgroundColor = `rgba(0, 255, 0, 0.3)`;
  }

  public changeLabel() {
    this.lineChartLabels[2] = ['1st Line', '2nd Line'];
    // this.chart.update();
  }


  public barIsLoaded() {
    this.reset();
    this.barIsLoadedFlag = true;

  }

  public reset() {
    this.barIsLoadedFlag = false;
    this.lineChartData =  [
      { data: [], label: 'Speed', yAxisID: 'y-axis-1' }];
    this.lineChartLabels = [];
    this.velocityIndex = 0;
    this.orderIndex = 0;
    this.chart.update();
  }
}
