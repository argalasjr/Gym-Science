import { Component, OnInit, NgZone } from '@angular/core';
import { AlertController , NavController} from '@ionic/angular';
import { AuthenticationService } from '../../../services/authentication/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../../services/validators/email';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})

export class RegistrationPage implements OnInit {

  public signupForm: FormGroup;

  constructor(public navCtrl: NavController,
              public ngZone: NgZone,
              public formBuilder: FormBuilder,
              public alertCtrl: AlertController,
              public afAuth: AngularFireAuth,
              public firestore: AngularFirestore,
              public authService: AuthenticationService) {
    this.signupForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      retype: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      firstName: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lastName: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z ]*'), Validators.required])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  ngOnInit() {}
  signupUser() {
    if (this.signupForm.value.password === this.signupForm.value.retype) {
      this.afAuth.auth.createUserWithEmailAndPassword(
        this.signupForm.value.email,
        this.signupForm.value.password)
        .then(() => {
          const userId = this.afAuth.auth.currentUser.uid;
          const userDoc = this.firestore.doc<any>('users/' + userId);
          userDoc.set({
            uid: userId,
            firstName: this.signupForm.value.firstName,
            lastName: this.signupForm.value.lastName,
            email: this.signupForm.value.email,
            emailVerified: false

          });
          this.authService.SendVerificationMail();
          this.ngZone.run(() => {
            this.navCtrl.navigateRoot('verify-email');
            });
        }, (error) => {

            this.alertCtrl.create({
              message: error.message,
              buttons: [{ text: 'Ok', role: 'cancel' }]
            });

        });


    } else {
      this.alertCtrl.create({
        message: 'The passwords do not match.',
        buttons: [{ text: 'Ok', role: 'cancel' }]
      });
    }
  }
}

