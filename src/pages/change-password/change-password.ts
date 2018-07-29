import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { NgForm } from '../../../node_modules/@angular/forms';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';
import { firebase } from '../../../node_modules/@firebase/app';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { UserProvider } from '../../providers/user/user';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage implements OnInit {

  shouldDeleteAccount = false;
  opt: string;
  oldPassword: string;
  pageName = 'ChangePasswordPage';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private mProv: MessagingProvider,
    private alertCtrl: AlertController,
    private userProvider: UserProvider,
    private errorProvider: ErrorProvider
  ) {
  }

  ngOnInit(){
    this.shouldDeleteAccount = this.navParams.get('deleteAccount');
    this.opt = this.shouldDeleteAccount? 'deleteAccount' : 'changePassword';
  }

  onChangePassword(f: NgForm){
    let loader = this.mProv.getLoader('Updating password...')
    loader.present();
    let oldPassword = f.value.oldPassword;
    let newPassword = f.value.newPassword;
    let user = this.afAuth.auth.currentUser;
    let cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
    user.reauthenticateWithCredential(cred)
    .then(_=> {
      user.updatePassword(newPassword)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Password successfully updated');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not update password. Please try again.');
        this.errorProvider.reportError(this.pageName, err, undefined, 'Could not update password');
      })
    })
    .catch(() => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Please check that old password is correct.');
      });
  }

  onDeleteAccount(f: NgForm){
    let oldPassword = f.value.oldPassword;
    let confirm = this.alertCtrl.create({
      title: 'Delete Account?',
      subTitle: 'Are you sure you want to delete your account? All your created events will be deleted.',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteAccount(oldPassword);
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  /*
  Delete user auth account & user db account. Trigger onDeleteUser cloud function.
  */
  deleteAccount(oldPassword){
    let loader = this.mProv.getLoader('Authenticating account...');
    loader.present();
    let user = this.afAuth.auth.currentUser;
    let cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
    user.reauthenticateWithCredential(cred)
    .then(_=> {
      loader.setContent('Deleting account...')
      this.userProvider.deleteUser(user.uid)
      .then(_=> {
        user.delete()
        .then(_=> {
          loader.dismiss();
          this.mProv.showToastMessage('Account successfully deleted.');
          this.navCtrl.pop();
        })
        .catch(err => {
          loader.dismiss();
          this.errorProvider.reportError(this.pageName, err, undefined, 'Could not delete account');
          this.mProv.showAlertOkMessage('Error', 'Could not delete account. Please try again.');
        });       
      })
      .catch(err => {
        loader.dismiss();
        this.errorProvider.reportError(this.pageName, err, undefined, 'Could not delete account');
        this.mProv.showAlertOkMessage('Error', 'Could not delete account. Please try again.');
      })
    })
    .catch(() => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Please check that your password is correct.');
      });
    
  }

}
