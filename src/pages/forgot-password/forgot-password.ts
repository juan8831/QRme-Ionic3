import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  pageName = 'ForgotPasswordPage';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider
  ) {
  }

  onReset(f) {
    let email = f.value.email;
    this.afAuth.auth.sendPasswordResetEmail(email)
      .then(_ => {
        this.mProv.showAlertOkMessage('Success', `Password reset link sent to ${email}. Please check your email.`)
        this.navCtrl.pop();
      })
      .catch(err => {
        if(err.code == 'auth/user-not-found'){
          this.mProv.showAlertOkMessage('Error', 'This email is not registered.');
        }
        else{
          this.mProv.showAlertOkMessage('Error', 'Please try again later.');
          this.errorProvider.reportError(this.pageName, err, undefined, 'Could not send password reset email');
        }       
      });
  }

}
