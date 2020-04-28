import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../../services/validators/email';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the ResetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  public resetPwdForm: FormGroup;

  constructor(public navCtrl: NavController,
              public formBuilder: FormBuilder,
              public afAuth: AngularFireAuth,
              public alertCtrl: AlertController) {
    this.resetPwdForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPasswordPage');
  }

  resetUserPwd() {
    this.afAuth.auth.sendPasswordResetEmail(this.resetPwdForm.value.email).then((user) => {
      this.alertCtrl.create({
        message: 'Link pre reset hesla bol poslaný na Váš email.',
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
            handler: () => {
              this.navCtrl.pop();
            }
          }
        ]
      }).then(alert => alert.present());
    }, (error) => {
      this.alertCtrl.create({
        message: error.message,
        buttons: [{ text: 'Ok', role: 'cancel' }]
      }).then(alert => alert.present());
    });
  }

}
