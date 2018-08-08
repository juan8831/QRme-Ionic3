import { Component } from '@angular/core';
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


@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {

  event: Event
  isManaging: boolean = false;
  eventPictureUrl: Observable<string | null>;
  pageName = 'EventDetailPage';

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
    this.event = navParams.get('event');
    this.isManaging = navParams.get('isManaging');
    this.eventPictureUrl = of('assets/imgs/calendar.png');
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

  openQrpage(){
    let modal = this.modalCtrl.create(EventQrcodePage, {'event': this.event});
    modal.present();
  }

}
