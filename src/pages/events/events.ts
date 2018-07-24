import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, Content, Events, AlertController, Loading } from 'ionic-angular';
import { EditEventPage } from '../edit-event/edit-event';
import { EventProvider } from '../../providers/event/event';
//import { Observable } from '@firebase/util';
import { Event } from '../../models/event';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { Observable } from 'rxjs/Observable';
import { EventDetailPage } from '../event-detail/event-detail';
import { EventTabsPage } from '../event-tabs/event-tabs';
import { EventNewsPage } from '../event-news/event-news';
import { AngularFireAuth } from 'angularfire2/auth';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { mergeAll } from 'rxjs/operator/mergeAll';
import { UserProvider } from '../../providers/user/user';
import { ISubscription } from 'rxjs/Subscription';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { FirebaseApp } from 'angularfire2';
import { EventListener } from '@angular/core/src/debug/debug_node';

const defaultEventImage = 'assets/imgs/calendar.png';

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
  manageSubscription: ISubscription = null;
  inviteeSubscription: ISubscription = null;
  //scrollAmount: number = 0;
  //@ViewChild(Content) content: Content;

  segment = "managing";
  filteredEvents: Event[];
  managingEventsLoaded = false;
  invitedEventsLoaded = false;
  loader: Loading


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private modalCtrl: ModalController,
    private viewCtrl: ViewController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private alertCtrl: AlertController,
    private mProv: MessagingProvider,
    private firebase: FirebaseApp
  ) {
  }

  ngOnInit() {
    //   // this.content.ionScroll.subscribe(($event) => {
    //   //   this.scrollAmount = $event.scrollTop;
    // });

    this.loader = this.mProv.getLoader('');
    //this.loader.present();

    this.afAuth.authState.take(1).subscribe(user => {
      //this.userProvider.getAdminList(user.uid);
      this.loadManagingEvents();
      this.loadInvitedEvents();
    })




    //this.changeEventMode();
  }

  ngOnDestroy(): void {
    console.log('unsubscribe destory!');
    this.subscriptions.map(subscription => subscription.unsubscribe());

    if (this.manageSubscription != null)
      this.manageSubscription.unsubscribe();
    if (this.inviteeSubscription != null)
      this.inviteeSubscription.unsubscribe();

  }


  ionViewDidEnter() {
    this.changeEventMode();
  }

  private loadManagingEvents() {
    var subs = this.userProvider.getEventAdminList().subscribe(events => {
      if (this.manageSubscription != null) {
        this.manageSubscription.unsubscribe();
      }
      if (!events || events == null) {
        this.managingEvents = [];
        return;
      }
      var nonExistentEvents: Event[] = [];
      var nonExistentEventNames = [];
      var adminEvents = events.events;
      if (!adminEvents || Object.keys(adminEvents).length == 0)
        this.managingEvents = [];
      else {
        this.manageSubscription = this.eventProvider.getEventsForAdmin(Object.keys(adminEvents))
          .map(events => {
            var existentEvents = [];
            events.forEach(event => {
              if (event) {
                if (event.name == null) {
                  nonExistentEvents.push(event);
                  nonExistentEventNames.push(adminEvents[event.id]);
                }

                else
                  existentEvents.push(event);
              }

            });
            return existentEvents;
          })
          .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())))
          .subscribe(events => {
            console.log(events);
            if (events) {

              this.managingEvents = events;
              this.events = this.managingEvents;
              this.changeEventMode()
              this.managingEventsLoaded = true;
              if (this.invitedEventsLoaded) {
                this.loader.dismiss();
              }
            }

            if (nonExistentEvents.length > 0) {
              this.userProvider.deleteAdminEventsForUser(nonExistentEvents)
                .then(_ => {
                  var title = "Events Deleted";
                  var message = "The following event(s) were deleted: " + nonExistentEventNames.toString();
                  this.mProv.showAlertOkMessage(title, message);
                  nonExistentEventNames = [];
                  nonExistentEvents = [];
                });

            }
          });
        //this.subscriptions.push(subscription);
      }
    });
    this.subscriptions.push(subs);
  }

  private loadInvitedEvents() {
    var subs = this.userProvider.getEventInviteeList().subscribe(events => {

      if (this.inviteeSubscription != null) {
        this.inviteeSubscription.unsubscribe();
      }

      if (!events || events == null) {
        this.invitedEvents = [];
        return;
      }

      var inviteeEvents = events.events;
      var nonExistentEvents: Event[] = [];
      var nonExistentEventNames = [];

      if (!inviteeEvents || Object.keys(inviteeEvents).length == 0)
        this.invitedEvents = [];
      else {
        this.inviteeSubscription = this.eventProvider.getEventsForAdmin(Object.keys(inviteeEvents))
          .map(events => {

            var existentEvents = [];
            events.forEach(event => {
              if (event) {
                if (event.name == null) {
                  nonExistentEvents.push(event);
                  nonExistentEventNames.push(inviteeEvents[event.id]);
                }

                else
                  existentEvents.push(event);
              }

            });
            return existentEvents;
          })
          .map(events => events.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase())))
          .subscribe(events => {
            //this.changeEventMode();
            console.log(events);
            if (events) {
              this.invitedEvents = events;
              this.changeEventMode();
              this.invitedEventsLoaded = true;
              if (this.managingEventsLoaded) {
                this.loader.dismiss();
              }
            }

            if (nonExistentEvents.length > 0) {
              this.userProvider.deleteInviteeEventsForUser(nonExistentEvents)
                .then(_ => {
                  var title = "Events Deleted";
                  var message = "The following event(s) were deleted: " + nonExistentEventNames.toString();
                  this.mProv.showAlertOkMessage(title, message);
                  nonExistentEventNames = [];
                  nonExistentEvents = [];
                });

            }

          });
      }
      //this.subscriptions.push(subs);
      //this.changeEventMode();

    });
    this.subscriptions.push(subs)
  }

  changeSearch() {
    this.filteredEvents = this.events.filter(event => event.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  addEvent() {
    this.navCtrl.push(EditEventPage, { type: 'new' }); 
  }

  onLoadEvent(event: Event) {
    this.navCtrl.push(EventNewsPage, {'eventId': event.id});
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

  getEventImage(event: Event) {
    this.firebase.storage().ref().child(`eventPictures/${event.id}`).getDownloadURL()
      .then(result => {
        return of(result);
      })
      .catch(err => {
        return of('assets/imgs/calendar.png');
      })

  }

}
