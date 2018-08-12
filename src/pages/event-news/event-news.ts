import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, ModalController } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventDetailPage } from '../event-detail/event-detail';
import { EventAttendancePage } from '../event-attendance/event-attendance';
import { EventPollsPage } from '../event-polls/event-polls';
import { EventBlogPage } from '../event-blog/event-blog';
import { UserProvider } from '../../providers/user/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { EventProvider } from '../../providers/event/event';
import { EventInviteesPage } from '../event-invitees/event-invitees';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseApp } from 'angularfire2';
import { EventAttendanceAdminPage } from '../event-attendance-admin/event-attendance-admin';
import { EventQrcodePage } from '../event-qrcode/event-qrcode';
import { MessagingProvider } from '../../providers/messaging/messaging';
import {timer} from 'rxjs/observable/timer';
import { ISubscription } from '../../../node_modules/rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-event-news',
  templateUrl: 'event-news.html',
})
export class EventNewsPage implements OnInit {

  event: Event;
  eventAttendancePage = EventAttendancePage;
  eventInviteesPage = EventInviteesPage;
  eventBlogPage = EventBlogPage;
  eventPollsPage = EventPollsPage;
  isManaging: boolean = false;
  showSplash = true;
  subscriptions: ISubscription[] = [];
  startDate = new Date();
  endDate = new Date();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    private modalCtrl: ModalController,
    private eventProvider: EventProvider,
    private mProv: MessagingProvider
  ) {
  }

  ngOnInit(): void {
    timer(500).subscribe((() => this.showSplash = false ));
    let eventId = this.navParams.get('eventId');
    let subs = this.eventProvider.getEvent(eventId)
    .catch(() => {
      this.mProv.showAlertOkMessage('Error', 'Could not load event. Please try again later.')
      return null;
    })
    .subscribe((event : Event) => {
      if(event == null || event.name == null){
        this.mProv.showAlertOkMessage('Event Deleted', 'The event has been deleted.');
        this.navCtrl.popToRoot();
        return;
      }
      this.event = event;
      this.isManaging = this.eventProvider.isEventAdmin(this.event, undefined, undefined);
      this.startDate = this.eventProvider.getNextEventDate(this.event);
      this.endDate = this.eventProvider.getNextEventDateEnd(this.event);
    });
    this.subscriptions.push(subs);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  onOpenInfo() {
    this.navCtrl.push(EventDetailPage, { 'event': this.event, 'isManaging': this.isManaging });
  }

  openAttendance() {
    if (this.isManaging) {
      this.navCtrl.push(EventAttendanceAdminPage,{ 'event': this.event });
    }
    else {
      this.navCtrl.push(EventAttendancePage, { 'event': this.event });
    }
  }

  openQrpage() {
    let modal = this.modalCtrl.create(EventQrcodePage, { 'event': this.event });
    modal.present();
  }
}