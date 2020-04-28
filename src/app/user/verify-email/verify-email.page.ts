import { Component, OnInit, NgZone } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication/auth';
import {  NavController} from '@ionic/angular';
@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {

  constructor(
    public authService: AuthenticationService,
    public navCtrl: NavController,
    public ngZone: NgZone,
  ) { }

  ngOnInit() {
  }

  backToLogin() {
    this.ngZone.run(() => {
      this.navCtrl.navigateRoot('login');
      });
  }

}
