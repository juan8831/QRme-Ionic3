import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ChangePasswordPage } from '../change-password/change-password';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth
  ) {
  }

  changePassword(){
    this.navCtrl.push(ChangePasswordPage, {'deleteAccount': false});
  }

  confirmDelete(){
    this.navCtrl.push(ChangePasswordPage, {'deleteAccount': true});
  }



}
