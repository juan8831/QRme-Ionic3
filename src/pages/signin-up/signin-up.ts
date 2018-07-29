import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { User } from '../../models/user';
import { UserProvider } from '../../providers/user/user';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { ErrorProvider } from '../../providers/error/error';
import { MessagingProvider } from '../../providers/messaging/messaging';


@IonicPage()
@Component({
  selector: 'page-signin-up',
  templateUrl: 'signin-up.html',
})
export class SigninUpPage {

  create = false;
  password: string;
  confirmPassword: string;
  pageName = 'SignInUpPage';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private errorProvider: ErrorProvider,
    private mProv: MessagingProvider
  ) {
  }

  onCreate(form: NgForm) {
    var user = new User();
    user.name = form.value.name;
    user.email = form.value.email;
    let loading = this.mProv.getLoader('Creating your account...');
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
            this.errorProvider.reportError(this.pageName, error, undefined, 'Sign up error');
            this.mProv.showAlertOkMessage('Error','Sign up error. Please try again later.');
          });
      })
      .catch(error => {
        loading.dismiss();
        this.errorProvider.reportError(this.pageName, error, undefined, 'Sign up error');
        this.mProv.showAlertOkMessage('Error','Sign up error. Please try again later.');
      });
  }

  onSignIn(form: NgForm) {
    let loading = this.mProv.getLoader('Signing you in...');
    loading.present();
    this.afAuth.auth.signInWithEmailAndPassword(form.value.email, form.value.password)
      .then(() => {
        loading.dismiss();
        this.mProv.showToastMessage(`Welcome ${this.authProvider.getEmail()}`);
      })
      .catch(error => {
        loading.dismiss();
        this.errorProvider.reportError(this.pageName, error, undefined, 'Sign in error');
        this.mProv.showAlertOkMessage('Error','Sign in error. Please try again later.');
      });
  }

  forgotPassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }

}