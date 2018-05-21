import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PublicEventsPage } from '../public-events/public-events';
import { QrJoinEventPage } from '../qr-join-event/qr-join-event';
import { SearchEventsPage } from '../search-events/search-events';

@IonicPage()
@Component({
  selector: 'page-join-events',
  templateUrl: 'join-events.html',
})
export class JoinEventsPage {

  searchEventsPage = SearchEventsPage;
  qrJoinEventPage = QrJoinEventPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JoinEventsPage');
  }

}
