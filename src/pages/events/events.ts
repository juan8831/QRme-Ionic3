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

  invitedEvents: Event[] = [];
  managingEvents: Event[] = [];
  searchText: string = "";
  events$: Observable<Event[]>;
  events: Event[];
  subscriptions: ISubscription[] = [];
  //scrollAmount: number = 0;
  //@ViewChild(Content) content: Content;

  segment = "managing";
  filteredEvents: Event[];


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

    if (this.userProvider.userProfile != null) {
      this.loadManagingEvents();
    }
    else {
      this.userProvider.getUserProfile().subscribe(user => {
        this.userProvider.userProfile = user;
        this.loadManagingEvents();
      });
    }



    //this.changeEventMode();
  }

  ngOnDestroy(): void {
    console.log('unsubscribe destory!');
    this.subscriptions.map(subscription => subscription.unsubscribe());

  }


  ionViewDidEnter() {
    //this.loadEvents();
  }

  private loadManagingEventsObservable() {
    this.events$ = this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.userProvider.getCurrentUserObservable().switchMap(user => {
          return this.eventProvider.getEventsForAdmin(Object.keys(user.eventAdminList))
            .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())));
        });
      }
    });
  }

  private async loadInvitedEventsObservable() {
    this.events$ = this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.userProvider.getCurrentUserObservable().switchMap(user => {
          return this.eventProvider.getEventsForAdmin(Object.keys(user.eventInviteeList))
            .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())));
        });
      }
    });
  }

  private loadManagingEvents() {

    var subscription = this.eventProvider.getEventsForAdmin(Object.keys(this.userProvider.userProfile.eventAdminList))
      .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())))
      .subscribe(events => {
        console.log(events);
        if (events) {
          this.managingEvents = events;
          this.loadInvitedEvents();
        }
      });
    this.subscriptions.push(subscription);
  }

  private loadInvitedEvents() {

    var subscription = this.eventProvider.getEventsForAdmin(Object.keys(this.userProvider.userProfile.eventInviteeList))
      .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())))
      .subscribe(events => {
        this.changeEventMode();
        console.log(events);
        if (events) {
          this.invitedEvents = events; 
        }
      });
    this.subscriptions.push(subscription);
    this.changeEventMode();
  }

  changeSearch() {
    this.filteredEvents = this.events.filter(event => event.name.toLowerCase().includes(this.searchText.toLowerCase()));
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
      this.events = this.managingEvents;
    }
    else {
      this.events = this.invitedEvents;
    }

    if (this.events != null) {
      this.changeSearch();
    }
  }


}
