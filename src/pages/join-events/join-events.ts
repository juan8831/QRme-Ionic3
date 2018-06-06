import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PublicEventsPage } from '../public-events/public-events';
import { QrJoinEventPage } from '../qr-join-event/qr-join-event';
import { SearchEventsPage } from '../search-events/search-events';
import { ManageInvitesPage } from '../manage-invites/manage-invites';

@IonicPage()
@Component({
  selector: 'page-join-events',
  templateUrl: 'join-events.html',
})
export class JoinEventsPage {

  searchEventsPage = SearchEventsPage;
  qrJoinEventPage = QrJoinEventPage;
  manageInvitesPage = ManageInvitesPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JoinEventsPage');
  }

}
