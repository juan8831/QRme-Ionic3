import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, Content } from 'ionic-angular';
import { EditEventPage } from '../edit-event/edit-event';
import { EventProvider } from '../../providers/event/event';
//import { Observable } from '@firebase/util';
import { Event } from '../../models/event';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { Observable } from 'rxjs/Observable';
import { EventDetailPage } from '../event-detail/event-detail';
import { EventTabsPage } from '../event-tabs/event-tabs';
import { SelectedEventProvider } from '../../providers/selected-event/selected-event';
import { EventNewsPage } from '../event-news/event-news';

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})

export class EventsPage implements OnInit {

  events: Observable<any[]>;
  scrollAmount: number = 0;
  @ViewChild (Content) content: Content;


  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private eventProvider: EventProvider,
    private modalCtrl: ModalController,
    private selectEventProvider: SelectedEventProvider,
    private viewCtrl: ViewController
  ) {
  }

  ngOnInit(){
    this.content.ionScroll.subscribe(($event) => {
      this.scrollAmount = $event.scrollTop;
  });

  this.events = this.eventProvider.getEvents();

  }


  ionViewDidEnter() {

    // this.eventProvider.getEvents().subscribe(events =>
    // {
    //   this.events = events;
    // });

    
   // console.log(this.events);

    //this.content.scrollTo(0,this.selectEventProvider.getScrollPosition(), 150);
  }

  addEvent(){
    this.navCtrl.push(EditEventPage, {type : 'new'});
    //this.navCtrl.push(EventTabsPage);
    

    

  console.log(this.scrollAmount);
    
    

    //console.log(this.eventProvider.getEvents().);
    


  }

  onLoadEvent(event: Event){

    //this.modalCtrl.create(EventTabsPage, {event: event}).present();

    // this.selectEventProvider.setScrollPosition(this.scrollAmount);
    this.selectEventProvider.setEvent(event);
    // this.navCtrl.push(EventTabsPage);

    this.navCtrl.push(EventNewsPage);
    
    //push(EventTabsPage);
   
   //this.navCtrl.push(EventTabsPage, {event: event});
  //this.modalCtrl.create(EventTabsPage).present();

  }
  

}
