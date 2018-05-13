import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventDetailPage } from '../event-detail/event-detail';
import { TabsPage } from '../tabs/tabs';
import { EditEventPage } from '../edit-event/edit-event';


@IonicPage()
@Component({
  selector: 'page-event-news',
  templateUrl: 'event-news.html',
})
export class EventNewsPage {

  event: Event;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.event = this.navParams.get('event');
  }

  ionViewDidEnter(){
    this.event = this.navParams.get('event');
   //console.log(this.event);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventNewsPage');
  }

  onOpenInfo(){
    this.navCtrl.push(EventDetailPage, {event: this.event});
  }

  onGoHome(){
    this.navCtrl.setRoot(TabsPage);
  }

  onOpenEdit(){
    this.navCtrl.push(EditEventPage, {type: 'edit', event: this.event});
  }

  

}