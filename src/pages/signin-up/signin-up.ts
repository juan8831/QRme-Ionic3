import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { auth } from 'firebase';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';

import { firebase } from '@firebase/app';
import { User } from '../../models/user';
import { UserProvider } from '../../providers/user/user';


@IonicPage()
@Component({
  selector: 'page-signin-up',
  templateUrl: 'signin-up.html',
})
export class SigninUpPage {

  create = false;
  password: string;
  confirmPassword: string;
  private opt: string = 'signin';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninUpPage');
  }

  onCreate(form: NgForm) {
    var user = new User();
    user.name = form.value.name;
    user.email = form.value.email;
    user.eventAdminList = {};
    user.eventInviteeList = {};

    const loading = this.loadingCtrl.create({
      content: 'Creating your account...'
    });
    loading.present();

    this.afAuth.auth.createUserWithEmailAndPassword(form.value.email, form.value.password)
      .then(data => {
        user.id = data.uid;
        this.userProvider.addUser(user)
          .then(_ =>
            loading.dismiss()
          )
          .catch(error => {
            loading.dismiss();
            this.alertCtrl.create({
              title: 'Sign up error',
              message: error.message,
              buttons: ['Ok']
            }).present();
          });
      })
      .catch(error => {
        loading.dismiss();
        this.alertCtrl.create({
          title: 'Sign up error',
          message: error.message,
          buttons: ['Ok']
        }).present();
      });
  }



  onSignIn(form: NgForm) {
    const loading = this.loadingCtrl.create({
      content: 'Signing you in...'
    });
    loading.present();



    this.afAuth.auth.signInWithEmailAndPassword(form.value.email, form.value.password)
      .then(data => {
        loading.dismiss();
        //form.reset();
        this.toastCtrl.create({
          message: `Welcome ${this.authProvider.getEmail()}`,
          duration: 5000,
          position: 'bottom'
        }).present();
      })
      .catch(error => {
        loading.dismiss();
        this.alertCtrl.create({
          title: 'Sign in error',
          message: error.message,
          buttons: ['Ok']
        }).present();

      });

  }

  onGoogle() {

    // const loading = this.loadingCtrl.create({
    //   content: 'Signing you in...'
    // });
    //loading.present();

    //this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(data => {
        //loading.dismiss();
        //form.reset();
        this.toastCtrl.create({
          message: `Welcome ${this.authProvider.getEmail()}`,
          duration: 5000,
          position: 'bottom'
        }).present();
      })
      .catch(error => {
        //loading.dismiss();
        this.alertCtrl.create({
          title: 'Sign in error',
          message: error.message,
          buttons: ['Ok']
        }).present();

      });

  }

}
