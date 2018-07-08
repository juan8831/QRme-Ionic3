import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Event } from '../../models/event';
import { SocialSharing } from '@ionic-native/social-sharing';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

/**
 * Generated class for the EventQrcodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-qrcode',
  templateUrl: 'event-qrcode.html',
})
export class EventQrcodePage {

  event: Event;
  date: Date = null;
  code: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private socialSharing: SocialSharing
  ) {
    this.event = navParams.get('event');
    this.code = this.event.id;
    // this.date = navParams.get('date');

    // if(this.date == null){
    //   this.code = this.event.id;
    // }
    // else{
    //   this.code = 
    // }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventQrcodePage');
  }

  closePage(){
    this.viewCtrl.dismiss();
  }

  share(){
    var code = document.getElementById('code').innerHTML.slice(34);
    code = code.slice(0, code.length - 8 );
    this.socialSharing.share(null, null, code, null);
  }

}
