import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { User } from '../../models/user';
import { UserProvider } from '../../providers/user/user';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { ErrorProvider } from '../../providers/error/error';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AboutPage } from '../about/about';
import { Storage } from '@ionic/storage';
import { TutorialPage } from '../tutorial/tutorial';

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
  private opt: string = 'signin';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private errorProvider: ErrorProvider,
    private mProv: MessagingProvider,
    private storage: Storage,
    private modalCtrl: ModalController
  ) {
  }

  ionViewDidLoad(){
    this.storage.get('hasSeenTutorial')
      .then((hasSeenTutorial) => {
        if (!hasSeenTutorial) {
          this.storage.set('hasSeenTutorial', 'true');
          this.modalCtrl.create(TutorialPage).present();
        }
      });
  }

  onCreate(form: NgForm) {
    var user = new User();
    user.name = form.value.name;
    user.email = form.value.email;
    let loading = this.mProv.getLoader('Creating your account...', 0);
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
            this.mProv.showAlertOkMessage('Error','Sign up error. Please try again later.');
          });
      })
      .catch(error => {
        loading.dismiss();
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
        this.mProv.showAlertOkMessage('Error','Sign in error. Please try again later.');
      });
  }

  forgotPassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  openTutorialPage(){
    this.modalCtrl.create(TutorialPage).present();
  }

}