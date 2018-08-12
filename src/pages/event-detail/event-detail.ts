import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';
import { EditEventPage } from '../edit-event/edit-event';
import { Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';
import { of } from 'rxjs/observable/of';
import { FirebaseApp } from 'angularfire2';
import { EventQrcodePage } from '../event-qrcode/event-qrcode';
import { ErrorProvider } from '../../providers/error/error';
import { ISubscription } from '../../../node_modules/rxjs/Subscription';


@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage implements OnInit {

  event: Event;
  isManaging: boolean = false;
  pageName = 'EventDetailPage';
  subscriptions: ISubscription[] = [];
  startDate = new Date();
  endDate = new Date();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private userProvider: UserProvider,
    private eventProvider: EventProvider,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private storage: AngularFireStorage,
    private firebase: FirebaseApp,
    private modalCtrl: ModalController,
    private errorProvider: ErrorProvider
  ) {
    let eventId = navParams.get('event').id;
    this.isManaging = navParams.get('isManaging');
    let subs = this.eventProvider.getEvent(eventId).subscribe(event => {
      if (event) {
        this.event = event;
        this.startDate = eventProvider.getNextEventDate(this.event);
        this.endDate = eventProvider.getNextEventDateEnd(this.event);
      }
    });
    this.subscriptions.push(subs);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  //delete event from userProfile.inviteeList & from the event.inviteeList
  onLeaveEvent() {
    const loader = this.loadingCtrl.create({ content: 'Leaving event...' });
    loader.present();


    this.eventProvider.desynchronizeInviteeWithEvent(this.userProvider.userProfile.id, this.event.id)
      .then(_ => {
        loader.dismiss();
        this.toastCtrl.create({ message: `Successfully left the event: ${this.event.name}`, duration: 5000 }).present();
        this.navCtrl.popToRoot();
      })
      .catch(err => {
        loader.dismiss();
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not leave event');
        this.toastCtrl.create({ message: `Error, unable to leave event`, duration: 5000 }).present();
      });

  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Leave Event?',
      message: 'Are you sure you want to leave this event?',
      buttons: [
        {
          role: 'destructive',
          text: 'Yes',
          handler: () => {
            this.onLeaveEvent();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  onOpenEdit() {
    this.navCtrl.push(EditEventPage, { type: 'edit', event: this.event });
  }

  openQrpage() {
    let modal = this.modalCtrl.create(EventQrcodePage, { 'event': this.event });
    modal.present();
  }

}
