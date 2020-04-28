import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
/**
 * Helpers service for showing error dialog
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  constructor(private alertCtrl: AlertController) { }

  async showError(error: any) {
    console.log('error:', error);
    let message = error;
    if (error && error.errorMessage) {
      message = error.errorMessage;
    } else if (error && error.message) {
      message = error.message;
    } else if (error && error.toString && typeof (error.toString) === 'function') {
      message = error.toString();
    }

    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Message',
      message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    alert.present();
  }
}
