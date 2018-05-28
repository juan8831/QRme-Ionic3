import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Event } from '../../models/event';
import { UserProvider } from '../../providers/user/user';
import { EventProvider } from '../../providers/event/event';


@IonicPage()
@Component({
  selector: 'page-search-event-detail',
  templateUrl: 'search-event-detail.html',
})
export class SearchEventDetailPage {

  event: Event;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private alertCtrl : AlertController,
    private toastCtrl: ToastController,
    private userProvider: UserProvider,
    private eventProvider: EventProvider
     
  ) {
    this.event = navParams.get('event');

  }

  ionViewDidLoad() {
  }

  requestInvite(){

  }

  //add user id to event invitee list && add the current even to the user's invitee list
  joinEvent(){
    const loader = this.loadingCtrl.create({content: 'Joining event...'}); 
    loader.present();

    this.userProvider.userProfile.eventInviteeList[this.event.id] = true;
    this.userProvider.addEventInviteeList(this.event.id)
    .then(_=> {
      if(!this.event.inviteeList){
        this.event.inviteeList = {};
      }
      this.event.inviteeList[this.userProvider.userProfile.id] = true;
      this.eventProvider.updateEvent(this.event)
      .then(_=> {
        this.toastCtrl.create({message: 'You have successfully joined the event', duration: 4000}).present();
        this.navCtrl.pop()
        loader.dismiss();
      })
      .catch(err => {
        this.toastCtrl.create({message: err, duration: 4000}).present();
        loader.dismiss();
      });
    })
    .catch(err => {
      this.toastCtrl.create({message: err, duration: 4000}).present();
      loader.dismiss();
    });
  }

}
