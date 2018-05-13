import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { EditEventPage } from '../edit-event/edit-event';
import { EventProvider } from '../../providers/event/event';
//import { Observable } from '@firebase/util';
import { Event } from '../../models/event';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { Observable } from 'rxjs/Observable';
import { EventDetailPage } from '../event-detail/event-detail';
import { EventTabsPage } from '../event-tabs/event-tabs';

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {

  events: Observable<any[]>;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private eventProvider: EventProvider,
    private modalCtrl: ModalController
  ) {
  }


  ionViewDidEnter() {

    // this.eventProvider.getEvents().subscribe(events =>
    // {
    //   this.events = events;
    // });

    this.events = this.eventProvider.getEvents();
    console.log(this.events);
  }

  addEvent(){
    this.navCtrl.push(EditEventPage, {type : 'new'});
    //this.navCtrl.push(EventTabsPage);

    

    //console.log(this.eventProvider.getEvents().);
    


  }

  onLoadEvent(event: Event){
   
    this.navCtrl.push(EventTabsPage, {event: event});
  //this.modalCtrl.create(EventTabsPage).present();

  }
  

}
