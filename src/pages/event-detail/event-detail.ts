import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';
import { EditEventPage } from '../edit-event/edit-event';
import { Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';
import { of } from 'rxjs/observable/of';
import { FirebaseApp } from 'angularfire2';


@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {

  event: Event
  isManaging: boolean = false;
  eventPictureUrl: Observable<string | null>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private userProvider: UserProvider,
    private eventProvider: EventProvider,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private storage: AngularFireStorage,
    private firebase: FirebaseApp
  ) {
    this.event = navParams.get('event');
    this.isManaging = navParams.get('isManaging');
    this.eventPictureUrl = of('assets/imgs/calendar.png');

    // this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).getDownloadURL()
    //   .then(result => {
    //     this.eventPictureUrl = of(result);
    //     console.log('url event details ' + result);
    //   })
    //   .catch(err => {

    //     this.eventPictureUrl = of('assets/imgs/calendar.png');

    //   })

  }

  ionViewDidLoad() {
    console.log(this.event);
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
        console.log(err);
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

}
