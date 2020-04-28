import { Component , NgZone, EventEmitter, OnInit} from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { EmailValidator } from '../../../services/validators/email';
import { LoadingService } from '../../../services/loading/loading.service';
import { AuthenticationService } from '../../../services/authentication/auth';
import { ErrorDialogService } from '../../../services/error-dialog/error-dialog.service';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.page.html',
})
export class LoginPage{
  public loginForm: FormGroup;

  constructor(public navCtrl: NavController,
              public ngZone: NgZone,
              public alertCtrl: AlertController,
              public afAuth: AngularFireAuth,
              public loadingService: LoadingService,
              public authService: AuthenticationService,
              public errorDialog: ErrorDialogService,
              public formBuilder: FormBuilder,
              ) {
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

   loginUser() {
   // await this.loadingService.show({message: 'Prihlasujem....'});
    this.afAuth.auth.signInWithEmailAndPassword(
      this.loginForm.value.email,
      this.loginForm.value.password)
      .then(() => {
        // this.loadingService.hide();
        this.navCtrl.navigateRoot('tabs');
        if (this.authService.isEmailVerified) {
        this.ngZone.run(() => {
          });
        }
    }, (error) => {
      console.log(error);
     // this.loadingService.hide();
      this.errorDialog.showError(error);
    });
  }

  resetPwd() {
    this.ngZone.run(() => {
      this.navCtrl.navigateRoot('reset');
      });
  }

  createAccount() {
    this.ngZone.run(() => {
      this.navCtrl.navigateRoot('registration');
      });
  }


}
