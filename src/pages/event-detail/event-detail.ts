import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';


@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {

  event: Event
  isManaging: boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private userProvider: UserProvider,
    private eventProvider: EventProvider,
    private toastCtrl: ToastController
  ) {
    this.event = navParams.get('event');
    this.isManaging = navParams.get('isManaging');

  }

  ionViewDidLoad() {
    console.log(this.event);
  }

  //delete event from userProfile.inviteeList & from the event.inviteeList
  onLeaveEvent(){
    const loader = this.loadingCtrl.create({content: 'Leaving event...'});
    loader.present();

    delete this.userProvider.userProfile.eventInviteeList[this.event.id];
    this.userProvider.updateUser(this.userProvider.userProfile)
    .then(_ =>{
      delete this.event.inviteeList[this.userProvider.userProfile.id];
      this.eventProvider.updateEvent(this.event)
      .then(_ =>{
        loader.dismiss();
        this.toastCtrl.create({message: `Successfully left the event: ${this.event.name}`, duration: 5000}).present();
        this.navCtrl.popToRoot();
      })
      .catch(err => {
        loader.dismiss();
        console.log(err);
      });

    })
    .catch(err => {
      loader.dismiss();
      console.log(err);
    });

  }

}
