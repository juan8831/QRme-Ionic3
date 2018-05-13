import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the EventDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {

  event: Event

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.event = navParams.get('event');

  }

  ionViewDidLoad() {
    console.log(this.event);
  }

}
