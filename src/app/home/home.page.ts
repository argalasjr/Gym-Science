import { Component, NgZone} from '@angular/core';
import { AlertController , NavController} from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { AuthenticationService } from '../../services/authentication/auth';
@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html'
})
export class HomePage {

  userName: any;
  userId: any;
  userDoc: any;
  userBioDoc: any;
  userBioList: any;
  userLiftRef: any;
  userLiftList: any;

  liftName: any;
  liftWeight: any;

  constructor(public navCtrl: NavController,
              public ngZone: NgZone,
              public alertCtrl: AlertController,
              public afAuth: AngularFireAuth,
              public firestore: AngularFirestore,
              public authService: AuthenticationService) {
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.userName = user.displayName;
        this.userDoc = this.firestore.doc<any>('users/' + this.userId).valueChanges();
        this.userBioDoc = this.firestore.collection('users/' + this.userId + '/bio/').valueChanges();
        this.userBioList = this.firestore.collection('users/' + this.userId + '/bio/');
        this.userLiftRef = this.firestore.collection('users/' + this.userId + '/lift/').valueChanges();
        this.userLiftList = this.firestore.collection('users/' + this.userId + '/lift/');
    //     this.teamAdminCollection = fireStore.collection<any>('userProfile', ref =>
    // ref.where('teamAdmin', '==', true));
      }
    });

    // this.userId = this.afAuth.auth.currentUser.uid;

    // this.fireStoreTaskList = this.firestore.doc<any>('users/' + this.userId).collection('tasks');
  }

  modifyBioItem() {

  }

  addItem() {
    if (this.liftName.length > 0) {
      const docId = this.firestore.createId();
      this.userLiftList.doc(docId).set({
        id: docId,
        liftName : this.liftName,
        liftWeight: ''
      });
      this.liftName = '';
    }
    // this.input.setFocus();
  }

  logout() {
    this.authService.SignOut().then(authData => {
      this.ngZone.run(() => {
        this.navCtrl.navigateRoot('login');
        });
    });
  }

  deleteTask(index) {
    // this.fireStoreList.doc(index).delete();
  }

}

