import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'lift',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../lift/lift.module').then(m => m.LiftPageModule)
          }
        ]
      },
      {
        path: 'performance',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../performance/performance.module').then(m => m.PerformancePageModule)
          }
        ]
      },
      {
        path: 'connect',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../beacon/beacon.module').then(m => m.BeaconPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'connect',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/connect',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}



