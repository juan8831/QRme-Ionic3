import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, AlertController, Loading } from 'ionic-angular';
import { EditEventPage } from '../edit-event/edit-event';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';
import { Observable } from 'rxjs/Observable';
import { EventNewsPage } from '../event-news/event-news';
import { AngularFireAuth } from 'angularfire2/auth';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { UserProvider } from '../../providers/user/user';
import { ISubscription } from 'rxjs/Subscription';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { FirebaseApp } from 'angularfire2';
import 'rxjs/add/operator/take';
import { TutorialPage } from '../tutorial/tutorial';
import { combineLatest } from 'rxjs/observable/combineLatest';

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
  segment = "managing";
  filteredEvents: Event[];
  loaderVisible = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private mProv: MessagingProvider,
    private firebase: FirebaseApp,
    private modalCtrl: ModalController
  ) {
  }

  ngOnInit() {
    this.afAuth.authState.take(1).subscribe(authUser => {
      if (authUser) {
        this.loadEvents(); 
      }
    });
    
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  private loadEvents() {
    let loader = this.mProv.getLoader('Loading your events...', 10000);
    this.loaderVisible = true;
    loader.present();
    let managingEvents$ = this.userProvider.getManagingEventIdsList()
      .switchMap(managingEvents => {
        if (managingEvents) {
          return this.eventProvider.getEventsWithIds(Object.keys(managingEvents.events));
        }
        else{
          return of(null);
        }
      });
    let invitedEvents$ = this.userProvider.getInvitedEventIdsList()
      .switchMap(invitedEvents => {
        if (invitedEvents) {
          return this.eventProvider.getEventsWithIds(Object.keys(invitedEvents.events));
        }
        else{
          return of(null);
        }
      });
    let subs = combineLatest(managingEvents$, invitedEvents$)
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not load events. Please try again later.')
        return of([]);
      })
      .subscribe(([managingEvents, invitedEvents]) => {
        if (managingEvents) {
          managingEvents = managingEvents.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase()));
          (managingEvents as Event []).forEach(event => {
            event.calculatedStart = this.eventProvider.getNextEventDate(event);
          });
          this.managingEvents = managingEvents;
          this.dismissLoader(loader);
        }
        if (invitedEvents) {
          invitedEvents = invitedEvents.filter(event => event != null && event.name.toLowerCase().includes(this.searchText.toLowerCase()));
          (invitedEvents as Event []).forEach(event => {
            event.calculatedStart = this.eventProvider.getNextEventDate(event);
          });
          this.invitedEvents = invitedEvents;
        }       
        this.changeEventMode();
      });
    this.subscriptions.push(subs);
  }

  private dismissLoader(loader: Loading) {
    if(this.loaderVisible){
      this.loaderVisible = false;
      loader.dismiss();
    }
  }

  changeSearch() {
    this.filteredEvents = this.events.filter(event => event.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  addEvent() {
    this.navCtrl.push(EditEventPage, { type: 'new' });
  }

  onLoadEvent(event: Event) {
    this.navCtrl.push(EventNewsPage, { 'eventId': event.id });
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
      .catch(() => {
        return of('assets/imgs/calendar.png');
      })

  }

  openTutorialPage() {
    this.modalCtrl.create(TutorialPage).present();
  }

}
