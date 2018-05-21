import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, Content, Events } from 'ionic-angular';
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
import { AngularFireAuth } from 'angularfire2/auth';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { mergeAll } from 'rxjs/operator/mergeAll';
import { UserProvider } from '../../providers/user/user';
import { ISubscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})

export class EventsPage implements OnInit {

  searchText: string = "";
  events$: Observable<Event[]>;
  events: Event[];
  subscription: ISubscription;
  //scrollAmount: number = 0;
  //@ViewChild(Content) content: Content;

  segment = "managing";


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private modalCtrl: ModalController,
    private selectEventProvider: SelectedEventProvider,
    private viewCtrl: ViewController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider
  ) {
  }

  ngOnInit() {
    //   // this.content.ionScroll.subscribe(($event) => {
    //   //   this.scrollAmount = $event.scrollTop;
    // });

    console.log('subscribing');
    this.loadManagingEvents();

  }

  ngOnDestroy(): void {
    console.log('unsubscribe destory!');
    this.subscription.unsubscribe();
    
  }


  ionViewDidEnter() {
    //this.loadEvents();
  }

  private loadManagingEventsObservable() {
    this.events$ = this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.userProvider.getCurrentUser().switchMap(user => {
          return this.eventProvider.getEventsForAdmin(Object.keys(user.eventAdminList))
            .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())));
          // .switchMap(events)
          // .subscribe(events => {
          //   console.log(events);
          //   if(events){
          //     this.events = events;
          //   }           
          // });
        });
      }
    });
  }

  private loadInvitedEventsObservable() {
    this.events$ = this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.userProvider.getCurrentUser().switchMap(user => {
          return this.eventProvider.getEventsForAdmin(Object.keys(user.eventInviteeList))
            .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())));
          // .switchMap(events)
          // .subscribe(events => {
          //   console.log(events);
          //   if(events){
          //     this.events = events;
          //   }           
          // });
        });
      }
    });
  }

  private loadManagingEvents() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userProvider.getCurrentUser().subscribe(user => {
          this.subscription = this.eventProvider.getEventsForAdmin(Object.keys(user.eventAdminList))
            .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())))
            .subscribe(events => {
              console.log(events);
              if (events) {
                this.events = events;
              }
            });
        });
      }
    });
  }

  private loadInvitedEvents() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        return this.userProvider.getCurrentUser().subscribe(user => {
          return this.eventProvider.getEventsForAdmin(Object.keys(user.eventAdminList))
            .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())))
            .subscribe(events => {
              console.log(events);
              if (events) {
                this.events = events;
              }
            });
        });
      }
    });
  }

  changeSearch() {
    this.changeEventMode();
  }

  ionViewWillLeave() {
    // this.subscription.unsubscribe();
    // console.log('unsubcribe events');
  }

  addEvent() {
    this.navCtrl.push(EditEventPage, { type: 'new' });
    //this.navCtrl.push(EventTabsPage);    
  }

  onLoadEvent(event: Event) {

    this.selectEventProvider.setEvent(event);
    this.navCtrl.push(EventNewsPage);

  }

  changeEventMode() {
    if (this.segment == 'managing') {
      this.loadManagingEvents();
    }
    else {
      this.loadInvitedEvents();
    }

  }


}
