import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeaconPage } from './beacon.page';

const routes: Routes = [
  {
    path: '',
    component: BeaconPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeaconPageRoutingModule {}
