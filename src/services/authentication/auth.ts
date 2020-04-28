import { Injectable, NgZone } from '@angular/core';
import { auth } from 'firebase/app';
import { User } from './user';
import { NavController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ErrorDialogService } from '../../services/error-dialog/error-dialog.service';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: any;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public ngZone: NgZone,
    public errorDialog: ErrorDialogService,
  ) {
    // const userRef: AngularFirestoreDocument<any> = this.afStore.collection('users').valueChanges();
    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    });
  }

  // Login in with email/password
  SignIn(email, password) {
    return this.ngFireAuth.auth.signInWithEmailAndPassword(email, password);
  }

  // Register user with email/password
  RegisterUser(email, password) {
    return this.ngFireAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  // Email verification when new user register
  SendVerificationMail() {
    return this.ngFireAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      this.navCtrl.navigateForward('verify-email');
    });
  }



  // Recover password
  PasswordRecover(passwordResetEmail) {
    return this.ngFireAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email has been sent, please check your inbox.');
    }, (error) => {
      this.errorDialog.showError(error);
    });
  }

  // Returns true when user is looged in
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    this.ngFireAuth.auth.updateCurrentUser(this.ngFireAuth.auth.currentUser);
    const user = JSON.parse(localStorage.getItem('user'));
    if (user != null) {
     // console.log(user);
      this.SetUserData(user);
      return (user.emailVerified !== false) ? true : false;
    }
    if (this.userData != null) {
      return (this.userData.emailVerified !== false) ? true : false;
    }
    console.log('uer is null');
    return null;
  }

  // Sign in with Gmail
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }


  // Auth providers
  AuthLogin(provider) {
    return this.ngFireAuth.auth.signInWithPopup(provider)
    .then((result) => {
       console.log('succes');
       this.ngZone.run(() => {
        this.navCtrl.navigateRoot('tabs');
        });
       this.SetUserData(result.user);
    }, (error) => {
      this.errorDialog.showError(error);
    });
  }

  // Store user in localStorage
  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    console.log('TEST' + user.emailVerified);
    return userRef.update(userData);
  }

  // Sign-out
  SignOut() {
    return this.ngFireAuth.auth.signOut().then(() => {
      this.ngZone.run(() => {
        localStorage.removeItem('user');
        this.navCtrl.navigateRoot('login');
        });
    });
  }

}
