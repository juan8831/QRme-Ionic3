import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppVersion } from '../../../node_modules/@ionic-native/app-version';
import { PrivacyPage } from '../privacy/privacy';

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  version = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private appVersion: AppVersion
  ) {
      this.appVersion.getVersionNumber()
      .then(value => {
        this.version = value;
      })
      .catch(err => {
        console.log('Cannot get app verison: ' + err);
      });
  }

  openPrivacyPolicy(){
    this.navCtrl.push(PrivacyPage);
  }

}
