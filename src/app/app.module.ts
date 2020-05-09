import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';
import 'chartjs-plugin-zoom';


import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BLE } from '@ionic-native/ble/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

export const firebaseConfig = {
  apiKey: 'AIzaSyAWEc8Q_jKUIe1r4sdXH2Kfd9m7ccSYSPg',
  authDomain: 'maps-185112.firebaseapp.com',
  databaseURL: 'https://maps-185112.firebaseio.com',
  projectId: 'maps-185112',
  storageBucket: 'maps-185112.appspot.com',
  messagingSenderId: '381059806124',
  appId: '1:381059806124:web:4e0580b30443f08ce30009',
  measurementId: 'G-84J1KPRCJ2'
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [ ],
  imports: [BrowserModule,
     IonicModule.forRoot(),
     AppRoutingModule,
     HttpClientModule,
     ChartsModule,
     FormsModule,
     ReactiveFormsModule,
     AngularFireModule.initializeApp(firebaseConfig),
     AngularFireAuthModule,
     AngularFireDatabaseModule,
     AngularFirestoreModule],
  providers: [
    StatusBar,
    BLE,
    SplashScreen,
    NativeAudio,
    NativeStorage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
